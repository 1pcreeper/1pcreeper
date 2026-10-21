import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import {
    StaffSchedulePreferenceCreateRequestDTO,
    StaffSchedulePreferenceUpdateRequestDTO
} from "@/models/dto/office/workforce/request.dto";
import { StaffSchedulePreferenceResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class StaffSchedulePreferenceContentService {
    private static INSTANCE: StaffSchedulePreferenceContentService;

    private constructor() {}

    public static getInstance(): StaffSchedulePreferenceContentService {
        if (!StaffSchedulePreferenceContentService.INSTANCE) {
            StaffSchedulePreferenceContentService.INSTANCE = new StaffSchedulePreferenceContentService();
        }
        return StaffSchedulePreferenceContentService.INSTANCE;
    }

    public async search(
        staffId?: number,
        placeId?: number,
        weekDay?: number,
        page?: PageParams
    ): Promise<PaginationBaseResponseDTO<StaffSchedulePreferenceResponseDTO>> {
        const queryParams = new URLSearchParams();
        if (staffId !== undefined && staffId !== null) queryParams.set("staffId", staffId.toString());
        if (placeId !== undefined && placeId !== null) queryParams.set("placeId", placeId.toString());
        if (weekDay !== undefined && weekDay !== null) queryParams.set("weekDay", weekDay.toString());
        if (page) {
            queryParams.set("page", page.page.toString());
            queryParams.set("size", page.size.toString());
        }
        return await officeAPI<null, PaginationBaseResponseDTO<StaffSchedulePreferenceResponseDTO>>(
            `/workforce/staff-schedule-preferences/search?${queryParams.toString()}`,
            "GET",
            null
        );
    }

    public async findById(id: number): Promise<StaffSchedulePreferenceResponseDTO> {
        return await officeAPI<null, StaffSchedulePreferenceResponseDTO>(
            `/workforce/staff-schedule-preferences/${id}`,
            "GET",
            null
        );
    }

    public async create(requestDTO: StaffSchedulePreferenceCreateRequestDTO): Promise<StaffSchedulePreferenceResponseDTO> {
        return await officeAPI<StaffSchedulePreferenceCreateRequestDTO, StaffSchedulePreferenceResponseDTO>(
            "/workforce/staff-schedule-preferences",
            "POST",
            requestDTO
        );
    }

    public async update(id: number, requestDTO: StaffSchedulePreferenceUpdateRequestDTO): Promise<StaffSchedulePreferenceResponseDTO> {
        return await officeAPI<StaffSchedulePreferenceUpdateRequestDTO, StaffSchedulePreferenceResponseDTO>(
            `/workforce/staff-schedule-preferences/${id}`,
            "PUT",
            requestDTO
        );
    }

    public async delete(id: number): Promise<void> {
        return await officeAPI<null, void>(
            `/workforce/staff-schedule-preferences/${id}`,
            "DELETE",
            null
        );
    }
}

