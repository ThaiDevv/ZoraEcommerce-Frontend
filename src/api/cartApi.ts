import axiosClient from './axiosClient'
import type { Cart, AddToCartRequest } from '../types/cart'
import type { ApiResponse } from '../types/api'

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const res = await axiosClient.get<any, ApiResponse<Cart>>('/cart')
    return res.data
  },

  addToCart: async (data: AddToCartRequest): Promise<Cart> => {
    const res = await axiosClient.post<any, ApiResponse<Cart>>('/cart/items', data)
    return res.data
  },

  updateItemQuantity: async (cartItemId: number, quantity: number): Promise<Cart> => {
    const res = await axiosClient.put<any, ApiResponse<Cart>>(`/cart/items/${cartItemId}`, { quantity })
    return res.data
  },

  removeItem: async (cartItemId: number): Promise<void> => {
    await axiosClient.delete(`/cart/items/${cartItemId}`)
  },

  clearCart: async (): Promise<void> => {
    await axiosClient.delete('/cart')
  },
}
