export interface CreateShopPayload {
  name: string
  description?: string
}

export interface ShopResponse {
  id: number
  name: string
  description?: string
  logoUrl?: string
  bannerUrl?: string
  rating?: number
  totalProducts?: number
  totalFollowers?: number
  isActive?: boolean
}

import axiosClient from "./axiosClient"
import type { PageResponse } from "../types/api"
import type { OrderStatus } from "../types/order"
import type { ProductSummaryResponse, CategoryResponse } from "../types/product"

export interface OrderSummaryResponse {
  orderId: number
  orderNumber: string
  buyerName: string
  totalAmount: number
  status: OrderStatus
  paymentMethod: string
  paymentStatus: string
  totalItems: number
  createdDate: string
}

export interface SellerOrderItem {
  id: number
  variantId: number
  productName: string
  productId: number
  productPictureUrl?: string
  variantName?: string
  price: number
  quantity: number
  subtotal: number
}

export interface SellerOrderDetailResponse {
  orderId: number
  orderNumber: string
  status: OrderStatus
  note?: string
  receiverName: string
  receiverPhone: string
  shippingAddress: string
  subtotal: number
  shippingFee: number
  discountAmount: number
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  transactionId?: string
  paidAt?: string
  items: SellerOrderItem[]
  createdDate: string
}

export interface CreateProductImagePayload {
  imageUrl: string
  sortOrder?: number
  isPrimary?: boolean
}

export interface CreateProductVariantPayload {
  variantName: string
  sku: string
  price: number
  stock: number
  imageUrl?: string
}

export interface CreateProductPayload {
  categoryId: number
  name: string
  description?: string
  price: number
  originalPrice?: number
  images: CreateProductImagePayload[]
  variants: CreateProductVariantPayload[]
}

export interface UpdateProductPayload {
  name?: string
  description?: string
  price?: number
  originalPrice?: number
  status?: string
  categoryId?: number
  images?: CreateProductImagePayload[]
  variants?: CreateProductVariantPayload[]
}

export interface InventoryLogResponse {
  id: number
  inventoryId: number
  type: 'IN' | 'OUT' | 'RESERVED' | 'RELEASED'
  quantityChange: number
  quantityAfter: number
  reason: string
  referenceId?: number
  createdAt: string
}

export interface SellerProductVariant {
  id: number
  productId: number
  productName: string
  variantName: string
  sku: string
  price: number
  stock: number
  imageUrl?: string
}

export const sellerApi = {
  // === ORDERS ===
  getSellerOrders: async (params?: { status?: string; page?: number; size?: number }): Promise<PageResponse<OrderSummaryResponse>> => {
    const res = await axiosClient.get<any, PageResponse<OrderSummaryResponse>>('/seller/orders', { params })
    return res as unknown as PageResponse<OrderSummaryResponse>
  },

  getSellerOrderDetail: async (orderId: number | string): Promise<SellerOrderDetailResponse> => {
    const res = await axiosClient.get<any, SellerOrderDetailResponse>(`/seller/orders/${orderId}`)
    return res as unknown as SellerOrderDetailResponse
  },

  confirmOrder: async (orderId: number | string): Promise<SellerOrderDetailResponse> => {
    const res = await axiosClient.put<any, SellerOrderDetailResponse>(`/seller/orders/${orderId}/confirm`)
    return res as unknown as SellerOrderDetailResponse
  },

  shipOrder: async (orderId: number | string): Promise<SellerOrderDetailResponse> => {
    const res = await axiosClient.put<any, SellerOrderDetailResponse>(`/seller/orders/${orderId}/ship`)
    return res as unknown as SellerOrderDetailResponse
  },

  deliverOrder: async (orderId: number | string): Promise<SellerOrderDetailResponse> => {
    const res = await axiosClient.put<any, SellerOrderDetailResponse>(`/seller/orders/${orderId}/deliver`)
    return res as unknown as SellerOrderDetailResponse
  },

  // === PRODUCTS ===
  getSellerProducts: async (params?: { page?: number; size?: number }): Promise<PageResponse<ProductSummaryResponse>> => {
    const res = await axiosClient.get<any, PageResponse<ProductSummaryResponse>>('/seller/products', { params })
    return res as unknown as PageResponse<ProductSummaryResponse>
  },

  createProduct: async (data: CreateProductPayload): Promise<any> => {
    const res = await axiosClient.post<any, any>('/seller/products', data)
    return res
  },

  updateProduct: async (slug: string, data: UpdateProductPayload): Promise<any> => {
    const res = await axiosClient.put<any, any>(`/seller/products/${slug}`, data)
    return res
  },

  deleteProduct: async (slug: string): Promise<void> => {
    await axiosClient.delete(`/seller/products/${slug}`)
  },

  getCategories: async (): Promise<CategoryResponse[]> => {
    const res = await axiosClient.get<any, CategoryResponse[]>('/categories')
    return res || []
  },

  // === INVENTORY ===
  updateStock: async (variantId: number, quantity: number): Promise<void> => {
    await axiosClient.put(`/seller/inventory/${variantId}`, null, {
      params: { quantity }
    })
  },

  getInventoryLogs: async (variantId: number, params?: { page?: number; size?: number }): Promise<PageResponse<InventoryLogResponse>> => {
    const res = await axiosClient.get<any, PageResponse<InventoryLogResponse>>(`/seller/inventory/${variantId}/logs`, { params })
    return res as unknown as PageResponse<InventoryLogResponse>
  },

  getShopDetails: async (shopId: number | string): Promise<ShopResponse> => {
    const res = await axiosClient.get<any, ShopResponse>(`/shops/${shopId}`)
    return res as unknown as ShopResponse
  },

  createShop: async (data: CreateShopPayload): Promise<ShopResponse> => {
    const res = await axiosClient.post<any, ShopResponse>('/shops', {
      name: data.name.trim(),
      description: data.description?.trim() || ''
    })
    return res as unknown as ShopResponse
  }
}
