export interface ApiResponse<T> {
  status?: number
  message?: string
  success?: boolean
  body?: T
  data: T
  timestamp?: string
}

export interface PageResponse<T> {
  items: T[]
  content?: T[]
  pageNo?: number
  pageSize?: number
  totalElements?: number
  totalPages?: number
  last?: boolean
}
