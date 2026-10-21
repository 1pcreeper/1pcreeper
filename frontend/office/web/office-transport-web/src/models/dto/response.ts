/**
 * Response DTOs for Java Spring Boot and Frontend API Communication
 * Base structure: APIBaseResponseDTO<T> { success: true, message: "", data: {} }
 * Specific response types follow XXXResponseDTO naming pattern
 */

export interface APIBaseResponseDTO<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface UserDTO {
  uid: string;
  email: string;
  role: string;
}

export interface LoginResponseDTO {
  token: string;
  user?: UserDTO;
}

export interface VerifyTokenResponseDTO {
  uid: string;
  email: string;
  role: string;
}

export interface VehicleItemResponseDTO {
  id: number;
  registrationMark: string;
  chassisNo: string;
  engineNo?: string;
  make: string;
  model: string;
  yearOfManufacture: number;
  vehicleClass: string;
  bodyType?: string;
  color?: string;
  fuelType?: string;
  seatCapacity?: number;
  grossVehicleWeightKg?: number;
  cylinderCapacityCc?: number;
  avatarUrl?: string;
  vrdExpiryDate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type GetVehiclesResponseDTO = VehicleItemResponseDTO[];

export type CreateVehicleResponseDTO = VehicleItemResponseDTO;

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

export interface VrdRecordDTO {
  id: number;
  vehicleId: number;
  issueDate: string;
  licensingOffice?: string;
  ownerNameEn?: string;
  ownerNameZh?: string;
  idDocType?: string;
  idDocPrefix?: string;
  addressBuilding?: string;
  addressStreet?: string;
  addressDistrict?: string;
  addressTerritory?: string;
  isCurrent: boolean;
  minioPath?: string;
  fileName?: string;
  fileUrl?: string;
}

export interface GetVehicleDetailsResponseDTO extends VehicleItemResponseDTO {
  vrds: VrdRecordDTO[];
  logs: MaintenanceLogDTO[];
  files: ExplorerFileDTO[];
  totalAssetsCount: number;
  foldersCount: number;
  pendingVrdCount: number;
}

export interface UpdateVehicleResponseDTO extends VehicleItemResponseDTO {}

export interface UpdateVehicleAvatarResponseDTO {
  id: number;
  avatarUrl: string;
  updatedAt: string;
}

export interface UpdateVehicleVrdExpiryResponseDTO {
  id: number;
  vrdExpiryDate: string | null;
  updatedAt: string;
}

export interface GetVehicleExplorerResponseDTO {
  vehicle: VehicleItemResponseDTO;
  folders: ExplorerFolderDTO[];
  files: ExplorerFileDTO[];
  nasRoot: string;
}

export type CreateExplorerFolderResponseDTO = ExplorerFolderDTO;

export type CreateExplorerFileResponseDTO = ExplorerFileDTO;

export interface DeleteExplorerItemResponseDTO {
  message: string;
  deletedCount?: number;
}

export interface GetFileContentResponseDTO {
  file: ExplorerFileDTO;
  content: string;
  previewType: string;
  pdfData?: any;
  sheetData?: any;
  docData?: any;
  imageDimensions?: string;
  codeData?: any;
}

export interface UploadDocumentResponseDTO {
  message: string;
  file: ExplorerFileDTO;
}

export type MoveDocumentResponseDTO = ExplorerFileDTO;

export interface ScanVrdDocumentResponseDTO {
  rawExtraction: any;
  structuredData: any;
}

export interface VrdSubmissionDTO {
  id: number;
  vehicleId: number;
  originalFileName: string;
  fileDataUrl: string;
  mimeType: string;
  status: 'PROCESSING' | 'PENDING' | 'SUCCESS' | 'APPROVED' | 'REJECTED';
  confidenceScore: number;
  uploadedAt: string;
  reviewedAt?: string;
  declinedAt?: string;
  declinedBy?: string;
  declineReason?: string;
  minioPath: string;
  ocrExtractedData?: any;
  committedVrdId?: number;
}

export type GetVrdSubmissionsResponseDTO = VrdSubmissionDTO[];

export interface UploadVehicleVrdOcrResponseDTO {
  message: string;
  submission: VrdSubmissionDTO;
}

export interface UpdateVrdSubmissionResponseDTO {
  message: string;
  submission: VrdSubmissionDTO;
}

export interface ApproveVrdSubmissionResponseDTO {
  message: string;
  vrd: VrdRecordDTO;
  submission: VrdSubmissionDTO;
}

export interface DeclineVrdSubmissionResponseDTO {
  message: string;
  submission: VrdSubmissionDTO;
}

export type GetVehicleVrdsResponseDTO = VrdRecordDTO[];

export interface UpdateVrdResponseDTO {
  message: string;
  vrd: VrdRecordDTO;
}
