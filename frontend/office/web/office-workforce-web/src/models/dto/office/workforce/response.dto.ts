export interface OfficeWorkforceUserVerifyResponseDTO {
    id: number;
    uid: string;
    roles: Set<string>;
    createdAt: string;
    updatedAt: string;
}