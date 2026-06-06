import type { AppUserRole } from './enums';

export interface AppUserDTO {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  displayName: string;
  roles: AppUserRole[];
  createdAt: string;
  updatedAt: string | null;
}

export interface AppUserRequestDTO {
  name: string;
  email: string;
  phone?: string;
  displayName: string;
  password: string;
  roles: AppUserRole[];
}

export interface AppUserUpdateDTO {
  name: string;
  email: string;
  phone?: string;
  displayName: string;
  password: string;
  roles: AppUserRole[];
}

export interface UpdateRolesRequestDTO {
  roles: AppUserRole[];
}
