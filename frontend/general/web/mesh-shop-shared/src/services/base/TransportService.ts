import axios, { type AxiosInstance } from "axios";
import type { APIBaseResponseDTO } from "../../models/dto/base.dto";
import { APIError, unwrapResponse } from "../../models/dto/base.dto";

export interface TransportService {
    request<T>(
        path: string,
        method?: "GET" | "POST" | "PUT" | "DELETE",
        data?: unknown,
    ): Promise<APIBaseResponseDTO<T>>;
}
export class AxiosTransportService implements TransportService {
    private readonly client: AxiosInstance;
    public constructor(
        baseURL: string,
        private readonly tokenProvider: () => Promise<string | null>,
    ) {
        this.client = axios.create({
            baseURL,
            withCredentials: true,
            timeout: 20000,
            xsrfCookieName: "XSRF-TOKEN",
            xsrfHeaderName: "X-XSRF-TOKEN",
            withXSRFToken: true,
        });
    }
    public async request<T>(
        path: string,
        method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
        data?: unknown,
    ): Promise<APIBaseResponseDTO<T>> {
        try {
            const token = await this.tokenProvider();
            const response = await this.client.request<APIBaseResponseDTO<T>>({
                url: path,
                method,
                data,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            unwrapResponse(response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error))
                throw new APIError(
                    error.response?.data?.message ||
                        (error.response
                            ? `Request failed (${error.response.status}).`
                            : "Cannot reach the service. Please try again."),
                    error.response?.status || 503,
                );
            throw error;
        }
    }
}
