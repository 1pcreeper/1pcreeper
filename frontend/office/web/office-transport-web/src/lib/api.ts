import { APIBaseResponseDTO } from '../models/dto/response.ts';
import { VITE_OFFICE_BASE_URL } from '../config/env.config.ts';

const OFFICE_BASE_PATH = '/api/v1';

export async function baseApi<Req, Res>(
  endpoint: string,
  method: string = 'GET',
  body?: Req,
  isFormData: boolean = false
): Promise<APIBaseResponseDTO<Res>> {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    Accept: 'application/json',
    'X-App-Version': '1.0.0'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  const config: RequestInit = {
    method,
    headers,
    credentials: 'include'
  };
  if (body !== undefined && body !== null) {
    config.body = isFormData ? (body as any) : JSON.stringify(body);
  }
  
  // Normalize endpoint to standard /api/v1 prefix
  // If endpoint is already e.g. /transport/... or /account/...
  let normalizedPath = endpoint;
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }

  // Prepend /transport for vehicle/vrd/explorer routes if not present
  if (
    normalizedPath.startsWith('/vehicles') ||
    normalizedPath.startsWith('/vrds') ||
    normalizedPath.startsWith('/files') ||
    normalizedPath.startsWith('/uploads') ||
    normalizedPath.startsWith('/scans')
  ) {
    normalizedPath = '/transport' + normalizedPath;
  }

  const url = `${VITE_OFFICE_BASE_URL}${OFFICE_BASE_PATH}${normalizedPath}`;
  
  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (networkErr: any) {
    // If relative fetch to /api/v1 fails and we are running in local fallback, try /api
    const fallbackUrl = `/api${endpoint}`;
    response = await fetch(fallbackUrl, config);
  }

  // If 404 on /api/v1 (e.g. mock express dev server only listening on /api without prefix)
  if (response.status === 404 && !url.includes('/api/vehicles') && !url.includes('/api/auth')) {
    try {
      const fallbackUrl = `/api${endpoint}`;
      const fallbackResponse = await fetch(fallbackUrl, config);
      if (fallbackResponse.ok) {
        response = fallbackResponse;
      }
    } catch {
      // ignore fallback error and handle original response
    }
  }

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
     throw new Error(json.message || json.error || `HTTP error ${response.status}`);
  }

  // If backend returns standard APIBaseResponseDTO<T>
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json as APIBaseResponseDTO<Res>;
  }

  // Fallback normalization to APIBaseResponseDTO<T>
  return {
    success: true,
    message: '',
    data: json as Res
  };
}
