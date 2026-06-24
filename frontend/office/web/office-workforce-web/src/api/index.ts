import Cookies from "js-cookie";
import { APIRequestError, LoginRequiredError } from "../models/errors/api.error";


export const apiRequest = async <P, R>(
    url: string | "",
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: P,
    requiresAuth: boolean = false,
    allowCredentials: boolean = true
): Promise<R> => {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-App-Version': '1.0.0'
        };

        if (requiresAuth) {
            const token: string = Cookies.get('_secure') || "";
            if (!token) {
                throw new LoginRequiredError("Authentication required");
            }
            headers["Authorization"] = `Bearer ${token}`;
        }

        const options: RequestInit = {
            method,
            headers,
        };

        if (allowCredentials) {
            options["credentials"] = 'include';
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (response.status === 401) {
            throw new LoginRequiredError("Authentication token expired");
        }

        const responseData = await response.json();

        if (!response.ok) {
            throw new APIRequestError(responseData.message || "API request failed");
        }

        return responseData as R;
    } catch (error: Error | any) {
        console.error(`API ${method} request to ${url} failed:`, error);
        throw error;
    }
};
