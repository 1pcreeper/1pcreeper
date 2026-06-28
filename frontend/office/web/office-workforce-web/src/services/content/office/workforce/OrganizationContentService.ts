import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { OrganizationCreateRequestDTO } from "@/models/dto/office/workforce/request.dto";
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
    public async findById(id: number): Promise<OrganizationResponseDTO> {
        return await officeAPI<null, OrganizationResponseDTO>(`/workforce/organizations/${id}`, "GET", null);
    }
    public async findAll(page: PageParams): Promise<PaginationBaseResponseDTO<OrganizationResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<OrganizationResponseDTO>>(`/workforce/organizations?page=${page.page}&size=${page.size}`, "GET", null);
    }
}