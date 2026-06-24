import { OfficeAccountAuthLoginRequestDTO } from '@/models/dto/office/account/request.dto';
import { OfficeAccountAuthTokenResponseDTO, OfficeAccountOfficeUserVerifyResponseDTO } from '@/models/dto/office/account/response.dto';
import OfficeAccountAuthContentService from '@/services/content/office/account/auth';
import Cookies from 'js-cookie';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface OfficeAuthContextType {
    authOfficeUser: OfficeAccountOfficeUserVerifyResponseDTO | null;
    token: string | null;
    loading: boolean;
    login: (name: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    reload: () => Promise<void>;
}

const OfficeAuthContext = createContext<OfficeAuthContextType | undefined>(undefined);

export function OfficeAuthContextProvider({ children }: { children: React.ReactNode }) {
    const [authOfficeUser, setAuthOfficeUser] = useState<OfficeAccountOfficeUserVerifyResponseDTO | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const officeAccountAuthContentService = OfficeAccountAuthContentService.getInstance();

    useEffect(() => {
        loadStoredAuth();
    }, [token]);

    const loadStoredAuth = async () => {
        setLoading(true);
        const responseDTO: OfficeAccountOfficeUserVerifyResponseDTO =
            await officeAccountAuthContentService.verify();
        setAuthOfficeUser(responseDTO);
        setLoading(false);
    };

    const login = async (name: string, password: string) => {
        await logout();
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
        Cookies.remove("_secure");
        setAuthOfficeUser(null);
        setToken(null);
        setLoading(false);
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
