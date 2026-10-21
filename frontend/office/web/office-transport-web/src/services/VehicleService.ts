import { baseApi } from '../lib/api.ts';
import VehicleContentService from './content/office/transport/VehicleContentService.ts';
import {
    GetVehiclesRequestDTO,
    CreateVehicleRequestDTO,
    GetVehicleDetailsRequestDTO,
    UpdateVehicleRequestDTO,
    UpdateVehicleAvatarRequestDTO,
    UpdateVehicleVrdExpiryRequestDTO,
    GetVehicleExplorerRequestDTO,
    CreateExplorerFolderRequestDTO,
    CreateExplorerFileRequestDTO,
    DeleteExplorerItemRequestDTO,
    GetFileContentRequestDTO,
    UploadDocumentRequestDTO,
    MoveDocumentRequestDTO,
    ScanVrdDocumentRequestDTO,
    GetVrdSubmissionsRequestDTO,
    UploadVehicleVrdOcrRequestDTO,
    UpdateVrdSubmissionRequestDTO,
    ApproveVrdSubmissionRequestDTO,
    DeclineVrdSubmissionRequestDTO,
    GetVehicleVrdsRequestDTO,
    UpdateVrdRequestDTO
} from '../models/dto/request.ts';
import {
    APIBaseResponseDTO,
    GetVehiclesResponseDTO,
    CreateVehicleResponseDTO,
    GetVehicleDetailsResponseDTO,
    UpdateVehicleResponseDTO,
    UpdateVehicleAvatarResponseDTO,
    UpdateVehicleVrdExpiryResponseDTO,
    GetVehicleExplorerResponseDTO,
    CreateExplorerFolderResponseDTO,
    CreateExplorerFileResponseDTO,
    DeleteExplorerItemResponseDTO,
    GetFileContentResponseDTO,
    UploadDocumentResponseDTO,
    MoveDocumentResponseDTO,
    ScanVrdDocumentResponseDTO,
    GetVrdSubmissionsResponseDTO,
    UploadVehicleVrdOcrResponseDTO,
    UpdateVrdSubmissionResponseDTO,
    ApproveVrdSubmissionResponseDTO,
    DeclineVrdSubmissionResponseDTO,
    GetVehicleVrdsResponseDTO,
    UpdateVrdResponseDTO
} from '../models/dto/response.ts';

export default class VehicleService {
    private static INSTANCE: VehicleService;
    private constructor() {}
    
    public static getInstance(): VehicleService {
        if (!VehicleService.INSTANCE) {
            VehicleService.INSTANCE = new VehicleService();
        }
        return VehicleService.INSTANCE;
    }
    
    public async getVehicles(request?: GetVehiclesRequestDTO | string): Promise<APIBaseResponseDTO<GetVehiclesResponseDTO>> {
        const search = typeof request === 'string' ? request : request?.search;
        const endpoint = search
            ? `/transport/vehicles/search?q=${encodeURIComponent(search)}`
            : `/transport/vehicles`;
        const res = await baseApi<void, any>(endpoint, 'GET');
        
        // Normalize Spring Boot PaginationBaseResponseDTO { content: [...] } to array
        let vehicleList: any = res.data;
        if (res.data && Array.isArray((res.data as any).content)) {
            vehicleList = (res.data as any).content;
        }
        if (Array.isArray(vehicleList)) {
            vehicleList = vehicleList.map(v => VehicleContentService.getInstance().normalizeVehicle(v));
        }
        return {
            ...res,
            data: vehicleList
        };
    }
    
    public async getVehicleDetails(request: GetVehicleDetailsRequestDTO | number, page: number = 0, size: number = 10): Promise<APIBaseResponseDTO<GetVehicleDetailsResponseDTO>> {
        const id = typeof request === 'number' ? request : request.id;
        let res: any;
        try {
            res = await baseApi<void, any>(`/transport/vehicles/details/${id}`, 'GET');
        } catch {
            res = await baseApi<void, any>(`/transport/vehicles/${id}?page=${page}&size=${size}`, 'GET');
        }
        const normalized = VehicleContentService.getInstance().normalizeVehicleDetail(res.data);
        return {
            ...res,
            data: normalized as GetVehicleDetailsResponseDTO
        };
    }

