import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { CategoryResponse, CreateCategoryRequest } from '../types/category';

export const categoryApi = {
  /**
   * 1. GET /api/v1/categories (CategoryController)
   * Lấy danh sách cây danh mục đa cấp (hỗ trợ tối đa 3 cấp)
   * Public API
   */
  getCategoryTree: () =>
    axiosClient.get<any, ApiResponse<CategoryResponse[]>>('/categories'),

  /**
   * 2. POST /api/v1/admin/categories (AdminCategoryController)
   * Tạo danh mục mới (Yêu cầu quyền ADMIN)
   * Nếu parentId = null/undefined -> Cấp 1
   * Nếu parentId là Cấp 1 -> Cấp 2
   * Nếu parentId là Cấp 2 -> Cấp 3 (tối đa 3 cấp)
   */
  createCategory: (data: CreateCategoryRequest) =>
    axiosClient.post<any, ApiResponse<CategoryResponse>>('/admin/categories', data),

  /**
   * 3. PUT /api/v1/admin/categories/{id} (AdminCategoryController)
   * Cập nhật thông tin danh mục (Yêu cầu quyền ADMIN)
   */
  updateCategory: (id: number, data: CreateCategoryRequest) =>
    axiosClient.put<any, ApiResponse<CategoryResponse>>(`/admin/categories/${id}`, data),

  /**
   * 4. DELETE /api/v1/admin/categories/{id} (AdminCategoryController)
   * Xóa danh mục (Yêu cầu quyền ADMIN)
   * Lưu ý: Không thể xóa danh mục đang có danh mục con
   */
  deleteCategory: (id: number) =>
    axiosClient.delete<any, ApiResponse<null>>(`/admin/categories/${id}`),
};

export const adminCategoryApi = {
  createCategory: categoryApi.createCategory,
  updateCategory: categoryApi.updateCategory,
  deleteCategory: categoryApi.deleteCategory,
  getCategoryTree: categoryApi.getCategoryTree,
};

export default categoryApi;
