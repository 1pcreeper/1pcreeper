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
    departId: number;
    custId: string;
    type: WorkType
    details: StaffDetailRequestDTO;
}
export interface StaffUpdateRequestDTO {
    departId: number;
    custId: string;
    type: WorkType;
    about: string;
    details: StaffDetailRequestDTO;
}

export interface DepartmentCreateRequestDTO {
    companyId: number;
    name: string;
    bio: string;
}
export interface DepartmentUpdateRequestDTO {
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
    hkId?: string;
    cnId?: string;
    moId?: string;
    passportId?: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    occupation?: string;
    address?: string;
    wechatId?: string;
    instagramId?: string;
    website?: string;
}
export interface WorkingPeriodCreateRequestDTO {
    departId: number;
    startAt: string;
    endAt: string;
    name: string;
}

export interface WorkingPeriodUpdateRequestDTO {
    startAt: string;
    endAt: string;
    name: string;
}
