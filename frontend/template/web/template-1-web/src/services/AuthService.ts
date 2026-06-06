import type { LoginRequestDTO, LoginResponseDTO, AppUserPrincipalResponseDTO } from '@/dto/auth.dto';
import { MOCK_MODE, MOCK_DELAY_MS } from '@/lib/config';
import { delay } from '@/lib/utils';
import { mockLoginResponse } from '@/mock/auth.mock';
import api from '@/lib/axios';
import Cookies from 'js-cookie';

export interface IAuthService {
  login(dto: LoginRequestDTO): Promise<LoginResponseDTO>;
  verify(token: string): Promise<AppUserPrincipalResponseDTO>;
}

class AuthServiceImpl implements IAuthService {
  async login(dto: LoginRequestDTO): Promise<LoginResponseDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      if (dto.name === 'admin' && dto.password === 'Lb5xcFeeKN') {
        return mockLoginResponse;
      }
      throw new Error('Invalid username or password');
    }
    const res = await api.post<{ success: boolean; data: LoginResponseDTO, message: string }>('/auth/login', dto, { withCredentials: true });
    if (res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data.message || 'Login failed');
  }

  async verify(token: string): Promise<AppUserPrincipalResponseDTO> {
    if (MOCK_MODE) {
      await delay(MOCK_DELAY_MS);
      if (token === mockLoginResponse.accessToken) {
        return { user: mockLoginResponse.user };
      }
      throw new Error('Invalid token');
    }
    const res = await api.get<{ success: boolean; data: AppUserPrincipalResponseDTO }>('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return res.data.data;
  }
  async logout(): Promise<void> {
    Cookies.remove('_secure');
  }
}

export const AuthService: IAuthService = new AuthServiceImpl();
