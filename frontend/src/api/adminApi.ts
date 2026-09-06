import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api';
import { UserResponse } from '../types/auth';

export const adminApi = {
  /**
   * Lấy danh sách người dùng phân trang:
   * GET /api/v1/admin/users?page={page}&size={size}
   */
  getAllUsers: (page = 0, size = 10) =>
    axiosClient.get<any, ApiResponse<PageResponse<UserResponse>>>('/admin/users', {
      params: { page, size },
    }),

  /**
   * Khóa hoặc kích hoạt lại trạng thái hoạt động của tài khoản người dùng:
   * PUT /api/v1/admin/users/{email}/active
   */
  changeActive: (email: string) =>
    axiosClient.put<any, ApiResponse<UserResponse>>(`/admin/users/${encodeURIComponent(email)}/active`),

  // ── Category Management (AdminCategoryController & CategoryController) ──
  getCategoryTree: () =>
    axiosClient.get<any, ApiResponse<any[]>>('/categories'),

  createCategory: (data: any) =>
    axiosClient.post<any, ApiResponse<any>>('/admin/categories', data),

  updateCategory: (id: number, data: any) =>
    axiosClient.put<any, ApiResponse<any>>(`/admin/categories/${id}`, data),

  deleteCategory: (id: number) =>
    axiosClient.delete<any, ApiResponse<null>>(`/admin/categories/${id}`),
};

export default adminApi;
