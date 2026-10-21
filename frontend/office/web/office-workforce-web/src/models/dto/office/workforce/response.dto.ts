import { WorkType } from "./enum.dto";
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
    details?: CompanyDetailResponseDTO;
}

export interface OrganizationResponseDTO {
    id: number;
    uid?: string;
    nameEnglish: string;
    nameChinese?: string;
    businessRegistrationNumber?: string;
    secretaryLicenseNumber?: string;
    email?: string;
    tel?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: number;
    updatedBy?: number;
}
export interface StaffResponseDTO {
    id: number;
    personId: number;
    personNameEnglish: string;
    personNameChinese: string;
    departId: number;
    departName: string;
    custId: string;
    type: WorkType;
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

export interface DepartmentResponseDTO {
    id: number;
    companyId: number;
    name: string;
    bio: string;
    isActive: boolean;
}

export interface PlaceResponseDTO {
    id: number;
    departId: number;
    departName: string;
    name: string;
    address: string;
    isActive: boolean;
}
export interface PersonResponseDTO {
    id: number;
    uid?: string;
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
export interface PersonDetailResponseDTO {
    person: PersonDTO;
    detail: PersonDetailDTO;
    staffs: StaffDTO[];
}
export interface WorkingPeriodResponseDTO {
    id: number;
    departId: number;
    name: string;
    startAt: string;
    endAt: string;
    isActive: boolean;
}

export interface OccupationResponseDTO {
    id: number;
    departId: number;
    name: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface OrganizationDetailResponseDTO {
    id: number;
    orgId: number;
    bio?: string;
    address?: string;
    industry?: string;
    website?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ScheduleResponseDTO {
    id: number;
    startAt: number[];
    endAt: number[];
    placeId: number;
    placeName?: string;
    staffId: number;
    staffNameEnglish?: string;
    staffNameChinese?: string;
    staffCustId?: string;
    status: string;
    remark?: string;
    workingPeriodId?: number;
    workingPeriodName?: string;
    occupationId?: number;
    occupationName?: string;
}

export interface ScheduleGenerationTaskResponseDTO {
    id: number;
    status: string;
    requestedByUid?: string;
    startedAt?: string;
    completedAt?: string;
    errorMessage?: string;
    placeId?: number;
    placeName?: string;
    targetYear?: number;
    targetMonth?: number;
}

export interface ScheduleGenerationStatusResponseDTO {
    isProcessing: boolean;
}

export interface PlaceScheduleRuleResponseDTO {
    id: number;
    placeId: number;
    workTypePriorities?: string[];
}

export interface PlaceOccupationRuleResponseDTO {
    id: number;
    placeId: number;
    weekDay: number;
    occupationId: number;
    occupationName?: string;
}

export interface PlaceWorkingPeriodRuleResponseDTO {
    id: number;
    occupationRuleId: number;
    workingPeriodId: number;
    workingPeriodName?: string;
    personCount: number;
}

export interface StaffSchedulePreferenceResponseDTO {
    id: number;
    staffId: number;
    staffName?: string;
    placeId: number;
    placeName?: string;
    weekDay: number;
    workingPeriodId: number;
    workingPeriodName?: string;
    priorityIndex: number;
}

export interface StaffOccupationResponseDTO {
    id: number;
    staffId: number;
    occupationId: number;
    occupationName?: string;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}