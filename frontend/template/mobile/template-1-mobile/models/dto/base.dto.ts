export interface APIBaseResponseDTO<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationBaseResponseDTO<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

export interface PageParams {
  page?: number;
  size?: number;
}
