export type Vector3DTO = [number, number, number];
export type DimensionType = "maps" | "spots" | "places";
export type ObjectType =
    | "CHAIR"
    | "TABLE"
    | "LAMP"
    | "PLANT"
    | "BUILDING"
    | "BOX"
    | "SPHERE"
    | "GROUND"
    | "BARRIER"
    | "LIGHT"
    | "DOOR"
    | "OBJ"
    | "ASSET";
export type TransformMode = "translate" | "rotate" | "scale";
export interface TransformDTO {
    position: Vector3DTO;
    rotation: Vector3DTO;
    scale: Vector3DTO;
}
export type InteractionDTO =
    | { type: "PRODUCT"; productId: string }
    | { type: "TELEPORT"; destination: { type: DimensionType; id: string; position: Vector3DTO; yaw: number } };
export interface SceneObjectDTO extends TransformDTO {
    id: string;
    name: string;
    type: ObjectType;
    color: string;
    colorOverride?: boolean;
    visible: boolean;
    assetId?: string;
    assetVersionId?: string;
    interaction?: InteractionDTO;
    objSource?: string;
    textureId?: string;
    productId?: string;
    target?: { type: DimensionType; id: string };
    intensity?: number;
    longitude?: number;
    latitude?: number;
}
export interface SceneResponseDTO {
    draftRevision?: number;
    id: string;
    uid: string;
    type: DimensionType;
    name: string;
    description: string;
    merchantId?: string;
    parent?: { type: DimensionType; id: string };
    status: "DRAFT" | "PUBLISHED";
    version: number;
    objectCount?: number;
    objects: SceneObjectDTO[];
    updatedAt: string;
    longitude: number;
    latitude: number;
}
export interface ProductResponseDTO {
    assetId?: string;
    assetVersionId?: string;
    id: string;
    name: string;
    merchant: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    material: string;
    dimensions: string;
    color: string;
    type: ObjectType;
}
export interface TextureResponseDTO {
    id: string;
    name: string;
    url: string;
}
export interface MeshResponseDTO {
    id: string;
    name: string;
    description: string;
    category: string;
    version: number;
    versionId?: string;
    objectCount?: number;
    previewType?: ObjectType;
    previewColor?: string;
    status: "DRAFT" | "PUBLISHED";
    objects: SceneObjectDTO[];
    glbUrl?: string;
    updatedAt: string;
}
export interface MerchantResponseDTO {
    id: string;
    uid: string;
    name: string;
    email: string;
    status: "PENDING" | "APPROVED";
    category: string;
}
export interface AccountResponseDTO {
    id: number;
    uid: string;
    name: string;
    email: string;
    displayName: string;
    roles: string[];
    createdAt?: string;
    updatedAt?: string;
}
export interface MeshFragmentDTO {
    meshId: string;
    versionId: string;
    index: number;
    fragmentCount: number;
    byteLength: number;
    sha256: string;
    base64: string;
}
export interface ChunkQueryDTO {
    draftRevision?: number;
    interactiveOnly?: boolean;
    type: DimensionType;
    id: string;
    x: number;
    z: number;
    draft?: boolean;
    snapshotVersion: number;
}
export interface ObjectMutationDTO {
    operation: "UPSERT" | "DELETE";
    id: string;
    object?: SceneObjectDTO;
}
export interface DraftTransactionDTO {
    id: string;
    key: string;
    baseVersion: number;
    baseRevision: number;
    changes: ObjectMutationDTO[];
    nextPage: number;
    createdAt: number;
}
export interface MockStateDTO {
    schemaVersion?: number;
    meshVersions?: Record<string, MeshResponseDTO>;
    transactions?: Record<string, DraftTransactionDTO>;
    revision: number;
    scenes: SceneResponseDTO[];
    drafts: Record<string, SceneResponseDTO>;
    meshes: MeshResponseDTO[];
    textures: TextureResponseDTO[];
    merchants: MerchantResponseDTO[];
}
