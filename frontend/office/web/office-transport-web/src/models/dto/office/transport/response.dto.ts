import { ExplorerFileDTO, ExplorerFolderDTO, ExplorerItemDTO, MaintenanceLogDTO, PersonSummaryDTO, VehicleDetailDTO, VehicleDTO, VehicleVrdDTO, VrdSubmissionDTO } from "./object.dto";

export interface OfficeTransportUserVerifyResponseDTO {
    id: number;
    uid: string;
    roles: Set<string> | string[];
    createdAt: string;
    updatedAt: string;
}

export type VehicleResponseDTO = VehicleDTO;

export interface VehicleDetailResponseDTO {
    // Nested structure matching Spring Boot VehicleDetailResponseDTO
    vehicle?: VehicleDTO;
    detail?: VehicleDetailDTO;
    vrds?: VehicleVrdDTO[];
    owner?: PersonSummaryDTO;

    // Direct flat properties for backwards compatibility with legacy UI
    id?: number;
    licensePlate?: string;
    registrationMark?: string;
    chassisNumber?: string;
    chassisNo?: string;
    engineNumber?: string;
    engineNo?: string;
    make?: string;
    model?: string;
    yearOfManufacture?: number;
    vehicleClass?: string;
    bodyType?: string;
    color?: string;
    fuelType?: string;
    seatingCapacity?: number;
    seatCapacity?: number;
    grossVehicleWeightKg?: number;
    engineCapacityCc?: number;
    cylinderCapacityCc?: number;
    ownerUid?: string;
    avatarUrl?: string;
    vrdExpiryDate?: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;

    logs?: MaintenanceLogDTO[];
    files?: ExplorerFileDTO[];
    totalAssetsCount?: number;
    foldersCount?: number;
    pendingVrdCount?: number;
    ownerName?: string;
    ownerMobile?: string;
    ownerEmail?: string;
}

export type VehicleVrdResponseDTO = VehicleVrdDTO;

export type VrdSubmissionResponseDTO = VrdSubmissionDTO;

export type ExplorerItemResponseDTO = ExplorerItemDTO;

export interface VehicleExplorerResponseDTO {
    vehicleId: number;
    vehicleUid: string;
    currentFolder: string;
    items: ExplorerItemDTO[];
    hasWarnings: boolean;
    vehicle?: VehicleResponseDTO;
    folders?: ExplorerFolderDTO[];
    files?: ExplorerFileDTO[];
    nasRoot?: string;
}

export interface FileContentResponseDTO {
    file: ExplorerFileDTO;
    content: string;
    previewType: string;
    pdfData?: any;
    sheetData?: any;
    docData?: any;
    imageDimensions?: string;
    codeData?: any;
}
