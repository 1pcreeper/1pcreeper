import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import {
    ScheduleCreateRequestDTO,
    ScheduleStatusUpdateRequestDTO,
    ScheduleUpdateRequestDTO
} from "@/models/dto/office/workforce/request.dto";
import { ScheduleResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class ScheduleContentService {
    private static INSTANCE: ScheduleContentService;

    private constructor() {}

    public static getInstance(): ScheduleContentService {
        if (!ScheduleContentService.INSTANCE) {
            ScheduleContentService.INSTANCE = new ScheduleContentService();
        }
        return ScheduleContentService.INSTANCE;
    }

    public async search(
        placeId?: number,
        staffId?: number,
        status?: string,
        startFrom?: string,
        endTo?: string,
        page?: PageParams
    ): Promise<PaginationBaseResponseDTO<ScheduleResponseDTO>> {
        const queryParams = new URLSearchParams();
        if (placeId !== undefined && placeId !== null) queryParams.set("placeId", placeId.toString());
        if (staffId !== undefined && staffId !== null) queryParams.set("staffId", staffId.toString());
        if (status) queryParams.set("status", status);
        if (startFrom) queryParams.set("startFrom", startFrom);
        if (endTo) queryParams.set("endTo", endTo);
        if (page) {
            queryParams.set("page", page.page.toString());
            queryParams.set("size", page.size.toString());
        }
        return await officeAPI<null, PaginationBaseResponseDTO<ScheduleResponseDTO>>(
            `/workforce/schedules/search?${queryParams.toString()}`,
            "GET"
        );
    }

    public async findById(id: number): Promise<ScheduleResponseDTO> {
        return await officeAPI<null, ScheduleResponseDTO>(`/workforce/schedules/${id}`, "GET");
    }

    public async create(requestDTO: ScheduleCreateRequestDTO): Promise<ScheduleResponseDTO> {
        return await officeAPI<ScheduleCreateRequestDTO, ScheduleResponseDTO>(
            "/workforce/schedules",
            "POST",
            requestDTO
        );
    }

    public async update(id: number, requestDTO: ScheduleUpdateRequestDTO): Promise<ScheduleResponseDTO> {
        return await officeAPI<ScheduleUpdateRequestDTO, ScheduleResponseDTO>(
            `/workforce/schedules/${id}`,
            "PUT",
            requestDTO
        );
    }

    public async updateStatus(
        id: number,
        requestDTO: ScheduleStatusUpdateRequestDTO
    ): Promise<ScheduleResponseDTO> {
        return await officeAPI<ScheduleStatusUpdateRequestDTO, ScheduleResponseDTO>(
            `/workforce/schedules/${id}/status`,
            "PATCH",
            requestDTO
        );
    }

    public async delete(id: number): Promise<void> {
        return await officeAPI<null, void>(
            `/workforce/schedules/${id}`,
            "DELETE"
        );
    }
}
