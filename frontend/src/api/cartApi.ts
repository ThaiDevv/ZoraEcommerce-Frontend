import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { CartResponse } from '../types/cart';

export const cartApi = {
  getCart: () =>
    axiosClient.get<any, ApiResponse<CartResponse>>('/cart'),

  addItem: (data: { sku: string; quantity: number }) =>
    axiosClient.post<any, ApiResponse<any>>('/cart/item', data),

  updateQuantity: (itemId: number, quantity: number) =>
    axiosClient.put<any, ApiResponse<any>>(`/cart/item/${itemId}`, null, {
      params: { quantity },
    }),

  removeItem: (itemId: number) =>
    axiosClient.delete<any, ApiResponse<any>>(`/cart/item/${itemId}`),

  clearCart: () =>
    axiosClient.delete<any, ApiResponse<any>>('/cart'),
};
