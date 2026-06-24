export interface OfficeAccountOfficeUserVerifyResponseDTO {
    id: number;
    uid: string;
    name: string;
    email: string;
    displayName: string;
    roles: Set<string>;
    createdAt: string;
    updatedAt: string;
}
export interface OfficeAccountAuthTokenResponseDTO {
    id: number;
    uid: string;
    name: string;
    email: string;
    displayName: string;
    token: string;
}