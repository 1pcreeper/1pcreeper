import { AppUserRole } from '@/dto/enums';
import type { LoginResponseDTO } from '@/dto/auth.dto';

export const mockLoginResponse: LoginResponseDTO = {
  accessToken: 'mock-admin-token-abc123',
  user: {
    id: 0,
    name: 'admin',
    email: 'admin@gmail.com',
    phone: null,
    displayName: 'Admin',
    roles: [AppUserRole.ADMIN, AppUserRole.USER],
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
};
