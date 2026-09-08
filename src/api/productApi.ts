import axiosClient from './axiosClient'
import type { Product, Category } from '../types/product'
import type { ApiResponse, PageResponse } from '../types/api'

export const productApi = {
  getProducts: async (params?: {
    page?: number
    size?: number
    keyword?: string
    categoryId?: number
    sortBy?: string
  }): Promise<PageResponse<Product>> => {
    const res = await axiosClient.get<any, ApiResponse<PageResponse<Product>>>('/products', {
      params,
    })
    return res.data
  },

  getProductById: async (id: number | string): Promise<Product> => {
    const res = await axiosClient.get<any, ApiResponse<Product>>(`/products/${id}`)
    return res.data
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await axiosClient.get<any, ApiResponse<Category[]>>('/categories')
    return res.data
  },
}
