import officeAPI from "@/api/office.api";
import { OfficeWorkforceUserVerifyResponseDTO } from "@/models/dto/office/workforce/response.dto";

export default class OfficeWorkforceAuthContentService {
    private static readonly INSTANCE: OfficeWorkforceAuthContentService;
    private constructor() {
    }
    public static getInstance(): OfficeWorkforceAuthContentService {
        if (OfficeWorkforceAuthContentService.INSTANCE) {
            return OfficeWorkforceAuthContentService.INSTANCE;
        }
        return new OfficeWorkforceAuthContentService();
    }
    public async verify(): Promise<OfficeWorkforceUserVerifyResponseDTO> {
        return await officeAPI<null, OfficeWorkforceUserVerifyResponseDTO>("/workforce/auth/verify", "GET", null, true);
    }
}