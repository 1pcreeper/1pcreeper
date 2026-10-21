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

export interface OrganizationCreateRequestDTO {
    nameEnglish: string;
    nameChinese?: string;
    businessRegistrationNumber?: string;
    secretaryLicenseNumber?: string;
    email?: string;
    tel?: string;
    details?: OrganizationDetailRequestDTO;
}

export interface OrganizationUpdateRequestDTO {
    nameEnglish?: string;
    nameChinese?: string;
    businessRegistrationNumber?: string;
    secretaryLicenseNumber?: string;
    email?: string;
    tel?: string;
    isActive?: boolean;
}

export interface OrganizationDetailRequestDTO {
    bio?: string;
    address?: string;
    industry?: string;
    website?: string;
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

export interface PlaceCreateRequestDTO {
    departId: number;
    name: string;
    address: string;
}

export interface PlaceUpdateRequestDTO {
    departId?: number;
    name?: string;
    address?: string;
}

export interface OccupationCreateRequestDTO {
    departId: number;
    name: string;
}

export interface OccupationUpdateRequestDTO {
    name?: string;
    isActive?: boolean;
}

export interface ScheduleCreateRequestDTO {
    placeId: number;
    staffId: number;
    workingPeriodId: number;
    occupationId?: number;
    startAt: string;
    endAt: string;
    status: string;
    remark?: string;
}

export interface ScheduleUpdateRequestDTO {
    placeId?: number;
    staffId?: number;
    workingPeriodId?: number;
    occupationId?: number;
    startAt?: string;
    endAt?: string;
    status?: string;
    remark?: string;
}

export interface ScheduleStatusUpdateRequestDTO {
    status: string;
}

export interface ScheduleGenerationRequestDTO {
    placeId: number;
    year: number;
    month: number;
}

export interface PlaceScheduleRuleCreateRequestDTO {
    placeId: number;
    workTypePriorities?: string[];
}

export interface PlaceScheduleRuleUpdateRequestDTO {
    workTypePriorities?: string[];
}

export interface PlaceOccupationRuleCreateRequestDTO {
    placeId: number;
    weekDay: number;
    occupationId: number;
}

export interface PlaceOccupationRuleUpdateRequestDTO {
    weekDay?: number;
}

export interface PlaceWorkingPeriodRuleCreateRequestDTO {
    occupationRuleId: number;
    workingPeriodId: number;
    personCount: number;
}

export interface PlaceWorkingPeriodRuleUpdateRequestDTO {
    personCount?: number;
}

export interface StaffSchedulePreferenceCreateRequestDTO {
    staffId: number;
    placeId: number;
    weekDay: number;
    workingPeriodId: number;
    priorityIndex: number;
}

export interface StaffSchedulePreferenceUpdateRequestDTO {
    weekDay?: number;
    workingPeriodId?: number;
    priorityIndex?: number;
}

export interface StaffOccupationCreateRequestDTO {
    staffId: number;
    occupationId: number;
    remark?: string;
}

export interface StaffOccupationUpdateRequestDTO {
    occupationId?: number;
    remark?: string;
}
