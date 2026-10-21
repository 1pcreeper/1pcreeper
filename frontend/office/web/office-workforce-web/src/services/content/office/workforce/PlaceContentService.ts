import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { PlaceCreateRequestDTO, PlaceUpdateRequestDTO } from "@/models/dto/office/workforce/request.dto";
import { PlaceResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class PlaceContentService {
    private static INSTANCE: PlaceContentService;

    private constructor() {}

    public static getInstance(): PlaceContentService {
        if (!PlaceContentService.INSTANCE) {
            PlaceContentService.INSTANCE = new PlaceContentService();
        }
        return PlaceContentService.INSTANCE;
    }

    public async search(
        departId?: number,
        q?: string,
        isActive: boolean = true,
        page?: PageParams,
        companyId?: number
    ): Promise<PaginationBaseResponseDTO<PlaceResponseDTO>> {
        const queryParams = new URLSearchParams();
        if (companyId !== undefined && companyId !== null) queryParams.set("companyId", companyId.toString());
        if (departId !== undefined && departId !== null) queryParams.set("departId", departId.toString());
        if (q) queryParams.set("q", q);
        queryParams.set("isActive", isActive.toString());
        if (page) {
            queryParams.set("page", page.page.toString());
            queryParams.set("size", page.size.toString());
        }
        return await officeAPI<null, PaginationBaseResponseDTO<PlaceResponseDTO>>(
            `/workforce/places/search?${queryParams.toString()}`,
            "GET"
        );
    }

    public async findById(id: number): Promise<PlaceResponseDTO> {
        return await officeAPI<null, PlaceResponseDTO>(`/workforce/places/${id}`, "GET");
    }

    public async create(requestDTO: PlaceCreateRequestDTO): Promise<PlaceResponseDTO> {
        return await officeAPI<PlaceCreateRequestDTO, PlaceResponseDTO>(
            "/workforce/places",
            "POST",
            requestDTO
        );
    }

    public async update(id: number, requestDTO: PlaceUpdateRequestDTO): Promise<PlaceResponseDTO> {
        return await officeAPI<PlaceUpdateRequestDTO, PlaceResponseDTO>(
            `/workforce/places/${id}`,
            "PUT",
            requestDTO
        );
    }

    public async delete(id: number): Promise<void> {
        await officeAPI<null, void>(
            `/workforce/places/${id}`,
            "DELETE",
            null
        );
    }
}
