import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api';
import {
  CreateShopRequest,
  UpdateShopRequire,
  ShopResponse,
  CreateProductRequest,
  UpdateProductRequest,
} from '../types/shop';
import { ProductResponse, ProductSummaryResponse } from '../types/product';

export const shopApi = {
  // 1. Tạo gian hàng mới (đăng ký làm người bán): POST /api/v1/shops
  createShop: (data: CreateShopRequest) =>
    axiosClient.post<any, ApiResponse<ShopResponse>>('/shops', data),

  // 2. Lấy thông tin gian hàng: GET /api/v1/shops/:id
  getShop: (id: number | string) =>
    axiosClient.get<any, ApiResponse<ShopResponse>>(`/shops/${id}`),

  // 3. Cập nhật thông tin gian hàng: PUT /api/v1/shops/:id
  updateShop: (id: number | string, data: UpdateShopRequire) =>
    axiosClient.put<any, ApiResponse<ShopResponse>>(`/shops/${id}`, data),

  // 4. Lấy danh sách sản phẩm của người bán: GET /api/v1/seller/products
  getMyProducts: (page: number = 0, size: number = 20) =>
    axiosClient.get<any, ApiResponse<PageResponse<ProductSummaryResponse>>>('/seller/products', {
      params: { page, size },
    }),

  // 5. Thêm sản phẩm mới: POST /api/v1/seller/products
  createProduct: (data: CreateProductRequest) =>
    axiosClient.post<any, ApiResponse<ProductResponse>>('/seller/products', data),

  // 6. Cập nhật sản phẩm: PUT /api/v1/seller/products/:slug
  updateProduct: (slug: string, data: UpdateProductRequest) =>
    axiosClient.put<any, ApiResponse<ProductResponse>>(`/seller/products/${slug}`, data),

  // 7. Xóa sản phẩm: DELETE /api/v1/seller/products/:slug
  deleteProduct: (slug: string) =>
    axiosClient.delete<any, ApiResponse<any>>(`/seller/products/${slug}`),

  // 8. Lấy danh mục sản phẩm: GET /api/v1/categories
  getCategories: () =>
    axiosClient.get<any, ApiResponse<any[]>>('/categories'),

  // 9. Cập nhật tồn kho biến thể: PUT /api/v1/seller/inventory/:variantId?quantity=...
  updateStock: (variantId: number, quantity: number) =>
    axiosClient.put<any, ApiResponse<void>>(`/seller/inventory/${variantId}`, null, {
      params: { quantity },
    }),

  // 10. Lấy lịch sử biến động kho của biến thể: GET /api/v1/seller/inventory/:variantId/logs
  getInventoryLogs: (variantId: number, page: number = 0, size: number = 20) =>
    axiosClient.get<any, ApiResponse<PageResponse<any>>>(`/seller/inventory/${variantId}/logs`, {
      params: { page, size },
    }),
};

export default shopApi;
