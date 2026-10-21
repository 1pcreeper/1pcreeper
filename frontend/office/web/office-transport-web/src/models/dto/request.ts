/**
 * Request DTOs for Java Spring Boot and Frontend API Communication
 * Follows XXXRequestDTO naming pattern
 */

export interface LoginRequestDTO {
    name: string;
    password: string;
}

export interface VerifyTokenRequestDTO {
    token?: string;
}

export interface GetVehiclesRequestDTO {
    search?: string;
}

export interface CreateVehicleRequestDTO {
    registrationMark: string;
    chassisNo: string;
    engineNo?: string;
    make: string;
    model: string;
    yearOfManufacture?: number;
    vehicleClass: string;
    bodyType?: string;
    color?: string;
    fuelType?: string;
    seatCapacity?: number;
    grossVehicleWeightKg?: number;
    cylinderCapacityCc?: number;
    ownerUid?: string;
    ownerType?: string;
    avatarUrl?: string;
    vrdExpiryDate?: string | null;
}

export interface GetVehicleDetailsRequestDTO {
    id: number;
    page?: number;
    size?: number;
}

export interface UpdateVehicleRequestDTO {
    id: number;
    registrationMark?: string;
    chassisNo?: string;
    engineNo?: string;
    make?: string;
    model?: string;
    yearOfManufacture?: number;
    vehicleClass?: string;
    fuelType?: string;
    seatCapacity?: number;
    grossVehicleWeightKg?: number;
    cylinderCapacityCc?: number;
    avatarUrl?: string;
    isActive?: boolean;
    vrdExpiryDate?: string | null;
}

export interface UpdateVehicleAvatarRequestDTO {
    id: number;
    avatarUrl: string;
}

export interface UpdateVehicleVrdExpiryRequestDTO {
    id: number;
    vrdExpiryDate: string | null;
}

export interface GetVehicleExplorerRequestDTO {
    id: number;
}

export interface CreateExplorerFolderRequestDTO {
    vehicleId: number;
    name: string;
    parent?: string | null;
}

export interface CreateExplorerFileRequestDTO {
    vehicleId: number;
    fileName: string;
    folder: string;
    fileType?: string;
    content?: string;
    fileSize?: string;
    fileUrl?: string;
}

export interface DeleteExplorerItemRequestDTO {
    vehicleId: number;
    type: 'file' | 'folder';
    id?: number;
    folderName?: string;
    name?: string;
}

export interface GetFileContentRequestDTO {
    fileId: number;
}

export interface UploadDocumentRequestDTO {
    vehicleId: number;
    file: File;
    folder?: string;
}

export interface MoveDocumentRequestDTO {
    fileId: number;
    folder: string;
}

export interface ScanVrdDocumentRequestDTO {
    file: File;
}

export interface GetVrdSubmissionsRequestDTO {
    vehicleId: number;
}

export interface UploadVehicleVrdOcrRequestDTO {
    vehicleId: number;
    file: File;
}

export interface UpdateVrdSubmissionRequestDTO {
    vehicleId: number;
    subId: number;
    data: any;
}

export interface ApproveVrdSubmissionRequestDTO {
    vehicleId: number;
    subId: number;
    scannedData?: any;
}

export interface DeclineVrdSubmissionRequestDTO {
    vehicleId: number;
    subId: number;
    reason?: string;
}

export interface GetVehicleVrdsRequestDTO {
    vehicleId: number;
}

export interface UpdateVrdRequestDTO {
    vrdId: number;
    data: any;
}
