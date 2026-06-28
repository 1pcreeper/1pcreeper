import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { OrganizationCreateRequestDTO, OrganizationUpdateRequestDTO } from "@/models/dto/office/workforce/request.dto";
import { OrganizationResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class OrganizationContentService {
    private static readonly INSTANCE: OrganizationContentService;
    private constructor() {
    }
    public static getInstance(): OrganizationContentService {
        if (OrganizationContentService.INSTANCE) {
            return OrganizationContentService.INSTANCE;
        }
        return new OrganizationContentService();
    }
    public async create(requestDTO: OrganizationCreateRequestDTO): Promise<OrganizationResponseDTO> {
        return await officeAPI<OrganizationCreateRequestDTO, OrganizationResponseDTO>(`/workforce/organizations`, "POST", requestDTO);
    }
    public async update(id: number, requestDTO: OrganizationUpdateRequestDTO): Promise<OrganizationResponseDTO> {
        return await officeAPI<OrganizationUpdateRequestDTO, OrganizationResponseDTO>(`/workforce/organizations/${id}`, "PUT", requestDTO);
    }
    public async findById(id: number): Promise<OrganizationResponseDTO> {
        return await officeAPI<null, OrganizationResponseDTO>(`/workforce/organizations/${id}`, "GET", null);
    }
    public async findAllS1(companyId: number, page: PageParams): Promise<PaginationBaseResponseDTO<OrganizationResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<OrganizationResponseDTO>>(`/workforce/organizations?companyId=${companyId}&page=${page.page}&size=${page.size}`, "GET", null);
    }
    public async searchS1(q: string, companyId: number, page: PageParams): Promise<PaginationBaseResponseDTO<OrganizationResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<OrganizationResponseDTO>>(`/workforce/organizations/search?q=${q}&companyId=${companyId}&page=${page.page}&size=${page.size}`, "GET", null);
    }
    public async delete(id: number): Promise<PaginationBaseResponseDTO<void>> {
        return await officeAPI<null, PaginationBaseResponseDTO<void>>(`/workforce/organizations/${id}`, "DELETE", null);
    }
}