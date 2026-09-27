import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { WorkingPeriodCreateRequestDTO, WorkingPeriodUpdateRequestDTO } from "@/models/dto/office/workforce/request.dto";
import { WorkingPeriodResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class WorkingPeriodContentService {
    private static readonly INSTANCE: WorkingPeriodContentService;
    private constructor() {
    }
    public static getInstance(): WorkingPeriodContentService {
        if (WorkingPeriodContentService.INSTANCE) {
            return WorkingPeriodContentService.INSTANCE;
        }
        return new WorkingPeriodContentService();
    }
    public async create(requestDTO: WorkingPeriodCreateRequestDTO): Promise<WorkingPeriodResponseDTO> {
        return await officeAPI<WorkingPeriodCreateRequestDTO, WorkingPeriodResponseDTO>(`/workforce/working-periods`, "POST", requestDTO);
    }
    public async update(id: number, requestDTO: WorkingPeriodUpdateRequestDTO): Promise<WorkingPeriodResponseDTO> {
        return await officeAPI<WorkingPeriodUpdateRequestDTO, WorkingPeriodResponseDTO>(`/workforce/working-periods/${id}`, "PUT", requestDTO);
    }
    public async findById(id: number): Promise<WorkingPeriodResponseDTO> {
        return await officeAPI<null, WorkingPeriodResponseDTO>(`/workforce/working-periods/${id}`, "GET", null);
    }
    public async searchS1(q: string, departId: number, page: PageParams): Promise<PaginationBaseResponseDTO<WorkingPeriodResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<WorkingPeriodResponseDTO>>(`/workforce/working-periods/search?q=${q}&departId=${departId}&page=${page.page}&size=${page.size}`, "GET", null);
    }
    public async findAllS1(departId: number, page: PageParams): Promise<PaginationBaseResponseDTO<WorkingPeriodResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<WorkingPeriodResponseDTO>>(`/workforce/working-periods/search?departId=${departId}&page=${page.page}&size=${page.size}`, "GET", null);
    }
    public async delete(id: number): Promise<PaginationBaseResponseDTO<void>> {
        return await officeAPI<null, PaginationBaseResponseDTO<void>>(`/workforce/working-periods/${id}`, "DELETE", null);
    }
}