    public async updateVehicleAvatar(request: UpdateVehicleAvatarRequestDTO | { id: number; avatarUrl: string }): Promise<APIBaseResponseDTO<UpdateVehicleAvatarResponseDTO>> {
        return await baseApi<{ avatarUrl: string }, UpdateVehicleAvatarResponseDTO>(
            `/transport/vehicles/${request.id}/avatar`,
            'PUT',
            { avatarUrl: request.avatarUrl }
        );
    }

    public async updateVehicleVrdExpiry(request: UpdateVehicleVrdExpiryRequestDTO | number, vrdExpiryDate?: string | null): Promise<APIBaseResponseDTO<UpdateVehicleVrdExpiryResponseDTO>> {
        const id = typeof request === 'number' ? request : request.id;
        const date = typeof request === 'number' ? (vrdExpiryDate ?? null) : (request.vrdExpiryDate ?? null);
        return await baseApi<{ vrdExpiryDate: string | null }, UpdateVehicleVrdExpiryResponseDTO>(
            `/transport/vehicles/${id}/vrd-expiry`,
            'PUT',
            { vrdExpiryDate: date }
        );
    }

    public async updateVehicle(request: UpdateVehicleRequestDTO): Promise<APIBaseResponseDTO<UpdateVehicleResponseDTO>> {
        const payload: any = {
            ...request,
            licensePlate: (request as any).licensePlate || (request as any).registrationMark,
            chassisNumber: (request as any).chassisNumber || (request as any).chassisNo,
            engineNumber: (request as any).engineNumber || (request as any).engineNo,
            engineCapacityCc: (request as any).engineCapacityCc ?? (request as any).cylinderCapacityCc,
            seatingCapacity: (request as any).seatingCapacity ?? (request as any).seatCapacity,
        };
        const res = await baseApi<any, UpdateVehicleResponseDTO>(
            `/transport/vehicles/${request.id}`,
            'PUT',
            payload
        );
        return {
            ...res,
            data: VehicleContentService.getInstance().normalizeVehicle(res.data) as UpdateVehicleResponseDTO
        };
    }

    public async deleteVehicle(id: number): Promise<APIBaseResponseDTO<void>> {
        return await baseApi<void, void>(`/transport/vehicles/${id}`, 'DELETE');
    }

    public async getVehicleExplorer(request: GetVehicleExplorerRequestDTO | number, folder?: string): Promise<APIBaseResponseDTO<GetVehicleExplorerResponseDTO>> {
        const id = typeof request === 'number' ? request : request.id;
        const folderParam = folder ? `?folder=${encodeURIComponent(folder)}` : '';
        return await baseApi<void, GetVehicleExplorerResponseDTO>(`/transport/vehicles/${id}/explorer${folderParam}`, 'GET');
    }

    public async createExplorerFolder(request: CreateExplorerFolderRequestDTO | number, name?: string, parent?: string | null): Promise<APIBaseResponseDTO<CreateExplorerFolderResponseDTO>> {
        const req: CreateExplorerFolderRequestDTO = typeof request === 'number' 
            ? { vehicleId: request, name: name!, parent } 
            : request;
        return await baseApi<{ folderName: string; parentPath?: string | null; name?: string; parent?: string | null }, CreateExplorerFolderResponseDTO>(
            `/transport/vehicles/${req.vehicleId}/explorer/folders`, 
            'POST', 
            { 
                folderName: req.name,
                parentPath: req.parent,
                name: req.name,
                parent: req.parent 
            }
        );
    }

    public async createExplorerFile(request: CreateExplorerFileRequestDTO | number, fileData?: any): Promise<APIBaseResponseDTO<CreateExplorerFileResponseDTO>> {
        const req: CreateExplorerFileRequestDTO = typeof request === 'number'
            ? { vehicleId: request, ...fileData }
            : request;
        return await baseApi<any, CreateExplorerFileResponseDTO>(
            `/transport/vehicles/${req.vehicleId}/explorer/files`,
            'POST',
            req
        );
    }

    public async deleteExplorerItem(request: DeleteExplorerItemRequestDTO | number, item?: any): Promise<APIBaseResponseDTO<DeleteExplorerItemResponseDTO>> {
        const req: DeleteExplorerItemRequestDTO = typeof request === 'number'
            ? { vehicleId: request, ...item }
            : request;
        const relativePath = (req as any).relativePath || (req as any).path || (req as any).name || (item?.name) || '';
        return await baseApi<any, DeleteExplorerItemResponseDTO>(
            `/transport/vehicles/${req.vehicleId}/explorer/items`,
            'DELETE',
            { relativePath, ...req }
        );
    }

