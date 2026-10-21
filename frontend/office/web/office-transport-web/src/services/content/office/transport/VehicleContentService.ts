import officeAPI from "@/api/office.api";
import { PageParams, PaginationBaseResponseDTO } from "@/models/dto/base/base.dto";
import { VehicleAvatarUpdateRequestDTO, VehicleCreateRequestDTO, VehicleUpdateRequestDTO, VehicleVrdExpiryUpdateRequestDTO } from "@/models/dto/office/transport/request.dto";
import { VehicleDetailResponseDTO, VehicleResponseDTO } from "@/models/dto/office/transport/response.dto";

export default class VehicleContentService {
    private static readonly INSTANCE: VehicleContentService;
    private constructor() {
    }
    public static getInstance(): VehicleContentService {
        if (VehicleContentService.INSTANCE) {
            return VehicleContentService.INSTANCE;
        }
        return new VehicleContentService();
    }

    public async create(requestDTO: VehicleCreateRequestDTO): Promise<VehicleResponseDTO> {
        const payload: any = {
            ...requestDTO,
            licensePlate: requestDTO.licensePlate || requestDTO.registrationMark,
            chassisNumber: requestDTO.chassisNumber || requestDTO.chassisNo,
            engineNumber: requestDTO.engineNumber || requestDTO.engineNo,
            engineCapacityCc: requestDTO.engineCapacityCc ?? requestDTO.cylinderCapacityCc,
            seatingCapacity: requestDTO.seatingCapacity ?? requestDTO.seatCapacity,
            personUid: requestDTO.personUid || requestDTO.ownerUid || "00000000-0000-0000-0000-000000000001"
        };
        const res = await officeAPI<any, VehicleResponseDTO>(`/transport/vehicles`, "POST", payload);
        return this.normalizeVehicle(res);
    }

    public async update(id: number, requestDTO: VehicleUpdateRequestDTO): Promise<VehicleResponseDTO> {
        const payload: any = {
            ...requestDTO,
            licensePlate: requestDTO.licensePlate || requestDTO.registrationMark,
            chassisNumber: requestDTO.chassisNumber || requestDTO.chassisNo,
            engineNumber: requestDTO.engineNumber || requestDTO.engineNo,
            engineCapacityCc: requestDTO.engineCapacityCc ?? requestDTO.cylinderCapacityCc,
            seatingCapacity: requestDTO.seatingCapacity ?? requestDTO.seatCapacity,
        };
        const res = await officeAPI<any, VehicleResponseDTO>(`/transport/vehicles/${id}`, "PUT", payload);
        return this.normalizeVehicle(res);
    }

    public async delete(id: number): Promise<void> {
        return await officeAPI<null, void>(`/transport/vehicles/${id}`, "DELETE", null);
    }

    public async findById(id: number): Promise<VehicleResponseDTO> {
        const res = await officeAPI<null, VehicleResponseDTO>(`/transport/vehicles/${id}`, "GET", null);
        return this.normalizeVehicle(res);
    }

    public async findDetailsById(id: number): Promise<VehicleDetailResponseDTO> {
        const res = await officeAPI<null, any>(`/transport/vehicles/details/${id}`, "GET", null);
        return this.normalizeVehicleDetail(res);
    }

    public async findAllS1(page: PageParams = { page: 0, size: 20 }): Promise<PaginationBaseResponseDTO<VehicleResponseDTO>> {
        const p = page.page ?? 0;
        const s = page.size ?? 20;
        const res = await officeAPI<null, PaginationBaseResponseDTO<VehicleResponseDTO>>(`/transport/vehicles?page=${p}&size=${s}`, "GET", null);
        if (res && Array.isArray(res.content)) {
            res.content = res.content.map(v => this.normalizeVehicle(v));
        }
        return res;
    }

    public async searchS1(q: string, page: PageParams = { page: 0, size: 20 }): Promise<PaginationBaseResponseDTO<VehicleResponseDTO>> {
        const p = page.page ?? 0;
        const s = page.size ?? 20;
        const res = await officeAPI<null, PaginationBaseResponseDTO<VehicleResponseDTO>>(`/transport/vehicles/search?q=${encodeURIComponent(q)}&page=${p}&size=${s}`, "GET", null);
        if (res && Array.isArray(res.content)) {
            res.content = res.content.map(v => this.normalizeVehicle(v));
        }
        return res;
    }

    public async updateAvatar(id: number, avatarUrl: string): Promise<VehicleResponseDTO> {
        const res = await officeAPI<VehicleAvatarUpdateRequestDTO, VehicleResponseDTO>(
            `/transport/vehicles/${id}/avatar`,
            "PUT",
            { avatarUrl }
        );
        return this.normalizeVehicle(res);
    }

    public async updateVrdExpiry(id: number, vrdExpiryDate: string | null): Promise<VehicleResponseDTO> {
        const res = await officeAPI<VehicleVrdExpiryUpdateRequestDTO, VehicleResponseDTO>(
            `/transport/vehicles/${id}/vrd-expiry`,
            "PUT",
            { vrdExpiryDate }
        );
        return this.normalizeVehicle(res);
    }

    public normalizeVehicle(v: any): VehicleResponseDTO {
        if (!v) return v;
        return {
            ...v,
            registrationMark: v.registrationMark || v.licensePlate,
            licensePlate: v.licensePlate || v.registrationMark,
            chassisNo: v.chassisNo || v.chassisNumber,
            chassisNumber: v.chassisNumber || v.chassisNo,
            engineNo: v.engineNo || v.engineNumber,
            engineNumber: v.engineNumber || v.engineNo,
            seatCapacity: v.seatCapacity ?? v.seatingCapacity,
            seatingCapacity: v.seatingCapacity ?? v.seatCapacity,
            cylinderCapacityCc: v.cylinderCapacityCc ?? v.engineCapacityCc,
            engineCapacityCc: v.engineCapacityCc ?? v.cylinderCapacityCc,
            ownerUid: v.ownerUid || v.personUid,
            personUid: v.personUid || v.ownerUid
        };
    }

    public normalizeVehicleDetail(data: any): VehicleDetailResponseDTO {
        if (!data) return data;
        const v = data.vehicle ? this.normalizeVehicle(data.vehicle) : this.normalizeVehicle(data);
        const detail = data.detail || {};
        const owner = data.owner || {};
        const vrds = data.vrds || (v as any).vrds || [];

        return {
            ...v,
            vehicle: v,
            detail,
            owner,
            vrds,
            ownerName: owner.nameEnglish || owner.nameChinese || v.ownerName || data.ownerName,
            ownerMobile: owner.mobileTel || v.ownerMobile,
            ownerEmail: owner.email || v.ownerEmail,
            totalAssetsCount: data.totalAssetsCount || vrds.length,
            foldersCount: data.foldersCount || 0,
            pendingVrdCount: data.pendingVrdCount || 0
        };
    }

    public getDisplayName(vehicle: VehicleResponseDTO): string {
        if (vehicle.registrationMark || vehicle.licensePlate) {
            return vehicle.registrationMark || vehicle.licensePlate;
        }
        return `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || `Vehicle #${vehicle.id}`;
    }
}
