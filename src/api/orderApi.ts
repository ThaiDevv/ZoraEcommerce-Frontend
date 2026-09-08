import axiosClient from './axiosClient'
import type { OrderResponse, CreateOrderRequest, AddressResponse } from '../types/order'
import type { ApiResponse, PageResponse } from '../types/api'

export const orderApi = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const res = await axiosClient.post<any, ApiResponse<OrderResponse>>('/orders', data)
    return res.data
  },

  getBuyerOrders: async (params?: { page?: number; size?: number; status?: string }): Promise<PageResponse<OrderResponse>> => {
    const res = await axiosClient.get<any, ApiResponse<PageResponse<OrderResponse>>>('/orders/history', { params })
    return res.data
  },

  getOrderDetail: async (orderId: number | string): Promise<OrderResponse> => {
    const res = await axiosClient.get<any, ApiResponse<OrderResponse>>(`/orders/${orderId}`)
    return res.data
  },

  cancelOrder: async (orderId: number | string, reason: string): Promise<OrderResponse> => {
    const res = await axiosClient.post<any, ApiResponse<OrderResponse>>(`/orders/${orderId}/cancel`, reason, {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
    return res.data
  },

  getAddresses: async (): Promise<AddressResponse[]> => {
    const res = await axiosClient.get<any, ApiResponse<AddressResponse[]>>('/users/addresses')
    return res.data
  },

  addAddress: async (data: Omit<AddressResponse, 'id'>): Promise<AddressResponse> => {
    const res = await axiosClient.post<any, ApiResponse<AddressResponse>>('/users/addresses', data)
    return res.data
  },
}
