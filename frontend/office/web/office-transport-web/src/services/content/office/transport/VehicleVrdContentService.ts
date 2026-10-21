import officeAPI from "@/api/office.api";
import { VehicleVrdCreateRequestDTO, VehicleVrdUpdateRequestDTO } from "@/models/dto/office/transport/request.dto";
import { VehicleVrdResponseDTO } from "@/models/dto/office/transport/response.dto";

export default class VehicleVrdContentService {
    private static readonly INSTANCE: VehicleVrdContentService;
    private constructor() {
    }
    public static getInstance(): VehicleVrdContentService {
        if (VehicleVrdContentService.INSTANCE) {
            return VehicleVrdContentService.INSTANCE;
        }
        return new VehicleVrdContentService();
    }

    public async findByVehicleId(vehicleId: number): Promise<VehicleVrdResponseDTO[]> {
        return await officeAPI<null, VehicleVrdResponseDTO[]>(`/transport/vehicles/${vehicleId}/vrds`, "GET", null);
    }

    public async create(vehicleId: number, requestDTO: VehicleVrdCreateRequestDTO): Promise<VehicleVrdResponseDTO> {
        return await officeAPI<VehicleVrdCreateRequestDTO, VehicleVrdResponseDTO>(`/transport/vehicles/${vehicleId}/vrds`, "POST", requestDTO);
    }

    public async update(vrdId: number, requestDTO: VehicleVrdUpdateRequestDTO): Promise<VehicleVrdResponseDTO> {
        return await officeAPI<VehicleVrdUpdateRequestDTO, VehicleVrdResponseDTO>(`/transport/vrds/${vrdId}`, "PUT", requestDTO);
    }
}
