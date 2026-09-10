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
  // 1. Quản lý người dùng: Lấy danh sách phân trang
  getUsers: async (page = 0, size = 10): Promise<PageResponse<AdminUserResponse>> => {
    const data = await axiosClient.get<any, PageResponse<AdminUserResponse>>('/admin/users', {
      params: { page, size },
    })
    return data
  },

  // 2. Quản lý người dùng: Bật/Tắt trạng thái hoạt động (Khóa / Mở khóa)
  toggleUserActive: async (email: string): Promise<AdminUserResponse> => {
    const data = await axiosClient.put<any, AdminUserResponse>('/admin/users/' + encodeURIComponent(email) + '/active')
    return data
  },

  // 3. Quản lý danh mục: Lấy cây danh mục hệ thống
  getCategoryTree: async (): Promise<CategoryResponse[]> => {
    const data = await axiosClient.get<any, CategoryResponse[]>('/categories')
    return data
  },

  // 4. Quản lý danh mục: Thêm mới danh mục
  createCategory: async (payload: CreateCategoryPayload): Promise<CategoryResponse> => {
    const data = await axiosClient.post<any, CategoryResponse>('/admin/categories', payload)
    return data
  },

  // 5. Quản lý danh mục: Cập nhật danh mục
  updateCategory: async (id: number, payload: CreateCategoryPayload): Promise<CategoryResponse> => {
    const data = await axiosClient.put<any, CategoryResponse>('/admin/categories/' + id, payload)
    return data
  },

  // 6. Quản lý danh mục: Xóa danh mục
  deleteCategory: async (id: number): Promise<void> => {
    await axiosClient.delete('/admin/categories/' + id)
  },
}

export default adminApi
