import { WorkType } from "./enum.dto";

export interface CompanyDetailRequestDTO {
    bio: string;
    address: string;
    industry: string;
    website: string;
}

export interface CompanyCreateRequestDTO {
    nameEnglish: string;
    nameChinese: string;
    businessRegistrationNumber: string;
    secretaryLicenseNumber: string;
    email: string;
    tel: string;
    details: CompanyDetailRequestDTO
}
export interface StaffDetailRequestDTO {
    maxWorkingHrs: number;
}
export interface StaffCreateRequestDTO {
    companyId: number;
    personId: number;
    orgId: number;
    custId: string;
    type: WorkType
    details: StaffDetailRequestDTO;
}
export interface OrganizationCreateRequestDTO {
    companyId: number;
    name: string;
    bio: string;
}
export interface OrganizationUpdateRequestDTO {
    name: string;
    bio: string;
}
export interface PersonCreateRequestDTO {
    nameEnglish: string;
    nameChinese: string;
    officeTel: string;
    mobileTel: string;
    email: string;
    hkId: string;
    cnId: string;
    moId: string;
    passportId: string;
}
export interface PersonUpdateRequestDTO {
    nameEnglish: string;
    nameChinese: string;
    officeTel: string;
    mobileTel: string;
    email: string;
}