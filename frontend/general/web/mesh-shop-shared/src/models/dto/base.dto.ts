export type APIBaseResponseDTO<T> =
    { success: true; message: string; data: T } | { success: false; message: string; data: null };

export class APIError extends Error {
    public constructor(
        message: string,
        public readonly status = 400,
    ) {
        super(message);
    }
}

export function unwrapResponse<T>(response: APIBaseResponseDTO<T>): T {
    if (!response.success) throw new APIError(response.message || "The request could not be completed.");
    return response.data;
}

export interface PaginationBaseResponseDTO<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
}
export interface PageRequestDTO {
    page?: number;
    size?: number;
    search?: string;
    category?: string;
    status?: string;
    type?: string;
}
export const MAX_PAGE_SIZE = 20;
export function pageRequest(request: PageRequestDTO = {}) {
    return {
        ...request,
        page: Number.isFinite(request.page) ? Math.max(0, Math.floor(request.page!)) : 0,
        size: Number.isFinite(request.size) ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(request.size!))) : 20,
    };
}
export function pageQuery(request: PageRequestDTO = {}) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(pageRequest(request)))
        if (value !== undefined && value !== "") params.set(key, String(value));
    return params.toString();
}
export function paginate<T>(items: T[], request: PageRequestDTO = {}): PaginationBaseResponseDTO<T> {
    const { page, size } = pageRequest(request);
    return {
        content: items.slice(page * size, (page + 1) * size),
        pageNumber: page,
        pageSize: size,
        totalPages: Math.ceil(items.length / size),
        totalElements: items.length,
    };
}
export function unwrapPage<T>(response: APIBaseResponseDTO<PaginationBaseResponseDTO<T>>) {
    const page = unwrapResponse(response);
    if (
        !page ||
        !Array.isArray(page.content) ||
        page.content.length > page.pageSize ||
        !Number.isInteger(page.pageSize) ||
        !Number.isSafeInteger(page.totalElements) ||
        page.totalElements < 0 ||
        page.totalPages !== Math.ceil(page.totalElements / page.pageSize) ||
        page.pageSize > MAX_PAGE_SIZE ||
        page.pageSize < 1 ||
        !Number.isInteger(page.pageNumber) ||
        page.pageNumber < 0 ||
        !Number.isInteger(page.totalPages) ||
        page.totalPages < 0
    )
        throw new APIError("Invalid paginated response. Pages must contain at most 20 items.");
    return page;
}
export function unwrapOne<T>(response: APIBaseResponseDTO<PaginationBaseResponseDTO<T>>) {
    const page = unwrapPage(response);
    if (page.content.length !== 1) throw new APIError("Expected one result.");
    return page.content[0];
}
