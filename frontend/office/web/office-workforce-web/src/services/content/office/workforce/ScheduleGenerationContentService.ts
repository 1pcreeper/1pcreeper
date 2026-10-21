import officeAPI from "@/api/office.api";
import { ScheduleGenerationRequestDTO } from "@/models/dto/office/workforce/request.dto";
import {
    ScheduleGenerationStatusResponseDTO,
    ScheduleGenerationTaskResponseDTO
} from "@/models/dto/office/workforce/response.dto";

export default class ScheduleGenerationContentService {
    private static INSTANCE: ScheduleGenerationContentService;

    private constructor() {}

    public static getInstance(): ScheduleGenerationContentService {
        if (!ScheduleGenerationContentService.INSTANCE) {
            ScheduleGenerationContentService.INSTANCE = new ScheduleGenerationContentService();
        }
        return ScheduleGenerationContentService.INSTANCE;
    }

    public async triggerGeneration(requestDTO: ScheduleGenerationRequestDTO): Promise<ScheduleGenerationTaskResponseDTO> {
        return await officeAPI<ScheduleGenerationRequestDTO, ScheduleGenerationTaskResponseDTO>(
            "/workforce/schedule-generations/trigger",
            "POST",
            requestDTO
        );
    }

    public async getTaskStatus(id: number): Promise<ScheduleGenerationTaskResponseDTO> {
        return await officeAPI<null, ScheduleGenerationTaskResponseDTO>(
            `/workforce/schedule-generations/${id}/status`,
            "GET",
            null
        );
    }

    public async getIsProcessing(): Promise<ScheduleGenerationStatusResponseDTO> {
        return await officeAPI<null, ScheduleGenerationStatusResponseDTO>(
            "/workforce/schedule-generations/process",
            "GET",
            null
        );
    }

    // Backwards-compatible aliases
    public async generate(requestDTO: ScheduleGenerationRequestDTO): Promise<ScheduleGenerationTaskResponseDTO> {
        return await this.triggerGeneration(requestDTO);
    }

    public async getStatus(taskId: string | number): Promise<ScheduleGenerationStatusResponseDTO> {
        const id = Number(taskId);
        if (!isNaN(id)) {
            const task = await this.getTaskStatus(id);
            return {
                isProcessing: task.status === 'PENDING' || task.status === 'PROCESSING'
            };
        }
        return await this.getIsProcessing();
    }
}
