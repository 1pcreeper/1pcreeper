import { OfficeAccountAuthLoginRequestDTO } from '@/models/dto/office/account/request.dto';
import { OfficeAccountAuthTokenResponseDTO, OfficeAccountOfficeUserVerifyResponseDTO } from '@/models/dto/office/account/response.dto';
import { OfficeWorkforceUserVerifyResponseDTO } from "@/models/dto/office/workforce/response.dto";
import { LoginRequiredError } from '@/models/errors/api.error';
import OfficeAccountAuthContentService from '@/services/content/office/account/auth';
import OfficeWorkforceAuthContentService from '@/services/content/office/workforce/auth';
import Cookies from 'js-cookie';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthOfficeUser {
    uid: string;
    account: OfficeAccountOfficeUserVerifyResponseDTO;
    workforce: OfficeWorkforceUserVerifyResponseDTO;
}

interface OfficeAuthContextType {
    authOfficeUser: AuthOfficeUser | null;
    token: string | null;
    loading: boolean;
    login: (name: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    reload: () => Promise<void>;
}

const OfficeAuthContext = createContext<OfficeAuthContextType | undefined>(undefined);

export function OfficeAuthContextProvider({ children }: { children: React.ReactNode }) {
    const [authOfficeUser, setAuthOfficeUser] = useState<AuthOfficeUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const officeAccountAuthContentService = OfficeAccountAuthContentService.getInstance();
    const officeWorkforceAuthContentService = OfficeWorkforceAuthContentService.getInstance();

    useEffect(() => {
        loadStoredAuth();
    }, [token]);

    const loadStoredAuth = async () => {
        try {
            setLoading(true);
            const accountResponseDTO: OfficeAccountOfficeUserVerifyResponseDTO =
                await officeAccountAuthContentService.verify();
            const workforceResponseDTO: OfficeWorkforceUserVerifyResponseDTO =
                await officeWorkforceAuthContentService.verify();
            setAuthOfficeUser({
                uid: accountResponseDTO.uid,
                account: accountResponseDTO,
                workforce: workforceResponseDTO
            });
        } catch (e: any) {
            if (e instanceof LoginRequiredError) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (name: string, password: string) => {
        setLoading(true);
        const requestDTO: OfficeAccountAuthLoginRequestDTO = {
            name: name,
            password: password
        } as OfficeAccountAuthLoginRequestDTO;
        const responseDTO: OfficeAccountAuthTokenResponseDTO =
            await officeAccountAuthContentService.login(requestDTO);
        const token = responseDTO.token;
        setToken(token);
        setLoading(false);
    };

    const logout = async () => {
        Cookies.remove("_secure", { sameSite: "none", partitioned: true, secure: true });
        setAuthOfficeUser(null);
        setToken(null);
        setLoading(false);
        navigate("/auth/login");
    };

    const reload = async () => {
        await loadStoredAuth();
    }

    return (
        <OfficeAuthContext.Provider value={{ authOfficeUser, token, loading, login, logout, reload }}>
            {children}
        </OfficeAuthContext.Provider>
    );
}

export function useOfficeAuthContext() {
    const context = useContext(OfficeAuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
