import { Gender, WorkType } from "./enum.dto";

export interface CompanyDTO {
    id: number;
    nameEnglish: string;
    nameChinese: string;
    businessRegistrationNumber: string;
    secretaryLicenseNumber: string;
    email: string;
    tel: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface StaffDTO {
    id: number;
    companyId: number;
    companyName: string;
    personId: number;
    orgId: number;
    orgName: string;
    custId: string;
    type: WorkType;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface StaffDetailDTO {
    id: number;
    staffId: number;
    maxWorkingHrs: number;
    createdAt: string;
    updatedAt: string;
}
export interface PersonDTO {
    id: number;
    nameEnglish: string;
    nameChinese: string;
    officeTel: string;
    mobileTel: string;
    email: string;
    hkId: string;
    cnId: string;
    moId: string;
    passportId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface PersonDetailDTO {
    id: number;
    personId: number;
    bio: string;
    dateOfBirth: string;
    gender: Gender;
    nationality: string;
    occupation: string;
    address: string;
    wechatId: string;
    instagramId: string;
    website: string;
    createdAt: string;
    updatedAt: string;
}

export interface StaffOccupationDTO {
    id: number;
    staffId: number;
    occupationId: number;
    occupationName: string;
    remark: string;
    createdAt: string;
    updatedAt: string;
}

export interface StaffSchedulePreferenceDTO {
    id: number;
    staffId: number;
    placeId: number;
    placeName: string;
    placeAddress: string;
    weekDay: number;
    workingPeriodId: number;
    workingPeriodName: number;
    priorityIndex: number;
    createdAt: string;
    updatedAt: string;
}