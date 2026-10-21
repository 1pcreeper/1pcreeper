import { baseApi } from '../lib/api.ts';
import { LoginRequestDTO, VerifyTokenRequestDTO } from '../models/dto/request.ts';
import { APIBaseResponseDTO, LoginResponseDTO, VerifyTokenResponseDTO } from '../models/dto/response.ts';

export default class AuthService {
    private static INSTANCE: AuthService;
    private constructor() {}
    
    public static getInstance(): AuthService {
        if (!AuthService.INSTANCE) {
            AuthService.INSTANCE = new AuthService();
        }
        return AuthService.INSTANCE;
    }
    
    public async login(requestDTO: LoginRequestDTO | any): Promise<APIBaseResponseDTO<LoginResponseDTO>> {
        const payload: any = {
            name: requestDTO.name || requestDTO.email,
            email: requestDTO.email,
            password: requestDTO.password
        };
        try {
            return await baseApi<any, LoginResponseDTO>('/account/auth/login', 'POST', payload);
        } catch {
            return await baseApi<any, LoginResponseDTO>('/auth/login', 'POST', payload);
        }
    }
    
    public async verify(requestDTO?: VerifyTokenRequestDTO): Promise<APIBaseResponseDTO<VerifyTokenResponseDTO>> {
        try {
            return await baseApi<VerifyTokenRequestDTO, VerifyTokenResponseDTO>('/account/auth/verify', 'GET');
        } catch {
            return await baseApi<VerifyTokenRequestDTO, VerifyTokenResponseDTO>('/transport/auth/verify', 'GET');
        }
    }
}
