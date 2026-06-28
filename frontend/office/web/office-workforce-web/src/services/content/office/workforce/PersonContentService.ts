import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { PersonCreateRequestDTO } from "@/models/dto/office/workforce/request.dto";
import { PersonDetailResponseDTO, PersonResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class PersonContentService {
    private static readonly INSTANCE: PersonContentService;
    private constructor() {
    }
    public static getInstance(): PersonContentService {
        if (PersonContentService.INSTANCE) {
            return PersonContentService.INSTANCE;
        }
        return new PersonContentService();
    }
    public async create(requestDTO: PersonCreateRequestDTO): Promise<PersonResponseDTO> {
        return await officeAPI<PersonCreateRequestDTO, PersonResponseDTO>(`/workforce/persons`, "POST", requestDTO);
    }
    public async findById(id: number): Promise<PersonResponseDTO> {
        return await officeAPI<null, PersonResponseDTO>(`/workforce/persons/${id}`, "GET", null);
    }
    public async findByIdInDetail(id: number): Promise<PersonDetailResponseDTO> {
        return await officeAPI<null, PersonDetailResponseDTO>(`/workforce/persons/details/${id}`, "GET", null);
    }
    public async findAllS1(page: PageParams): Promise<PaginationBaseResponseDTO<PersonResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<PersonResponseDTO>>(`/workforce/persons?page=${page.page}&size=${page.size}`, "GET", null);
    }
    public async searchS1(q: string, page: PageParams): Promise<PaginationBaseResponseDTO<PersonResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<PersonResponseDTO>>(`/workforce/persons/search?q=${q}&page=${page.page}&size=${page.size}`, "GET", null);
    }
    public getDisplayName(person: PersonResponseDTO): string {
        if (person.nameChinese) {
            return person.nameChinese;
        }
        if (person.nameEnglish) {
            return person.nameEnglish;
        }
        return "";
    }
    public getTelphone(person: PersonResponseDTO): string {
        if (person.mobileTel) {
            return person.mobileTel;
        }
        if (person.officeTel) {
            return person.officeTel;
        }
        return "";
    }
    public getIdentity(person: PersonResponseDTO): string {
        if (person.hkId) {
            return person.hkId;
        }
        if (person.moId) {
            return person.moId;
        }
        if (person.cnId) {
            return person.cnId;
        }
        if (person.passportId) {
            return person.passportId;
        }
        return "";
    }
}