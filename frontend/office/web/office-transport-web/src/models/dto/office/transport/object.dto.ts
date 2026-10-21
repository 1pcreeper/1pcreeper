import { FuelType, IdDocType, SubmissionStatus, VehicleClass } from "./enum.dto";

export interface VehicleDTO {
    id: number;
    uid?: string;
    personUid?: string;
    // Backend field name: licensePlate
    licensePlate: string;
    // Frontend alias: registrationMark
    registrationMark: string;
    make: string;
    model: string;
    yearOfManufacture: number;
    color?: string;
    // Backend field name: chassisNumber
    chassisNumber?: string;
    // Frontend alias: chassisNo
    chassisNo?: string;
    // Backend field name: engineNumber
    engineNumber?: string;
    // Frontend alias: engineNo
    engineNo?: string;
    // Backend field name: engineCapacityCc
    engineCapacityCc?: number;
    // Frontend alias: cylinderCapacityCc
    cylinderCapacityCc?: number;
    // Backend field name: seatingCapacity
    seatingCapacity?: number;
    // Frontend alias: seatCapacity
    seatCapacity?: number;
    fuelType?: FuelType | string;
    vehicleClass: VehicleClass | string;
    vrdExpiryDate?: string | null;
    avatarUrl?: string;
    bodyType?: string;
    grossVehicleWeightKg?: number;
    ownerUid?: string;
    ownerType?: string;
    isActive: boolean;
    ownerName?: string;
    ownerMobile?: string;
    ownerEmail?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface VehicleDetailDTO {
    id?: number;
    vehicleId?: number;
    insurancePolicyNumber?: string;
    insuranceCompany?: string;
    insuranceExpiryDate?: string;
    firstRegistrationDate?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PersonSummaryDTO {
    uid?: string;
    nameEnglish?: string;
    nameChinese?: string;
    mobileTel?: string;
    officeTel?: string;
    email?: string;
    hkId?: string;
    isActive?: boolean;
}

export interface VehicleVrdDTO {
    id: number;
    uid?: string;
    vehicleId: number;
    documentNumber?: string;
    registrationMark: string;
    registeredOwnerName?: string;
    registeredOwnerAddress?: string;
    ownerNameEn?: string;
    ownerNameZh?: string;
    idDocType?: IdDocType | string;
    idDocPrefix?: string;
    addressBuilding?: string;
    addressStreet?: string;
    addressDistrict?: string;
    addressTerritory?: string;
    issueDate: string;
    expiryDate?: string;
    fileKey?: string;
    sha256?: string;
    byteSize?: number;
    mediaType?: string;
    status?: string;
    isCurrent?: boolean;
    minioPath?: string;
    fileName?: string;
    fileUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface VrdSubmissionDTO {
    id: number;
    uid?: string;
    vehicleId: number;
    originalFileName?: string;
    fileKey?: string;
    sha256?: string;
    byteSize?: number;
    mediaType?: string;
    ocrRawData?: any;
    ocrExtractedData?: any;
    fileDataUrl?: string;
    status: SubmissionStatus | string;
    confidenceScore?: number;
    reviewedByUserId?: number;
    reviewedAt?: string;
    declinedAt?: string;
    declinedBy?: string;
    declineReason?: string;
    minioPath?: string;
    committedVrdId?: number;
    uploadedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ExplorerItemDTO {
    name: string;
    relativePath: string;
    isFolder: boolean;
    byteSize: number;
    lastModified: string;
    isAccessible: boolean;
    warningSignal?: string;
    warningMessage?: string;
}

export interface ExplorerFolderDTO {
    id: number;
    vehicleId: number;
    name: string;
    parent?: string | null;
}

export interface ExplorerFileDTO {
    id: number;
    vehicleId: number;
    fileName: string;
    folder: string;
    fileType: string;
    fileSize: string;
    fileUrl?: string;
    nasPath?: string;
    uploadedAt: string;
}

export interface MaintenanceLogDTO {
    id: number;
    vehicleId: number;
    date: string;
    mileage: number;
    description: string;
    cost: number;
}
