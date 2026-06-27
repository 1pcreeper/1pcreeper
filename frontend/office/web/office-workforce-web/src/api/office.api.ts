import { apiRequest } from ".";
import { VITE_OFFICE_BASE_URL } from "../config/env.config";
import { APIBaseResponseDTO } from "../models/dto/base/base.dto";
import { APIRequestError } from "../models/errors/api.error";

const OFFICE_BASE_PATH = "/api/v1";


const officeAPI = async <P, R>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: P,
    requiresAuth: boolean = false,
    ignoreCredentials: boolean = false
): Promise<R> => {
    const url = VITE_OFFICE_BASE_URL + OFFICE_BASE_PATH + path;
    const response = await apiRequest<P, APIBaseResponseDTO<R>>(url, method, data, requiresAuth, ignoreCredentials);
    if (!response.success) {
        console.log(response);
        console.error(response.message);
        throw new APIRequestError(response.message);
    }
    return response.data;
}
export default officeAPI;