import type { TransportService } from "../base/TransportService";
import {
    pageQuery,
    unwrapOne,
    unwrapPage,
    type PageRequestDTO,
    type PaginationBaseResponseDTO,
} from "../../models/dto/base.dto";
import type {
    ChunkQueryDTO,
    DimensionType,
    MerchantResponseDTO,
    ObjectMutationDTO,
    ProductResponseDTO,
    SceneObjectDTO,
    SceneResponseDTO,
} from "../../models/dto/mesh.dto";
import type { SocketTransportService } from "../realtime/SocketTransportService";
export default class GameContentService {
    private static INSTANCE: GameContentService;
    public constructor(
        private readonly transport: TransportService,
        private readonly socket?: SocketTransportService,
    ) {}
    public static getInstance(transport: TransportService, socket?: SocketTransportService) {
        return (this.INSTANCE ??= new GameContentService(transport, socket));
    }
    private async one<T>(path: string, method: "GET" | "POST" | "PUT" | "DELETE" = "GET", body?: unknown) {
        return unwrapOne(await this.transport.request<PaginationBaseResponseDTO<T>>(path, method, body));
    }
    public async findPage(request: PageRequestDTO = {}) {
        return unwrapPage(
            await this.transport.request<PaginationBaseResponseDTO<SceneResponseDTO>>(
                `/game/scenes?${pageQuery(request)}`,
            ),
        );
    }
    public findById(type: DimensionType, id: string, draft = false) {
        return this.one<SceneResponseDTO>(`/game/${type}/${encodeURIComponent(id)}${draft ? "/draft" : ""}`);
    }
    public async findChunk(query: ChunkQueryDTO, request: PageRequestDTO = {}, signal?: AbortSignal) {
        if (!this.socket) throw new Error("Chunk streaming is not configured.");
        return unwrapPage(
            await this.socket.request<SceneObjectDTO>(
                "/app/game/chunks",
                { ...query, search: request.search, page: request.page || 0, size: Math.min(20, request.size || 20) },
                signal,
            ),
        );
    }
    public async loadNearby(query: ChunkQueryDTO, signal?: AbortSignal) {
        const objects: SceneObjectDTO[] = [];
        let page = 0,
            totalPages = 1;
        while (page < totalPages) {
            signal?.throwIfAborted();
            const result = await this.findChunk(query, { page, size: 20 }, signal);
            if (result.pageNumber !== page || result.totalPages > 500) throw new Error("Invalid chunk page sequence.");
            if (page && totalPages !== result.totalPages)
                throw new Error("The space changed while loading. Retry the view.");
            totalPages = result.totalPages;
            objects.push(...result.content);
            page++;
        }
        return objects;
    }
    public async saveDraft(scene: SceneResponseDTO, before: SceneObjectDTO[] = []) {
        const changes: ObjectMutationDTO[] = [
            ...scene.objects
                .filter((o) => JSON.stringify(before.find((b) => b.id === o.id)) !== JSON.stringify(o))
                .map((object) => ({ operation: "UPSERT" as const, id: object.id, object })),
            ...before
                .filter((o) => !scene.objects.some((n) => n.id === o.id))
                .map((object) => ({ operation: "DELETE" as const, id: object.id })),
        ];
        const path = `/game/${scene.type}/${scene.id}/draft/transactions`;
        const transaction = await this.one<{ id: string }>(path, "POST", {
            version: scene.version,
            draftRevision: scene.draftRevision || 0,
        });
        for (let offset = 0; offset < changes.length; offset += 20) {
            await this.one(`${path}/${transaction.id}/pages`, "PUT", {
                content: changes.slice(offset, offset + 20),
                pageNumber: offset / 20,
                pageSize: 20,
                totalPages: Math.ceil(changes.length / 20),
                totalElements: changes.length,
            });
        }
        const result = await this.one<SceneResponseDTO>(`${path}/${transaction.id}/commit`, "POST", {
            name: scene.name,
            description: scene.description,
            version: scene.version,
            pageCount: Math.ceil(changes.length / 20),
        });
        return { ...result, objects: scene.objects };
    }
    public discardDraft(scene: SceneResponseDTO) {
        return this.one<boolean>(`/game/${scene.type}/${scene.id}/draft`, "DELETE");
    }
    public async publish(scene: SceneResponseDTO) {
        const result = await this.one<SceneResponseDTO>(`/game/${scene.type}/${scene.id}/publish`, "POST", {
            version: scene.version,
            draftRevision: scene.draftRevision || 0,
        });
        return { ...result, objects: scene.objects };
    }
    public async create(scene: SceneResponseDTO) {
        const result = await this.one<SceneResponseDTO>(`/game/${scene.type}`, "POST", { ...scene, objects: [] });
        return scene.objects.length ? this.saveDraft({ ...result, objects: scene.objects }) : result;
    }
    public async findProducts(request: PageRequestDTO = {}) {
        return unwrapPage(
            await this.transport.request<PaginationBaseResponseDTO<ProductResponseDTO>>(
                `/game/products?${pageQuery(request)}`,
            ),
        );
    }
    public findProduct(id: string) {
        return this.one<ProductResponseDTO>(`/game/products/${encodeURIComponent(id)}`);
    }
    public async findMerchants(request: PageRequestDTO = {}) {
        return unwrapPage(
            await this.transport.request<PaginationBaseResponseDTO<MerchantResponseDTO>>(
                `/game/merchants?${pageQuery(request)}`,
            ),
        );
    }
    public approveMerchant(id: string) {
        return this.one<MerchantResponseDTO>(`/game/merchants/${encodeURIComponent(id)}/approve`, "POST");
    }
}
