import officeAPI from "@/api/office.api";
import { VITE_OFFICE_BASE_URL } from "@/config/env.config";
import { ExplorerFolderCreateRequestDTO, ExplorerItemDeleteRequestDTO, ExplorerItemMoveRequestDTO } from "@/models/dto/office/transport/request.dto";
import { ExplorerItemResponseDTO, VehicleExplorerResponseDTO } from "@/models/dto/office/transport/response.dto";

export default class VehicleExplorerContentService {
    private static readonly INSTANCE: VehicleExplorerContentService;
    private constructor() {
    }
    public static getInstance(): VehicleExplorerContentService {
        if (VehicleExplorerContentService.INSTANCE) {
            return VehicleExplorerContentService.INSTANCE;
        }
        return new VehicleExplorerContentService();
    }

    public async getExplorer(vehicleId: number, folder?: string): Promise<VehicleExplorerResponseDTO> {
        const query = folder ? `?folder=${encodeURIComponent(folder)}` : "";
        return await officeAPI<null, VehicleExplorerResponseDTO>(
            `/transport/vehicles/${vehicleId}/explorer${query}`,
            "GET",
            null
        );
    }

    public async createFolder(vehicleId: number, folderName: string, parentPath?: string): Promise<ExplorerItemResponseDTO> {
        return await officeAPI<ExplorerFolderCreateRequestDTO, ExplorerItemResponseDTO>(
            `/transport/vehicles/${vehicleId}/explorer/folders`,
            "POST",
            { folderName, parentPath }
        );
    }

    public async uploadFile(vehicleId: number, file: File, folderPath: string): Promise<ExplorerItemResponseDTO> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folderPath", folderPath || "");
        return await officeAPI<FormData, ExplorerItemResponseDTO>(
            `/transport/vehicles/${vehicleId}/explorer/files`,
            "POST",
            formData
        );
    }

    public async deleteItem(vehicleId: number, relativePath: string): Promise<void> {
        return await officeAPI<ExplorerItemDeleteRequestDTO, void>(
            `/transport/vehicles/${vehicleId}/explorer/items`,
            "DELETE",
            { relativePath }
        );
    }

    public async moveItem(vehicleId: number, sourcePath: string, targetPath: string): Promise<ExplorerItemResponseDTO> {
        return await officeAPI<ExplorerItemMoveRequestDTO, ExplorerItemResponseDTO>(
            `/transport/vehicles/${vehicleId}/explorer/move`,
            "PUT",
            { sourcePath, targetPath }
        );
    }

    public getContentUrl(vehicleId: number, relativePath: string): string {
        return `${VITE_OFFICE_BASE_URL}/api/v1/transport/vehicles/${vehicleId}/explorer/content?path=${encodeURIComponent(relativePath)}`;
    }
}
