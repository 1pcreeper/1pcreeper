export interface VehicleCreateRequestDTO {
    // Backend field: personUid (required)
    personUid?: string;
    ownerUid?: string;

    // Backend field: licensePlate (required)
    licensePlate?: string;
    // Frontend alias: registrationMark
    registrationMark?: string;

    // Backend field: chassisNumber
    chassisNumber?: string;
    // Frontend alias: chassisNo
    chassisNo?: string;

    // Backend field: engineNumber
    engineNumber?: string;
    // Frontend alias: engineNo
    engineNo?: string;

    make: string;
    model: string;
    yearOfManufacture?: number;
    vehicleClass: string;
    bodyType?: string;
    color?: string;
    fuelType?: string;

    // Backend field: seatingCapacity
    seatingCapacity?: number;
    // Frontend alias: seatCapacity
    seatCapacity?: number;

    // Backend field: engineCapacityCc
    engineCapacityCc?: number;
    // Frontend alias: cylinderCapacityCc
    cylinderCapacityCc?: number;

    grossVehicleWeightKg?: number;
    ownerType?: string;
    avatarUrl?: string;
    vrdExpiryDate?: string | null;

    // Optional 1-to-1 detail
    insurancePolicyNumber?: string;
    insuranceCompany?: string;
    insuranceExpiryDate?: string;
    firstRegistrationDate?: string;
    notes?: string;
}

export interface VehicleUpdateRequestDTO {
    id?: number;
    personUid?: string;
    ownerUid?: string;

    // Backend field: licensePlate
    licensePlate?: string;
    // Frontend alias: registrationMark
    registrationMark?: string;

    // Backend field: chassisNumber
    chassisNumber?: string;
    // Frontend alias: chassisNo
    chassisNo?: string;

    // Backend field: engineNumber
    engineNumber?: string;
    // Frontend alias: engineNo
    engineNo?: string;

    make?: string;
    model?: string;
    yearOfManufacture?: number;
    vehicleClass?: string;
    bodyType?: string;
    color?: string;
    fuelType?: string;

    // Backend field: seatingCapacity
    seatingCapacity?: number;
    seatCapacity?: number;

    // Backend field: engineCapacityCc
    engineCapacityCc?: number;
    cylinderCapacityCc?: number;

    grossVehicleWeightKg?: number;
    ownerType?: string;
    avatarUrl?: string;
    isActive?: boolean;
    vrdExpiryDate?: string | null;

    // Optional 1-to-1 detail
    insurancePolicyNumber?: string;
    insuranceCompany?: string;
    insuranceExpiryDate?: string;
    firstRegistrationDate?: string;
    notes?: string;
}

export interface VehicleAvatarUpdateRequestDTO {
    avatarUrl: string;
}

export interface VehicleVrdExpiryUpdateRequestDTO {
    vrdExpiryDate: string | null;
}

export interface VehicleVrdCreateRequestDTO {
    documentNumber?: string;
    registrationMark: string;
    registeredOwnerName?: string;
    registeredOwnerAddress?: string;
    ownerNameEn?: string;
    ownerNameZh?: string;
    issueDate?: string;
    expiryDate: string;
    fileKey: string;
    sha256: string;
    byteSize: number;
    mediaType: string;
    status?: string;
    idDocType?: string;
    idDocPrefix?: string;
    addressBuilding?: string;
    addressStreet?: string;
    addressDistrict?: string;
    addressTerritory?: string;
    isCurrent?: boolean;
    minioPath?: string;
    fileName?: string;
    fileUrl?: string;
}

export interface VehicleVrdUpdateRequestDTO {
    documentNumber?: string;
    registrationMark?: string;
    registeredOwnerName?: string;
    registeredOwnerAddress?: string;
    issueDate?: string;
    expiryDate?: string;
    status?: string;
    ownerNameEn?: string;
    ownerNameZh?: string;
    idDocType?: string;
    idDocPrefix?: string;
    addressBuilding?: string;
    addressStreet?: string;
    addressDistrict?: string;
    addressTerritory?: string;
    isCurrent?: boolean;
}

export interface VrdSubmissionUpdateRequestDTO {
    data: any;
}

export interface VrdSubmissionApproveRequestDTO {
    scannedData?: any;
}

export interface VrdSubmissionDeclineRequestDTO {
    reason?: string;
}

export interface ExplorerFolderCreateRequestDTO {
    parentPath?: string;
    folderName: string;
}

export interface ExplorerItemDeleteRequestDTO {
    relativePath: string;
}

export interface ExplorerItemMoveRequestDTO {
    sourcePath: string;
    targetPath: string;
}
