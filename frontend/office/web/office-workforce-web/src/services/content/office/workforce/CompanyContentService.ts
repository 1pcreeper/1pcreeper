import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { CompanyCreateRequestDTO } from "@/models/dto/office/workforce/request.dto";
import { CompanyResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class CompanyContentService {
    private static readonly INSTANCE: CompanyContentService;
    private constructor() {
    }
    public static getInstance(): CompanyContentService {
        if (CompanyContentService.INSTANCE) {
            return CompanyContentService.INSTANCE;
        }
        return new CompanyContentService();
    }
    public async create(requestDTO: CompanyCreateRequestDTO): Promise<CompanyResponseDTO> {
        return await officeAPI<CompanyCreateRequestDTO, CompanyResponseDTO>(`/workforce/companies`, "POST", requestDTO);
    }
    public async findById(id: number): Promise<CompanyResponseDTO> {
        return await officeAPI<null, CompanyResponseDTO>(`/workforce/companies/${id}`, "GET", null);
    }
    public async findAllS1(page: PageParams): Promise<PaginationBaseResponseDTO<CompanyResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<CompanyResponseDTO>>(`/workforce/companies?page=${page.page}&size=${page.size}`, "GET", null);
    }

    public getDisplayName(company: CompanyResponseDTO): string {
        if (company.nameChinese) {
            return company.nameChinese;
        }
        if (company.nameEnglish) {
            return company.nameEnglish;
        }
        return "";
    }
}