import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { OrganizationCreateRequestDTO, OrganizationUpdateRequestDTO } from "@/models/dto/office/workforce/request.dto";
import { OrganizationResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class OrganizationContentService {
    private static INSTANCE: OrganizationContentService;

    private constructor() {}

    public static getInstance(): OrganizationContentService {
        if (!OrganizationContentService.INSTANCE) {
            OrganizationContentService.INSTANCE = new OrganizationContentService();
        }
        return OrganizationContentService.INSTANCE;
    }

    public async create(requestDTO: OrganizationCreateRequestDTO): Promise<OrganizationResponseDTO> {
        return await officeAPI<OrganizationCreateRequestDTO, OrganizationResponseDTO>(
            "/workforce/organizations",
            "POST",
            requestDTO
        );
    }

    public async update(id: number, requestDTO: OrganizationUpdateRequestDTO): Promise<OrganizationResponseDTO> {
        return await officeAPI<OrganizationUpdateRequestDTO, OrganizationResponseDTO>(
            `/workforce/organizations/${id}`,
            "PUT",
            requestDTO
        );
    }

    public async delete(id: number): Promise<void> {
        await officeAPI<null, void>(
            `/workforce/organizations/${id}`,
            "DELETE",
            null
        );
    }

    public async findById(id: number): Promise<OrganizationResponseDTO> {
        return await officeAPI<null, OrganizationResponseDTO>(
            `/workforce/organizations/${id}`,
            "GET",
            null
        );
    }

    public async findByUid(uid: string): Promise<OrganizationResponseDTO> {
        return await officeAPI<null, OrganizationResponseDTO>(
            `/workforce/organizations/uid/${uid}`,
            "GET",
            null
        );
    }

    public async findAll(page: PageParams): Promise<PaginationBaseResponseDTO<OrganizationResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<OrganizationResponseDTO>>(
            `/workforce/organizations?page=${page.page}&size=${page.size}`,
            "GET",
            null
        );
    }

    public async search(
        q?: string,
        isActive: boolean = true,
        page?: PageParams
    ): Promise<PaginationBaseResponseDTO<OrganizationResponseDTO>> {
        const queryParams = new URLSearchParams();
        if (q) queryParams.set("q", q);
        queryParams.set("isActive", isActive.toString());
        if (page) {
            queryParams.set("page", page.page.toString());
            queryParams.set("size", page.size.toString());
        }
        return await officeAPI<null, PaginationBaseResponseDTO<OrganizationResponseDTO>>(
            `/workforce/organizations/search?${queryParams.toString()}`,
            "GET",
            null
        );
    }

    public getDisplayName(org: OrganizationResponseDTO): string {
        if (org.nameEnglish && org.nameChinese) {
            return `${org.nameEnglish} (${org.nameChinese})`;
        }
        return org.nameEnglish || org.nameChinese || `Organization #${org.id}`;
    }
}
