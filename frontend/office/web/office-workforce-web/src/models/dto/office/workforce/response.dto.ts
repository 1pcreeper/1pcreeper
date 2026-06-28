import { CompanyDTO, PersonDetailDTO, PersonDTO, StaffDetailDTO, StaffDTO, StaffOccupationDTO, StaffSchedulePreferenceDTO } from "./object.dto";

export interface OfficeWorkforceUserVerifyResponseDTO {
    id: number;
    uid: string;
    roles: Set<string>;
    createdAt: string;
    updatedAt: string;
}
export interface CompanyDetailResponseDTO {
    bio: string;
    address: string;
    industry: string;
    website: string;
}
export interface CompanyResponseDTO {
    id: number;
    nameEnglish: string;
    nameChinese: string;
    businessRegistrationNumber: string;
    secretaryLicenseNumber: string;
    email: string;
    tel: string;
    isActive: boolean;
}
export interface StaffResponseDTO {
    id: number;
    personId: number;
    personNameEnglish: string;
    personNameChinese: string;
    orgId: number;
    orgName: string;
    custId: string;
    type: WorkerType;
    isActive: boolean;
}
export interface StaffDetailResponseDTO {
    company: CompanyDTO;
    staff: StaffDTO;
    staffDetail: StaffDetailDTO;
    person: PersonDTO;
    personDetail: PersonDetailDTO;
    staffOccupations: StaffOccupationDTO[];
    schedulePreferences: StaffSchedulePreferenceDTO[];
}

export interface OrganizationResponseDTO {
    id: number;
    companyId: number;
    name: string;
    bio: string;
    isActive: boolean;
}