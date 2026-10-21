import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import {
    StaffOccupationCreateRequestDTO,
    StaffOccupationUpdateRequestDTO
} from "@/models/dto/office/workforce/request.dto";
import { StaffOccupationResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class StaffOccupationContentService {
    private static INSTANCE: StaffOccupationContentService;

    private constructor() {}

    public static getInstance(): StaffOccupationContentService {
        if (!StaffOccupationContentService.INSTANCE) {
            StaffOccupationContentService.INSTANCE = new StaffOccupationContentService();
        }
        return StaffOccupationContentService.INSTANCE;
    }

    public async search(
        staffId?: number,
        occupationId?: number,
        q?: string,
        page?: PageParams
    ): Promise<PaginationBaseResponseDTO<StaffOccupationResponseDTO>> {
        const queryParams = new URLSearchParams();
        if (staffId !== undefined && staffId !== null) queryParams.set("staffId", staffId.toString());
        if (occupationId !== undefined && occupationId !== null) queryParams.set("occupationId", occupationId.toString());
        if (q) queryParams.set("q", q);
        if (page) {
            queryParams.set("page", page.page.toString());
            queryParams.set("size", page.size.toString());
        }
        return await officeAPI<null, PaginationBaseResponseDTO<StaffOccupationResponseDTO>>(
            `/workforce/staff-occupations/search?${queryParams.toString()}`,
            "GET",
            null
        );
    }

    public async findById(id: number): Promise<StaffOccupationResponseDTO> {
        return await officeAPI<null, StaffOccupationResponseDTO>(
            `/workforce/staff-occupations/${id}`,
            "GET",
            null
        );
    }

    public async create(requestDTO: StaffOccupationCreateRequestDTO): Promise<StaffOccupationResponseDTO> {
        return await officeAPI<StaffOccupationCreateRequestDTO, StaffOccupationResponseDTO>(
            "/workforce/staff-occupations",
            "POST",
            requestDTO
        );
    }

    public async update(id: number, requestDTO: StaffOccupationUpdateRequestDTO): Promise<StaffOccupationResponseDTO> {
        return await officeAPI<StaffOccupationUpdateRequestDTO, StaffOccupationResponseDTO>(
            `/workforce/staff-occupations/${id}`,
            "PUT",
            requestDTO
        );
    }

    public async delete(id: number): Promise<void> {
        return await officeAPI<null, void>(
            `/workforce/staff-occupations/${id}`,
            "DELETE",
            null
        );
    }
}
