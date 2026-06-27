import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { StaffCreateRequestDTO } from "@/models/dto/office/workforce/request.dto";
import { StaffDetailResponseDTO, StaffResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class StaffContentService {
    private static readonly INSTANCE: StaffContentService;
    private constructor() {
    }
    public static getInstance(): StaffContentService {
        if (StaffContentService.INSTANCE) {
            return StaffContentService.INSTANCE;
        }
        return new StaffContentService();
    }
    public async create(requestDTO: StaffCreateRequestDTO): Promise<StaffResponseDTO> {
        return await officeAPI<StaffCreateRequestDTO, StaffResponseDTO>(`/workforce/staffs`, "POST", requestDTO);
    }
    public async findById(id: number): Promise<StaffResponseDTO> {
        return await officeAPI<null, StaffResponseDTO>(`/workforce/staffs/${id}`, "GET", null);
    }
    public async findByIdInDetail(id: number): Promise<StaffDetailResponseDTO> {
        return await officeAPI<null, StaffDetailResponseDTO>(`/workforce/staffs/details/${id}`, "GET", null);
    }
    public async findAll(page: PageParams): Promise<PaginationBaseResponseDTO<StaffResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<StaffResponseDTO>>(`/workforce/staffs?page=${page.page}&size=${page.size}`, "GET", null);
    }
    public async search(q: string, page: PageParams): Promise<PaginationBaseResponseDTO<StaffResponseDTO>> {
        return await officeAPI<null, PaginationBaseResponseDTO<StaffResponseDTO>>(`/workforce/staffs/search?q=${q}&page=${page.page}&size=${page.size}`, "GET", null);
    }
    public getDisplayName(staff: StaffResponseDTO): string {
        if (staff.personNameChinese) {
            return staff.personNameChinese;
        }
        if (staff.personNameEnglish) {
            return staff.personNameEnglish;
        }
        return "";
    }
}