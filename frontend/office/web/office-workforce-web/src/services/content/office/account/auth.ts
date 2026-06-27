import officeAPI from "@/api/office.api";
import { OfficeAccountAuthLoginRequestDTO } from "@/models/dto/office/account/request.dto";
import { OfficeAccountAuthTokenResponseDTO, OfficeAccountOfficeUserVerifyResponseDTO } from "@/models/dto/office/account/response.dto";

export default class OfficeAccountAuthContentService {
    private static readonly INSTANCE: OfficeAccountAuthContentService;
    private constructor() {
    }
    public static getInstance(): OfficeAccountAuthContentService {
        if (OfficeAccountAuthContentService.INSTANCE) {
            return OfficeAccountAuthContentService.INSTANCE;
        }
        return new OfficeAccountAuthContentService();
    }
    public async login(requestDTO: OfficeAccountAuthLoginRequestDTO): Promise<OfficeAccountAuthTokenResponseDTO> {
        return await officeAPI<OfficeAccountAuthLoginRequestDTO, OfficeAccountAuthTokenResponseDTO>(
            "/account/auth/login", "POST", requestDTO, false, true);
    }
    public async verify(): Promise<OfficeAccountOfficeUserVerifyResponseDTO> {
        return await officeAPI<null, OfficeAccountOfficeUserVerifyResponseDTO>("/account/auth/verify", "GET", null);
    }
}