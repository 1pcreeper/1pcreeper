import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { WorkingPeriodCreateRequestDTO, WorkingPeriodUpdateRequestDTO } from "@/models/dto/office/workforce/request.dto";
import { WorkingPeriodResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class WorkingPeriodContentService {
    private static INSTANCE: WorkingPeriodContentService;
    private constructor() {
    }
    public static getInstance(): WorkingPeriodContentService {
        if (!WorkingPeriodContentService.INSTANCE) {
            WorkingPeriodContentService.INSTANCE = new WorkingPeriodContentService();
        }
        return WorkingPeriodContentService.INSTANCE;
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
    public async delete(id: number): Promise<void> {
        return await officeAPI<null, void>(`/workforce/working-periods/${id}`, "DELETE", null);
    }
    public async search(departId?: number, q?: string, page?: PageParams): Promise<PaginationBaseResponseDTO<WorkingPeriodResponseDTO>> {
        const queryParams = new URLSearchParams();
        if (departId !== undefined && departId !== null) queryParams.set("departId", departId.toString());
        if (q) queryParams.set("q", q);
        if (page) {
            queryParams.set("page", page.page.toString());
            queryParams.set("size", page.size.toString());
        }
        return await officeAPI<null, PaginationBaseResponseDTO<WorkingPeriodResponseDTO>>(
            `/workforce/working-periods/search?${queryParams.toString()}`,
            "GET",
            null
        );
    }
}
