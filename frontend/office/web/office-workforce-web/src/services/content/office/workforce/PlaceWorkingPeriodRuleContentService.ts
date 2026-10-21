import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import {
    PlaceWorkingPeriodRuleCreateRequestDTO,
    PlaceWorkingPeriodRuleUpdateRequestDTO
} from "@/models/dto/office/workforce/request.dto";
import { PlaceWorkingPeriodRuleResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class PlaceWorkingPeriodRuleContentService {
    private static INSTANCE: PlaceWorkingPeriodRuleContentService;

    private constructor() {}

    public static getInstance(): PlaceWorkingPeriodRuleContentService {
        if (!PlaceWorkingPeriodRuleContentService.INSTANCE) {
            PlaceWorkingPeriodRuleContentService.INSTANCE = new PlaceWorkingPeriodRuleContentService();
        }
        return PlaceWorkingPeriodRuleContentService.INSTANCE;
    }

    public async search(
        occupationRuleId?: number,
        workingPeriodId?: number,
        page?: PageParams
    ): Promise<PaginationBaseResponseDTO<PlaceWorkingPeriodRuleResponseDTO>> {
        const queryParams = new URLSearchParams();
        if (occupationRuleId !== undefined && occupationRuleId !== null) queryParams.set("occupationRuleId", occupationRuleId.toString());
        if (workingPeriodId !== undefined && workingPeriodId !== null) queryParams.set("workingPeriodId", workingPeriodId.toString());
        if (page) {
            queryParams.set("page", page.page.toString());
            queryParams.set("size", page.size.toString());
        }
        return await officeAPI<null, PaginationBaseResponseDTO<PlaceWorkingPeriodRuleResponseDTO>>(
            `/workforce/place-working-period-rules/search?${queryParams.toString()}`,
            "GET",
            null
        );
    }

    public async create(requestDTO: PlaceWorkingPeriodRuleCreateRequestDTO): Promise<PlaceWorkingPeriodRuleResponseDTO> {
        return await officeAPI<PlaceWorkingPeriodRuleCreateRequestDTO, PlaceWorkingPeriodRuleResponseDTO>(
            "/workforce/place-working-period-rules",
            "POST",
            requestDTO
        );
    }

    public async update(id: number, requestDTO: PlaceWorkingPeriodRuleUpdateRequestDTO): Promise<PlaceWorkingPeriodRuleResponseDTO> {
        return await officeAPI<PlaceWorkingPeriodRuleUpdateRequestDTO, PlaceWorkingPeriodRuleResponseDTO>(
            `/workforce/place-working-period-rules/${id}`,
            "PUT",
            requestDTO
        );
    }

    public async delete(id: number): Promise<void> {
        return await officeAPI<null, void>(
            `/workforce/place-working-period-rules/${id}`,
            "DELETE",
            null
        );
    }
}