    public async getFileContent(request: GetFileContentRequestDTO | number, pathOrFolder?: string): Promise<APIBaseResponseDTO<GetFileContentResponseDTO>> {
        const fileId = typeof request === 'number' ? request : request.fileId;
        const queryPath = pathOrFolder ? `?path=${encodeURIComponent(pathOrFolder)}` : '';
        return await baseApi<void, GetFileContentResponseDTO>(`/transport/vehicles/${fileId}/explorer/content${queryPath}`, 'GET');
    }
    
    public async createVehicle(request: CreateVehicleRequestDTO): Promise<APIBaseResponseDTO<CreateVehicleResponseDTO>> {
        const payload: any = {
            ...request,
            licensePlate: (request as any).licensePlate || (request as any).registrationMark,
            chassisNumber: (request as any).chassisNumber || (request as any).chassisNo,
            engineNumber: (request as any).engineNumber || (request as any).engineNo,
            engineCapacityCc: (request as any).engineCapacityCc ?? (request as any).cylinderCapacityCc,
            seatingCapacity: (request as any).seatingCapacity ?? (request as any).seatCapacity,
            personUid: (request as any).personUid || (request as any).ownerUid || "00000000-0000-0000-0000-000000000001"
        };
        const res = await baseApi<any, CreateVehicleResponseDTO>('/transport/vehicles', 'POST', payload);
        return {
            ...res,
            data: VehicleContentService.getInstance().normalizeVehicle(res.data) as CreateVehicleResponseDTO
        };
    }
    
    public async uploadDocument(request: UploadDocumentRequestDTO | File, vehicleId?: number, folder: string = 'General'): Promise<APIBaseResponseDTO<UploadDocumentResponseDTO>> {
        const file = request instanceof File ? request : request.file;
        const vId = request instanceof File ? vehicleId! : request.vehicleId;
        const fld = request instanceof File ? folder : (request.folder || 'General');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('vehicleId', vId.toString());
        formData.append('folder', fld);
        formData.append('folderPath', fld);
        return await baseApi<FormData, UploadDocumentResponseDTO>(`/transport/vehicles/${vId}/explorer/files`, 'POST', formData, true);
    }

    public async moveDocument(request: MoveDocumentRequestDTO | number, targetFolder?: string, vehicleId?: number): Promise<APIBaseResponseDTO<MoveDocumentResponseDTO>> {
        const req: MoveDocumentRequestDTO = typeof request === 'number' ? { fileId: request, folder: targetFolder! } : request;
        const vId = vehicleId || 1;
        return await baseApi<{ sourcePath?: string; targetPath?: string; folder?: string }, MoveDocumentResponseDTO>(
            `/transport/vehicles/${vId}/explorer/move`,
            'PUT',
            {
                sourcePath: (req as any).sourcePath || String(req.fileId),
                targetPath: req.folder,
                folder: req.folder
            }
        );
    }
    
    public async scanVrdDocument(request: ScanVrdDocumentRequestDTO | File): Promise<APIBaseResponseDTO<ScanVrdDocumentResponseDTO>> {
        const file = request instanceof File ? request : request.file;
        const formData = new FormData();
        formData.append('file', file);
        return await baseApi<FormData, ScanVrdDocumentResponseDTO>('/transport/vehicles/1/scans/hk_vrds', 'POST', formData, true);
    }

    // VRD OCR Object Storage & Approval Queue API
    public async getVrdSubmissions(request: GetVrdSubmissionsRequestDTO | number): Promise<APIBaseResponseDTO<GetVrdSubmissionsResponseDTO>> {
        const vehicleId = typeof request === 'number' ? request : request.vehicleId;
        return await baseApi<void, GetVrdSubmissionsResponseDTO>(`/transport/vehicles/${vehicleId}/vrd-submissions`, 'GET');
    }

    public async getPendingVrdSubmissions(page: number = 0, size: number = 20): Promise<APIBaseResponseDTO<any>> {
        return await baseApi<void, any>(`/transport/vrd-submissions/pending?page=${page}&size=${size}`, 'GET');
    }

