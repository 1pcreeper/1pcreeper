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