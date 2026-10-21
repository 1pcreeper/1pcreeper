import officeAPI from "@/api/office.api";
import {
    PlaceScheduleRuleCreateRequestDTO,
    PlaceScheduleRuleUpdateRequestDTO
} from "@/models/dto/office/workforce/request.dto";
import { PlaceScheduleRuleResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class PlaceScheduleRuleContentService {
    private static INSTANCE: PlaceScheduleRuleContentService;

    private constructor() {}

    public static getInstance(): PlaceScheduleRuleContentService {
        if (!PlaceScheduleRuleContentService.INSTANCE) {
            PlaceScheduleRuleContentService.INSTANCE = new PlaceScheduleRuleContentService();
        }
        return PlaceScheduleRuleContentService.INSTANCE;
    }

    public async findByPlaceId(placeId: number): Promise<PlaceScheduleRuleResponseDTO> {
        return await officeAPI<null, PlaceScheduleRuleResponseDTO>(
            `/workforce/place-schedule-rules/place/${placeId}`,
            "GET",
            null
        );
    }

    public async create(requestDTO: PlaceScheduleRuleCreateRequestDTO): Promise<PlaceScheduleRuleResponseDTO> {
        return await officeAPI<PlaceScheduleRuleCreateRequestDTO, PlaceScheduleRuleResponseDTO>(
            "/workforce/place-schedule-rules",
            "POST",
            requestDTO
        );
    }

    public async update(id: number, requestDTO: PlaceScheduleRuleUpdateRequestDTO): Promise<PlaceScheduleRuleResponseDTO> {
        return await officeAPI<PlaceScheduleRuleUpdateRequestDTO, PlaceScheduleRuleResponseDTO>(
            `/workforce/place-schedule-rules/${id}`,
            "PUT",
            requestDTO
        );
    }
}
