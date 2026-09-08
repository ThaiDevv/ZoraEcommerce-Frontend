import axiosClient from './axiosClient'
import type { CategoryResponse, ProductSummaryResponse, Product } from '../types/product'
import type { PageResponse } from '../types/api'

export interface GetProductsParams {
  page?: number
  size?: number
  keyword?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  sortBy?: 'CREATED_DATE' | 'PRICE' | 'SOLD_COUNT' | 'RATING_AVG' | string
  sortDir?: 'ASC' | 'DESC' | string
}

export const productApi = {
  getProducts: async (params?: GetProductsParams): Promise<PageResponse<ProductSummaryResponse>> => {
    const data = await axiosClient.get<any, PageResponse<ProductSummaryResponse>>('/products', {
      params,
    })
    return data
  },

  getTopSoldProducts: async (size = 6): Promise<PageResponse<ProductSummaryResponse>> => {
    const data = await axiosClient.get<any, PageResponse<ProductSummaryResponse>>('/products', {
      params: {
        sortBy: 'SOLD_COUNT',
        sortDir: 'DESC',
        page: 0,
        size,
      },
    })
    return data
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const data = await axiosClient.get<any, Product>(`/products/${slug}`)
    return data
  },

  getCategoryTree: async (): Promise<CategoryResponse[]> => {
    const data = await axiosClient.get<any, CategoryResponse[]>('/categories')
    return data
  },
}
