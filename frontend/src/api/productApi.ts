import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api';
import {
  CategoryResponse,
  FilterSortRequest,
  ProductFilterParams,
  ProductResponse,
  ProductSummaryResponse,
  CreateProductRequest,
  UpdateProductRequest,
  InventoryLogResponse,
} from '../types/product';

// ── 1. Public Product Controller (/api/v1/products) ────────────────────
export const productApi = {
  /**
   * GET /api/v1/products
   * Supports: keyword, categoryId, minPrice, maxPrice, sortBy, sortDir, page, size
   */
  getProducts: (params?: FilterSortRequest | ProductFilterParams) =>
    axiosClient.get<any, ApiResponse<PageResponse<ProductSummaryResponse>>>('/products', { params }),

  /**
   * GET /api/v1/products/{slug}
   */
  getProduct: (slug: string) =>
    axiosClient.get<any, ApiResponse<ProductResponse>>(`/products/${slug}`),

  /**
   * Fallback helper to retrieve product detail by either numeric ID or slug
   */
  getProductDetail: async (slugOrId: number | string) => {
    let slug = String(slugOrId);
    if (!isNaN(Number(slugOrId))) {
      try {
        const list = await axiosClient.get<any, ApiResponse<PageResponse<ProductSummaryResponse>>>('/products');
        const found = list?.body?.items?.find((p) => p.id === Number(slugOrId));
        if (found?.slug) {
          slug = found.slug;
        }
      } catch {
        // continue with slug
      }
    }
    return axiosClient.get<any, ApiResponse<ProductResponse>>(`/products/${slug}`);
  },

  /**
   * GET /api/v1/categories
   * Returns category hierarchy tree (3 levels)
   */
  getCategories: () =>
    axiosClient.get<any, ApiResponse<CategoryResponse[]>>('/categories'),

  // ── 2. Seller Product Controller (/api/v1/seller/products) ───────────
  /**
   * GET /api/v1/seller/products
   * Requires role: SELLER
   */
  getMyProducts: (page: number = 0, size: number = 20) =>
    axiosClient.get<any, ApiResponse<PageResponse<ProductSummaryResponse>>>('/seller/products', {
      params: { page, size },
    }),

  /**
   * POST /api/v1/seller/products
   * Requires role: SELLER, categoryId must be Level 3
   */
  createProduct: (data: CreateProductRequest) =>
    axiosClient.post<any, ApiResponse<ProductResponse>>('/seller/products', data),

  /**
   * PUT /api/v1/seller/products/{slug}
   * Requires role: SELLER
   */
  updateProduct: (slug: string, data: UpdateProductRequest) =>
    axiosClient.put<any, ApiResponse<ProductResponse>>(`/seller/products/${slug}`, data),

  /**
   * DELETE /api/v1/seller/products/{slug}
   * Requires role: SELLER
   */
  deleteProduct: (slug: string) =>
    axiosClient.delete<any, ApiResponse<void>>(`/seller/products/${slug}`),

  // ── 3. Seller Inventory Controller (/api/v1/seller/inventory) ─────────
  /**
   * PUT /api/v1/seller/inventory/{variantId}?quantity={quantity}
   * Requires role: SELLER. Updates available stock for variant and generates inventory log.
   */
  updateStock: (variantId: number, quantity: number) =>
    axiosClient.put<any, ApiResponse<void>>(`/seller/inventory/${variantId}`, null, {
      params: { quantity },
    }),

  /**
   * GET /api/v1/seller/inventory/{variantId}/logs?page={page}&size={size}
   * Requires role: SELLER. Returns inventory transaction history (IN/OUT/ADJUST).
   */
  getInventoryLogs: (variantId: number, page: number = 0, size: number = 20) =>
    axiosClient.get<any, ApiResponse<PageResponse<InventoryLogResponse>>>(
      `/seller/inventory/${variantId}/logs`,
      { params: { page, size } }
    ),
};

// Also export individual modules for explicit modular import
export const sellerProductApi = {
  getMyProducts: productApi.getMyProducts,
  createProduct: productApi.createProduct,
  updateProduct: productApi.updateProduct,
  deleteProduct: productApi.deleteProduct,
};

export const sellerInventoryApi = {
  updateStock: productApi.updateStock,
  getInventoryLogs: productApi.getInventoryLogs,
};

export default productApi;
