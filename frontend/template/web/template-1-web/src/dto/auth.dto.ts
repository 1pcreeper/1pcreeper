import type { AppUserDTO } from './user.dto';

export interface LoginRequestDTO {
  name: string;
  password: string;
}

export interface LoginResponseDTO {
  user: AppUserDTO;
  accessToken: string;
}

export interface AppUserPrincipalResponseDTO {
  user: AppUserDTO;
}