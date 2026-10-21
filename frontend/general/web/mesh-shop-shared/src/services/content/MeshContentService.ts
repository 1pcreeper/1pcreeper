import type { TransportService } from "../base/TransportService";
import {
    pageQuery,
    unwrapPage,
    unwrapOne,
    type PageRequestDTO,
    type PaginationBaseResponseDTO,
} from "../../models/dto/base.dto";
import type { MeshResponseDTO, SceneObjectDTO, TextureResponseDTO } from "../../models/dto/mesh.dto";
import { stripInteraction } from "../../mock/migrate";
export default class MeshContentService {
    private static INSTANCE: MeshContentService;
    public constructor(private readonly transport: TransportService) {}
    public static getInstance(transport: TransportService) {
        return (this.INSTANCE ??= new MeshContentService(transport));
    }
    public async findPage(request: PageRequestDTO = {}) {
        return unwrapPage(
            await this.transport.request<PaginationBaseResponseDTO<MeshResponseDTO>>(
                `/mesh/assets?${pageQuery(request)}`,
            ),
        );
    }
    public async findById(id: string, source = true) {
        const mesh = unwrapOne(
            await this.transport.request<PaginationBaseResponseDTO<MeshResponseDTO>>(
                `/mesh/assets/${encodeURIComponent(id)}`,
            ),
        );
        if (!source) return mesh;
        const objects: SceneObjectDTO[] = [];
        let page = 0,
            totalPages = 1;
        while (page < totalPages) {
            const result = unwrapPage(
                await this.transport.request<PaginationBaseResponseDTO<SceneObjectDTO>>(
                    `/mesh/assets/${id}/objects?${pageQuery({ page })}&versionId=${encodeURIComponent(mesh.versionId!)}`,
                ),
            );
            if (result.pageNumber !== page || result.totalPages > 100) throw new Error("Invalid mesh source pages.");
            objects.push(...result.content);
            totalPages = result.totalPages;
            page++;
        }
        return { ...mesh, objects };
    }
    public async commit(asset: MeshResponseDTO) {
        // Reusable source geometry never owns gameplay behavior.
        const clean = { ...asset, objects: asset.objects.map(stripInteraction) };
        const result = unwrapOne(
            await this.transport.request<PaginationBaseResponseDTO<MeshResponseDTO>>(
                `/mesh/assets${asset.id ? `/${asset.id}` : ""}`,
                asset.id ? "PUT" : "POST",
                clean,
            ),
        );
        return { ...result, objects: clean.objects };
    }
    public async findTextures(request: PageRequestDTO = {}) {
        return unwrapPage(
            await this.transport.request<PaginationBaseResponseDTO<TextureResponseDTO>>(
                `/mesh/textures?${pageQuery(request)}`,
            ),
        );
    }
    public async findTexture(id: string) {
        return unwrapOne(
            await this.transport.request<PaginationBaseResponseDTO<TextureResponseDTO>>(
                `/mesh/textures/${encodeURIComponent(id)}`,
            ),
        );
    }
    public async createTexture(texture: TextureResponseDTO) {
        return unwrapOne(
            await this.transport.request<PaginationBaseResponseDTO<TextureResponseDTO>>(
                "/mesh/textures",
                "POST",
                texture,
            ),
        );
    }
}
