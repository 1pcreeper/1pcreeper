import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { OccupationCreateRequestDTO, OccupationUpdateRequestDTO } from "@/models/dto/office/workforce/request.dto";
import { OccupationResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class OccupationContentService {
    private static INSTANCE: OccupationContentService;

    private constructor() {}

    public static getInstance(): OccupationContentService {
        if (!OccupationContentService.INSTANCE) {
            OccupationContentService.INSTANCE = new OccupationContentService();
        }
        return OccupationContentService.INSTANCE;
    }

    public async search(
        departId?: number,
        q?: string,
        isActive: boolean = true,
        page?: PageParams
    ): Promise<PaginationBaseResponseDTO<OccupationResponseDTO>> {
        const queryParams = new URLSearchParams();
        if (departId !== undefined && departId !== null) queryParams.set("departId", departId.toString());
        if (q) queryParams.set("q", q);
        queryParams.set("isActive", isActive.toString());
        if (page) {
            queryParams.set("page", page.page.toString());
            queryParams.set("size", page.size.toString());
        }
        return await officeAPI<null, PaginationBaseResponseDTO<OccupationResponseDTO>>(
            `/workforce/occupations/search?${queryParams.toString()}`,
            "GET"
        );
    }

    public async findById(id: number): Promise<OccupationResponseDTO> {
        return await officeAPI<null, OccupationResponseDTO>(`/workforce/occupations/${id}`, "GET");
    }

    public async create(requestDTO: OccupationCreateRequestDTO): Promise<OccupationResponseDTO> {
        return await officeAPI<OccupationCreateRequestDTO, OccupationResponseDTO>(
            "/workforce/occupations",
            "POST",
            requestDTO
        );
    }

    public async update(id: number, requestDTO: OccupationUpdateRequestDTO): Promise<OccupationResponseDTO> {
        return await officeAPI<OccupationUpdateRequestDTO, OccupationResponseDTO>(
            `/workforce/occupations/${id}`,
            "PUT",
            requestDTO
        );
    }
}
