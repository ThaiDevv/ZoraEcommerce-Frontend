import axiosClient from './axiosClient'
import type { PageResponse } from '../types/api'
import type { CategoryResponse } from '../types/product'

export interface AdminUserResponse {
  fullName: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
  isActive: boolean
  role: 'BUYER' | 'SELLER' | 'ADMIN' | string
}

export interface CreateCategoryPayload {
  parentId?: number | null
  name: string
  slug: string
  iconUrl?: string | null
  sortOrder?: number
}

export const adminApi = {
  getUsers: async (page = 0, size = 10): Promise<PageResponse<AdminUserResponse>> => {
    const data = await axiosClient.get<any, PageResponse<AdminUserResponse>>('/admin/users', {
      params: { page, size },
    })
    return data
  },

  toggleUserActive: async (email: string): Promise<AdminUserResponse> => {
    const data = await axiosClient.put<any, AdminUserResponse>('/admin/users/' + encodeURIComponent(email) + '/active')
    return data
  },

  getCategoryTree: async (): Promise<CategoryResponse[]> => {
    const data = await axiosClient.get<any, CategoryResponse[]>('/categories')
    return data
  },

  createCategory: async (payload: CreateCategoryPayload): Promise<CategoryResponse> => {
    const data = await axiosClient.post<any, CategoryResponse>('/admin/categories', payload)
    return data
  },

  updateCategory: async (id: number, payload: CreateCategoryPayload): Promise<CategoryResponse> => {
    const data = await axiosClient.put<any, CategoryResponse>('/admin/categories/' + id, payload)
    return data
  },

  deleteCategory: async (id: number): Promise<void> => {
    await axiosClient.delete('/admin/categories/' + id)
  },
}

export default adminApi
