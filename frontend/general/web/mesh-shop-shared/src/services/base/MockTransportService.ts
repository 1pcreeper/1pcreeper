import type { TransportService } from "./TransportService";
import { paginate, type APIBaseResponseDTO, type PageRequestDTO } from "../../models/dto/base.dto";
import type {
    MeshResponseDTO,
    MockStateDTO,
    SceneResponseDTO,
    TextureResponseDTO,
    ObjectMutationDTO,
} from "../../models/dto/mesh.dto";
import MockRepositoryService from "../storage/MockRepositoryService";
import { products } from "../../mock/catalog";
import { meshSummary, stripInteraction } from "../../mock/migrate";
const sceneSummary = (scene: SceneResponseDTO) => ({ ...scene, objectCount: scene.objects.length, objects: [] });
const nextId = (items: { id: string }[]) => String(Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1);
export default class MockTransportService implements TransportService {
    public constructor(public readonly repository = MockRepositoryService.getInstance()) {}
    public async request<T>(
        path: string,
        method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
        body?: unknown,
    ): Promise<APIBaseResponseDTO<T>> {
        try {
            const url = new URL(path, "https://mock.local"),
                parts = url.pathname.split("/").filter(Boolean);
            const input = body as any;
            const request: PageRequestDTO = {
                page: Number(url.searchParams.get("page") || 0),
                size: Number(url.searchParams.get("size") || 20),
            };
            const search = (url.searchParams.get("search") || "").toLowerCase(),
                category = url.searchParams.get("category"),
                status = url.searchParams.get("status"),
                type = url.searchParams.get("type");
            const filter = <R extends { name: string; category?: string; status?: string; type?: string }>(
                items: R[],
            ) =>
                items.filter(
                    (item) =>
                        item.name.toLowerCase().includes(search) &&
                        (!category || item.category === category) &&
                        (!status || item.status === status) &&
                        (!type || item.type === type),
                );
            let result: unknown;
            let list = false;
            if (parts[0] === "account")
                return {
                    success: true,
                    message: "",
                    data: {
                        id: 1,
                        uid: "mock-admin",
                        name: "Alex Morgan",
                        displayName: "Alex Morgan",
                        email: "alex@example.test",
                        roles: ["ADMIN", "STAFF"],
                    } as T,
                };
            if (parts[0] === "game" && parts[1] === "products") {
                list = !parts[2];
                result = list ? filter(products) : products.find((p) => p.id === parts[2]);
            } else if (parts[0] === "game" && parts[1] === "merchants") {
                if (method === "GET") {
                    list = true;
                    result = filter((await this.repository.read()).merchants);
                } else
                    result = await this.repository.update((state) => {
                        const merchant = state.merchants.find((m) => m.id === parts[2]);
                        if (!merchant) throw new Error("Merchant not found.");
                        merchant.status = "APPROVED";
                        return merchant;
                    });
            } else if (parts[0] === "game" && parts[1] === "scenes") {
                list = true;
                result = filter((await this.repository.read()).scenes).map(sceneSummary);
            } else if (parts[0] === "game" && ["maps", "spots", "places"].includes(parts[1])) {
                const key = `${parts[1]}/${parts[2]}`;
                if (method === "GET") {
                    const state = await this.repository.read();
                    const scene =
                        parts[3] === "draft"
                            ? state.drafts[key] || state.scenes.find((s) => `${s.type}/${s.id}` === key)
                            : state.scenes.find((s) => `${s.type}/${s.id}` === key && s.status === "PUBLISHED");
                    result = scene && sceneSummary(scene);
                } else if (method === "POST" && !parts[2]) {
                    result = await this.repository.update((state) => {
                        if (!input.name?.trim()) throw new Error("A space name is required.");
                        if (
                            parts[1] !== "maps" &&
                            !state.merchants.some((m) => m.id === input.merchantId && m.status === "APPROVED")
                        )
                            throw new Error("Choose an approved merchant.");
                        const scene = {
                            ...input,
                            objects: [],
                            type: parts[1],
                            id: nextId(state.scenes.filter((s) => s.type === parts[1])),
                            uid: crypto.randomUUID(),
                            status: "DRAFT",
                            version: 0,
                            updatedAt: new Date().toISOString(),
                        } as SceneResponseDTO;
                        state.scenes.push(scene);
                        state.drafts[`${scene.type}/${scene.id}`] = structuredClone(scene);
                        return sceneSummary(scene);
                    });
                } else if (parts[3] === "draft" && parts[4] === "transactions") {
                    result = await this.repository.update((state) => {
                        const original = state.scenes.find((s) => `${s.type}/${s.id}` === key);
                        if (!original) throw new Error("Space not found.");
                        state.transactions ??= {};
                        for (const [id, tx] of Object.entries(state.transactions))
                            if (Date.now() - tx.createdAt > 300000) delete state.transactions[id];
                        if (!parts[5]) {
                            if (input.version !== original.version)
                                throw new Error("A newer version was published. Reload before saving.");
                            if (
                                (input.draftRevision || 0) !==
                                (state.drafts[key]?.draftRevision || original.draftRevision || 0)
                            )
                                throw new Error("The draft changed elsewhere. Reload before saving.");
                            const id = crypto.randomUUID();
                            state.transactions[id] = {
                                id,
                                key,
                                baseVersion: original.version,
                                baseRevision: input.draftRevision || 0,
                                changes: [],
                                nextPage: 0,
                                createdAt: Date.now(),
                            };
                            return { id };
                        }
                        const tx = state.transactions[parts[5]];
                        if (!tx || tx.key !== key || tx.baseVersion !== original.version)
                            throw new Error("The draft transaction expired or a newer version was published.");
                        if (parts[6] === "pages") {
                            if (
                                !Array.isArray(input.content) ||
                                input.content.length > 20 ||
                                input.pageNumber !== tx.nextPage
                            )
                                throw new Error("Draft pages must arrive in order with at most 20 changes.");
                            for (const change of input.content as ObjectMutationDTO[]) {
                                if (
                                    !["UPSERT", "DELETE"].includes(change.operation) ||
                                    !change.id ||
                                    (change.operation === "UPSERT" && change.object?.id !== change.id)
                                )
                                    throw new Error("Invalid object change.");
                            }
                            tx.changes.push(...input.content);
                            tx.nextPage++;
                            return { id: tx.id };
                        }
                        if (
                            parts[6] !== "commit" ||
                            input.pageCount !== tx.nextPage ||
                            input.version !== tx.baseVersion
                        )
                            throw new Error("Incomplete draft transaction.");
                        const previous = state.drafts[key] || original;
                        if ((previous.draftRevision || 0) !== tx.baseRevision)
                            throw new Error("The draft changed elsewhere. Reload before saving.");
                        const objects = new Map(previous.objects.map((o) => [o.id, o]));
                        for (const change of tx.changes) {
                            if (change.operation === "DELETE") objects.delete(change.id);
                            else objects.set(change.id, change.object!);
                        }
                        const draft = {
                            ...previous,
                            draftRevision: tx.baseRevision + 1,
                            name: input.name,
                            description: input.description,
                            objects: [...objects.values()],
                            status: "DRAFT" as const,
                            updatedAt: new Date().toISOString(),
                        };
                        if (!draft.name?.trim()) throw new Error("A space name is required.");
                        state.drafts[key] = draft;
                        delete state.transactions[tx.id];
                        return sceneSummary(draft);
                    });
                } else if (parts[3] === "publish" && method === "POST") {
                    result = await this.repository.update((state) => {
                        const current = state.scenes.find((s) => `${s.type}/${s.id}` === key),
                            draft = state.drafts[key];
                        if (!current || !draft) throw new Error("Save a draft before publishing.");
                        if (current.version !== input.version || draft.version !== current.version)
                            throw new Error("A newer version was published. Reload before publishing.");
                        if ((input.draftRevision || 0) !== (draft.draftRevision || 0))
                            throw new Error("The draft changed elsewhere. Reload before publishing.");
                        for (const object of draft.objects) {
                            if (
                                ![...object.position, ...object.rotation, ...object.scale].every(Number.isFinite) ||
                                object.scale.some((value) => value <= 0)
                            )
                                throw new Error("Object transformations must be finite with positive scales.");
                            const interaction = object.interaction;
                            if (
                                interaction?.type === "PRODUCT" &&
                                !products.some((product) => product.id === interaction.productId)
                            )
                                throw new Error("Choose a valid product before publishing.");
                            if (interaction?.type === "TELEPORT") {
                                const destination = interaction.destination;
                                if (![...destination.position, destination.yaw].every(Number.isFinite))
                                    throw new Error("Teleport arrival must be a finite position and direction.");
                                if (
                                    !state.scenes.some(
                                        (scene) =>
                                            scene.type === destination.type &&
                                            scene.id === destination.id &&
                                            (scene.status === "PUBLISHED" || `${scene.type}/${scene.id}` === key),
                                    )
                                )
                                    throw new Error("Publish the destination space before linking to it.");
                            }
                            if (object.assetId && !state.meshVersions?.[`${object.assetId}@${object.assetVersionId}`])
                                throw new Error(
                                    `Mesh version ${object.assetId}/${object.assetVersionId} is unavailable.`,
                                );
                        }
                        Object.assign(current, structuredClone(draft), {
                            status: "PUBLISHED",
                            version: current.version + 1,
                            updatedAt: new Date().toISOString(),
                        });
                        delete state.drafts[key];
                        return sceneSummary(current);
                    });
                } else if (parts[3] === "draft" && method === "DELETE") {
                    result = await this.repository.update((state) => {
                        delete state.drafts[key];
                        return true;
                    });
                }
            } else if (parts[0] === "mesh" && parts[1] === "assets") {
                if (method === "GET") {
                    const state = await this.repository.read();
                    if (parts[3] === "objects") {
                        const asset = state.meshVersions?.[`${parts[2]}@${url.searchParams.get("versionId")}`];
                        if (!asset) throw new Error("Mesh source version not found.");
                        list = true;
                        result = asset.objects;
                    } else if (parts[2]) {
                        const asset = state.meshes.find((m) => m.id === parts[2]);
                        result = asset && meshSummary(asset);
                    } else {
                        list = true;
                        result = filter(state.meshes).map(meshSummary);
                    }
                } else
                    result = await this.repository.update((state) => {
                        const assetInput = input as MeshResponseDTO;
                        if (!assetInput.name?.trim() || !assetInput.objects.length)
                            throw new Error("Add a name and at least one model before committing.");
                        const current = state.meshes.find((m) => m.id === parts[2]);
                        if (parts[2] && !current) throw new Error("Mesh not found.");
                        if (current && current.version !== assetInput.version)
                            throw new Error("This mesh was updated elsewhere. Reload before committing.");
                        const id = current?.id || nextId(state.meshes),
                            version = (current?.version || 0) + 1;
                        const asset: MeshResponseDTO = {
                            ...assetInput,
                            objects: assetInput.objects.map(stripInteraction),
                            id,
                            version,
                            versionId: `${id}-v${version}`,
                            status: "PUBLISHED",
                            updatedAt: new Date().toISOString(),
                        };
                        if (current) Object.assign(current, asset);
                        else state.meshes.push(asset);
                        state.meshVersions ??= {};
                        state.meshVersions[`${id}@${asset.versionId}`] = structuredClone(asset);
                        return meshSummary(asset);
                    });
            } else if (parts[0] === "mesh" && parts[1] === "textures") {
                if (method === "GET") {
                    const textures = (await this.repository.read()).textures;
                    list = !parts[2];
                    result = list ? filter(textures) : textures.find((t) => t.id === parts[2]);
                } else
                    result = await this.repository.update((state) => {
                        const texture = input as TextureResponseDTO;
                        state.textures.push(texture);
                        return texture;
                    });
            }
            if (result === undefined) throw new Error("This resource could not be found.");
            return {
                success: true,
                message: "",
                data: paginate(list ? (result as unknown[]) : [result], list ? request : { size: 1 }) as T,
            };
        } catch (error) {
            return { success: false, message: error instanceof Error ? error.message : "Request failed.", data: null };
        }
    }
}
