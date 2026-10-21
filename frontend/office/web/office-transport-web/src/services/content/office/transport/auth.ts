import officeAPI from "@/api/office.api";
import { OfficeTransportUserVerifyResponseDTO } from "@/models/dto/office/transport/response.dto";

export default class OfficeTransportAuthContentService {
    private static readonly INSTANCE: OfficeTransportAuthContentService;
    private constructor() {
    }
    public static getInstance(): OfficeTransportAuthContentService {
        if (OfficeTransportAuthContentService.INSTANCE) {
            return OfficeTransportAuthContentService.INSTANCE;
        }
        return new OfficeTransportAuthContentService();
    }
    public async verify(): Promise<OfficeTransportUserVerifyResponseDTO> {
        return await officeAPI<null, OfficeTransportUserVerifyResponseDTO>("/transport/auth/verify", "GET", null);
    }
}
