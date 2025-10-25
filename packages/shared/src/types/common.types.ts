export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type Status = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'DEPRECATED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
