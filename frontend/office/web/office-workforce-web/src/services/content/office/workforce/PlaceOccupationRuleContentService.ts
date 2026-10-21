import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import {
    PlaceOccupationRuleCreateRequestDTO,
    PlaceOccupationRuleUpdateRequestDTO
} from "@/models/dto/office/workforce/request.dto";
import { PlaceOccupationRuleResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class PlaceOccupationRuleContentService {
    private static INSTANCE: PlaceOccupationRuleContentService;

    private constructor() {}

    public static getInstance(): PlaceOccupationRuleContentService {
        if (!PlaceOccupationRuleContentService.INSTANCE) {
            PlaceOccupationRuleContentService.INSTANCE = new PlaceOccupationRuleContentService();
        }
        return PlaceOccupationRuleContentService.INSTANCE;
    }

    public async search(
        placeId?: number,
        weekDay?: number,
        occupationId?: number,
        page?: PageParams
    ): Promise<PaginationBaseResponseDTO<PlaceOccupationRuleResponseDTO>> {
        const queryParams = new URLSearchParams();
        if (placeId !== undefined && placeId !== null) queryParams.set("placeId", placeId.toString());
        if (weekDay !== undefined && weekDay !== null) queryParams.set("weekDay", weekDay.toString());
        if (occupationId !== undefined && occupationId !== null) queryParams.set("occupationId", occupationId.toString());
        if (page) {
            queryParams.set("page", page.page.toString());
            queryParams.set("size", page.size.toString());
        }
        return await officeAPI<null, PaginationBaseResponseDTO<PlaceOccupationRuleResponseDTO>>(
            `/workforce/place-occupation-rules/search?${queryParams.toString()}`,
            "GET",
            null
        );
    }

    public async create(requestDTO: PlaceOccupationRuleCreateRequestDTO): Promise<PlaceOccupationRuleResponseDTO> {
        return await officeAPI<PlaceOccupationRuleCreateRequestDTO, PlaceOccupationRuleResponseDTO>(
            "/workforce/place-occupation-rules",
            "POST",
            requestDTO
        );
    }

    public async update(id: number, requestDTO: PlaceOccupationRuleUpdateRequestDTO): Promise<PlaceOccupationRuleResponseDTO> {
        return await officeAPI<PlaceOccupationRuleUpdateRequestDTO, PlaceOccupationRuleResponseDTO>(
            `/workforce/place-occupation-rules/${id}`,
            "PUT",
            requestDTO
        );
    }

    public async delete(id: number): Promise<void> {
        return await officeAPI<null, void>(
            `/workforce/place-occupation-rules/${id}`,
            "DELETE",
            null
        );
    }
}
