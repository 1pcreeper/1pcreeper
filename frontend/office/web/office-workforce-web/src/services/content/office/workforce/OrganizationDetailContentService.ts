import officeAPI from "@/api/office.api";
import { OrganizationDetailRequestDTO } from "@/models/dto/office/workforce/request.dto";
import { OrganizationDetailResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class OrganizationDetailContentService {
    private static INSTANCE: OrganizationDetailContentService;

    private constructor() {}

    public static getInstance(): OrganizationDetailContentService {
        if (!OrganizationDetailContentService.INSTANCE) {
            OrganizationDetailContentService.INSTANCE = new OrganizationDetailContentService();
        }
        return OrganizationDetailContentService.INSTANCE;
    }

    public async findByOrgId(orgId: number): Promise<OrganizationDetailResponseDTO> {
        return await officeAPI<null, OrganizationDetailResponseDTO>(
            `/workforce/organizations/${orgId}/details`,
            "GET"
        );
    }

    public async upsert(orgId: number, requestDTO: OrganizationDetailRequestDTO): Promise<OrganizationDetailResponseDTO> {
        return await officeAPI<OrganizationDetailRequestDTO, OrganizationDetailResponseDTO>(
            `/workforce/organizations/${orgId}/details`,
            "PUT",
            requestDTO
        );
    }
}
