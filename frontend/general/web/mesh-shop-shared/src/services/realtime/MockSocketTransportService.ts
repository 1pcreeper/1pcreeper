import { Group } from "three";
import { paginate, type APIBaseResponseDTO, type PaginationBaseResponseDTO } from "../../models/dto/base.dto";
import type { ChunkQueryDTO, MeshFragmentDTO, MeshResponseDTO } from "../../models/dto/mesh.dto";
import type { SocketTransportService } from "./SocketTransportService";
import MockRepositoryService from "../storage/MockRepositoryService";
import ModelFactoryService from "../content/ModelFactoryService";
import { workspaceService } from "../content/WorkspaceService";
import { withinChunks } from "../content/ChunkService";
export const FRAGMENT_BYTES = 12 * 1024;
export async function sha256(bytes: Uint8Array) {
    return [...new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(bytes).buffer))]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
export default class MockSocketTransportService implements SocketTransportService {
    private binaries = new Map<string, Promise<MeshFragmentDTO[]>>();
    public constructor(
        private readonly repository = MockRepositoryService.getInstance(),
        private readonly produce?: (mesh: MeshResponseDTO) => Promise<Blob>,
    ) {}
    private async fragments(mesh: MeshResponseDTO) {
        const key = `${mesh.id}@${mesh.versionId}`;
        if (this.binaries.has(key)) return this.binaries.get(key)!;
        const promise = (async () => {
            let blob: Blob;
            if (this.produce) blob = await this.produce(mesh);
            else if (mesh.glbUrl) blob = await (await fetch(mesh.glbUrl)).blob();
            else {
                const factory = new ModelFactoryService(),
                    group = new Group();
                const state = await this.repository.read();
                try {
                    for (const source of mesh.objects) {
                        const model = await factory.create(
                            { ...source, assetId: undefined, assetVersionId: undefined },
                            [],
                            state.textures,
                        );
                        model.position.set(...source.position);
                        model.rotation.set(...source.rotation);
                        model.scale.set(...source.scale);
                        group.add(model);
                    }
                    blob = await workspaceService.exportGLB(group);
                } finally {
                    factory.dispose(group);
                }
            }
            const bytes = new Uint8Array(await blob.arrayBuffer()),
                hash = await sha256(bytes),
                count = Math.ceil(bytes.length / FRAGMENT_BYTES);
            return Array.from({ length: count }, (_, index) => ({
                meshId: mesh.id,
                versionId: mesh.versionId!,
                index,
                fragmentCount: count,
                byteLength: bytes.length,
                sha256: hash,
                base64: btoa(
                    String.fromCharCode(...bytes.subarray(index * FRAGMENT_BYTES, (index + 1) * FRAGMENT_BYTES)),
                ),
            }));
        })();
        this.binaries.set(key, promise);
        promise.catch(() => this.binaries.delete(key));
        return promise;
    }
    public async request<T>(
        destination: string,
        payload: Record<string, unknown>,
        signal?: AbortSignal,
    ): Promise<APIBaseResponseDTO<PaginationBaseResponseDTO<T>>> {
        signal?.throwIfAborted();
        try {
            const state = await this.repository.read();
            let content: unknown[];
            if (destination === "/app/game/chunks") {
                const query = payload as unknown as ChunkQueryDTO;
                if (![query.x, query.z].every(Number.isInteger)) throw new Error("Invalid chunk coordinates.");
                const key = `${query.type}/${query.id}`;
                const scene = query.draft
                    ? state.drafts[key] || state.scenes.find((s) => `${s.type}/${s.id}` === key)
                    : state.scenes.find((s) => `${s.type}/${s.id}` === key && s.status === "PUBLISHED");
                if (!scene) throw new Error("This space could not be found.");
                if (scene.version !== query.snapshotVersion)
                    throw new Error("The space changed while loading. Reload to get its new version.");
                if (query.draft && (query.draftRevision || 0) !== (scene.draftRevision || 0))
                    throw new Error("The draft changed while loading. Reload its current revision.");
                content = scene.objects
                    .filter(
                        (object) =>
                            withinChunks(object, query) &&
                            (!query.interactiveOnly || object.interaction) &&
                            object.name.toLowerCase().includes(String(payload.search || "").toLowerCase()),
                    )
                    .sort((a, b) => a.id.localeCompare(b.id));
            } else if (destination === "/app/mesh/fragments") {
                const mesh = state.meshVersions?.[`${payload.meshId}@${payload.versionId}`];
                if (!mesh) throw new Error("The requested mesh version could not be found.");
                content = await this.fragments(mesh);
            } else throw new Error("Unknown streaming destination.");
            signal?.throwIfAborted();
            return {
                success: true,
                message: "",
                data: paginate(content, {
                    page: Number(payload.page || 0),
                    size:
                        destination === "/app/mesh/fragments"
                            ? Math.min(3, Number(payload.size || 3))
                            : Number(payload.size || 20),
                }) as PaginationBaseResponseDTO<T>,
            };
        } catch (error) {
            if (signal?.aborted) throw error;
            return { success: false, message: error instanceof Error ? error.message : "Stream failed.", data: null };
        }
    }
}
