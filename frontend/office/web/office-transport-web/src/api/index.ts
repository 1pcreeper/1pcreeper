import Cookies from "js-cookie";
import { APIRequestError, LoginRequiredError } from "../models/errors/api.error";

export const apiRequest = async <P, R>(
    url: string | "",
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: P,
    requiresAuth: boolean = false,
    ignoreCredentials: boolean = false
): Promise<R> => {
    try {
        const headers: HeadersInit = {
            Accept: 'application/json',
            'X-App-Version': '1.0.0'
        };

        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (requiresAuth) {
            const token: string = Cookies.get('_secure') || localStorage.getItem('auth_token') || "";
            if (!token) {
                throw new LoginRequiredError("Authentication required");
            }
            headers["Authorization"] = `Bearer ${token}`;
        } else {
            const token: string = Cookies.get('_secure') || localStorage.getItem('auth_token') || "";
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
        }

        if (ignoreCredentials) {
            headers["Ignore-Credentials"] = "true";
        }

        const options: RequestInit = {
            method,
            headers,
            credentials: "include"
        };

        if (data !== undefined && data !== null) {
            options.body = isFormData ? (data as unknown as BodyInit) : JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (response.status === 401) {
            if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/auth/login') {
                window.location.href = '/login';
            }
            throw new LoginRequiredError("Authentication token expired");
        }

        const responseData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new APIRequestError(responseData.message || responseData.error || `API request failed with status ${response.status}`);
        }

        return responseData as R;
    } catch (error: any) {
        console.error(`API ${method} request to ${url} failed:`, error);
        throw error;
    }
};