    public async uploadVehicleVrdOcr(request: UploadVehicleVrdOcrRequestDTO | number, file?: File): Promise<APIBaseResponseDTO<UploadVehicleVrdOcrResponseDTO>> {
        const vId = typeof request === 'number' ? request : request.vehicleId;
        const fl = typeof request === 'number' ? file! : request.file;
        const formData = new FormData();
        formData.append('file', fl);
        return await baseApi<FormData, UploadVehicleVrdOcrResponseDTO>(`/transport/vehicles/${vId}/scans/hk_vrds`, 'POST', formData, true);
    }

    public async updateVrdSubmission(request: UpdateVrdSubmissionRequestDTO | number, subId?: number, data?: any): Promise<APIBaseResponseDTO<UpdateVrdSubmissionResponseDTO>> {
        const vId = typeof request === 'number' ? request : request.vehicleId;
        const sId = typeof request === 'number' ? subId! : request.subId;
        const body = typeof request === 'number' ? data : request.data;
        return await baseApi<any, UpdateVrdSubmissionResponseDTO>(`/transport/vehicles/${vId}/vrd-submissions/${sId}`, 'PUT', body);
    }

    public async approveVrdSubmission(request: ApproveVrdSubmissionRequestDTO | number, subId?: number, data?: any): Promise<APIBaseResponseDTO<ApproveVrdSubmissionResponseDTO>> {
        const vId = typeof request === 'number' ? request : request.vehicleId;
        const sId = typeof request === 'number' ? subId! : request.subId;
        const body = typeof request === 'number' ? (data || {}) : (request.scannedData ? { scannedData: request.scannedData } : {});
        return await baseApi<any, ApproveVrdSubmissionResponseDTO>(`/transport/vehicles/${vId}/vrd-submissions/${sId}/approve`, 'POST', body);
    }

    public async declineVrdSubmission(request: DeclineVrdSubmissionRequestDTO | number, subId?: number, reason?: string): Promise<APIBaseResponseDTO<DeclineVrdSubmissionResponseDTO>> {
        const vId = typeof request === 'number' ? request : request.vehicleId;
        const sId = typeof request === 'number' ? subId! : request.subId;
        const rsn = typeof request === 'number' ? reason : request.reason;
        return await baseApi<{ reason?: string }, DeclineVrdSubmissionResponseDTO>(`/transport/vehicles/${vId}/vrd-submissions/${sId}/decline`, 'POST', { reason: rsn });
    }

    public async getVehicleVrds(request: GetVehicleVrdsRequestDTO | number): Promise<APIBaseResponseDTO<GetVehicleVrdsResponseDTO>> {
        const vehicleId = typeof request === 'number' ? request : request.vehicleId;
        return await baseApi<void, GetVehicleVrdsResponseDTO>(`/transport/vehicles/${vehicleId}/vrds`, 'GET');
    }

    public async createVehicleVrd(vehicleId: number, requestDTO: any): Promise<APIBaseResponseDTO<any>> {
        return await baseApi<any, any>(`/transport/vehicles/${vehicleId}/vrds`, 'POST', requestDTO);
    }

    public async updateVrd(request: UpdateVrdRequestDTO | number, data?: any): Promise<APIBaseResponseDTO<UpdateVrdResponseDTO>> {
        const vrdId = typeof request === 'number' ? request : request.vrdId;
        const body = typeof request === 'number' ? data : request.data;
        return await baseApi<any, UpdateVrdResponseDTO>(`/transport/vrds/${vrdId}`, 'PUT', body);
    }

    public async searchPersons(q: string = ''): Promise<any[]> {
        const queryParam = q ? `?q=${encodeURIComponent(q)}` : '';
        try {
            const res = await baseApi<void, any>(`/transport/persons/search${queryParam}`, 'GET');
            if (Array.isArray(res.data)) return res.data;
            if (res.data && Array.isArray((res.data as any).content)) return (res.data as any).content;
            return [];
        } catch {
            try {
                const fallback = await baseApi<void, any>(`/workforce/persons/search${queryParam}`, 'GET');
                if (Array.isArray(fallback.data)) return fallback.data;
                if (fallback.data && Array.isArray((fallback.data as any).content)) return (fallback.data as any).content;
            } catch {}
            return [];
        }
    }

    public async getPersonByUid(uid: string): Promise<any | null> {
        try {
            const res = await baseApi<void, any>(`/transport/persons/${uid}`, 'GET');
            return res.data || null;
        } catch {
            return null;
        }
    }
}

