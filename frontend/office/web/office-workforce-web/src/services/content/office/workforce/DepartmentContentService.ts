import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { DepartmentCreateRequestDTO, DepartmentUpdateRequestDTO } from "@/models/dto/office/workforce/request.dto";
import { DepartmentResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class DepartmentContentService {
    private static readonly INSTANCE: DepartmentContentService;
    private constructor() {
    }
    public static getInstance(): DepartmentContentService {
        if (DepartmentContentService.INSTANCE) {
            return DepartmentContentService.INSTANCE;
        }
        return new DepartmentContentService();
    }
    public async create(requestDTO: DepartmentCreateRequestDTO): Promise<DepartmentResponseDTO> {
        return await officeAPI<DepartmentCreateRequestDTO, DepartmentResponseDTO>(`/workforce/departments`, "POST", requestDTO);
    }
    public async update(id: number, requestDTO: DepartmentUpdateRequestDTO): Promise<DepartmentResponseDTO> {
        return await officeAPI<DepartmentUpdateRequestDTO, DepartmentResponseDTO>(`/workforce/departments/${id}`, "PUT", requestDTO);
    }
    public async findById(id: number): Promise<DepartmentResponseDTO> {
        return await officeAPI<null, DepartmentResponseDTO>(`/workforce/departments/${id}`, "GET", null);
    }
    public async findAllS1(companyId: number, page: PageParams): Promise<PaginationBaseResponseDTO<DepartmentResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<DepartmentResponseDTO>>(`/workforce/departments?companyId=${companyId}&page=${page.page}&size=${page.size}`, "GET", null);
    }
    public async searchS1(q: string, companyId: number, page: PageParams): Promise<PaginationBaseResponseDTO<DepartmentResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<DepartmentResponseDTO>>(`/workforce/departments/search?q=${q}&companyId=${companyId}&page=${page.page}&size=${page.size}`, "GET", null);
    }
    public async delete(id: number): Promise<PaginationBaseResponseDTO<void>> {
        return await officeAPI<null, PaginationBaseResponseDTO<void>>(`/workforce/departments/${id}`, "DELETE", null);
    }
}