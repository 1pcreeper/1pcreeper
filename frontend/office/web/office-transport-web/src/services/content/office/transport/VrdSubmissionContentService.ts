import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { VrdSubmissionApproveRequestDTO, VrdSubmissionDeclineRequestDTO, VrdSubmissionUpdateRequestDTO } from "@/models/dto/office/transport/request.dto";
import { VehicleVrdResponseDTO, VrdSubmissionResponseDTO } from "@/models/dto/office/transport/response.dto";

export default class VrdSubmissionContentService {
    private static readonly INSTANCE: VrdSubmissionContentService;
    private constructor() {
    }
    public static getInstance(): VrdSubmissionContentService {
        if (VrdSubmissionContentService.INSTANCE) {
            return VrdSubmissionContentService.INSTANCE;
        }
        return new VrdSubmissionContentService();
    }

    public async uploadAndScan(vehicleId: number, file: File): Promise<VrdSubmissionResponseDTO> {
        const formData = new FormData();
        formData.append("file", file);
        return await officeAPI<FormData, VrdSubmissionResponseDTO>(
            `/transport/vehicles/${vehicleId}/scans/hk_vrds`,
            "POST",
            formData
        );
    }

    public async findByVehicleId(vehicleId: number): Promise<VrdSubmissionResponseDTO[]> {
        return await officeAPI<null, VrdSubmissionResponseDTO[]>(
            `/transport/vehicles/${vehicleId}/vrd-submissions`,
            "GET",
            null
        );
    }

    public async findPending(page: PageParams = { page: 0, size: 20 }): Promise<PaginationBaseResponseDTO<VrdSubmissionResponseDTO>> {
        const p = page.page ?? 0;
        const s = page.size ?? 20;
        return await officeAPI<null, PaginationBaseResponseDTO<VrdSubmissionResponseDTO>>(
            `/transport/vrd-submissions/pending?page=${p}&size=${s}`,
            "GET",
            null
        );
    }

    public async update(vehicleId: number, subId: number, data: any): Promise<VrdSubmissionResponseDTO> {
        return await officeAPI<VrdSubmissionUpdateRequestDTO, VrdSubmissionResponseDTO>(
            `/transport/vehicles/${vehicleId}/vrd-submissions/${subId}`,
            "PUT",
            { data }
        );
    }

    public async approve(vehicleId: number, subId: number, scannedData?: any): Promise<VehicleVrdResponseDTO> {
        return await officeAPI<VrdSubmissionApproveRequestDTO, VehicleVrdResponseDTO>(
            `/transport/vehicles/${vehicleId}/vrd-submissions/${subId}/approve`,
            "POST",
            { scannedData }
        );
    }

    public async decline(vehicleId: number, subId: number, reason?: string): Promise<VrdSubmissionResponseDTO> {
        return await officeAPI<VrdSubmissionDeclineRequestDTO, VrdSubmissionResponseDTO>(
            `/transport/vehicles/${vehicleId}/vrd-submissions/${subId}/decline`,
            "POST",
            { reason }
        );
    }
}
