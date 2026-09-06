export interface ApiResponse<T> {
  success: boolean;
  message: string;
  body: T;
  timestamp: string;
}

export interface PageResponse<T> {
  items: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
