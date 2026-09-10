import axiosClient from "./axiosClient"
import type { HistoryOrder, DetailOrderResponse } from "../types/order"
import type { PageResponse } from "../types/api"

export interface BackendAddress {
  id: number
  fullName: string
  phone: string
  street: string
  ward: string
  district: string
  city: string
  isDefault: boolean
}

export interface CreateAddressPayload {
  fullName: string
  phone: string
  street: string
  ward: string
  district: string
  city: string
  isDefault?: boolean
}

export interface CheckoutCartPayload {
  addressId: number
  voucherId?: number | null
  paymentMethod: "COD" | "BANK_TRANSFER" | "VNPAY" | "MOMO" | "CREDIT_CARD"
  note?: string
  cartItemIds: number[]
}

export const orderApi = {
  createOrder: async (data: CheckoutCartPayload): Promise<any> => {
    const res = await axiosClient.post<any, any>("/orders", data)
    return res
  },

  getBuyerOrders: async (params?: { page?: number; size?: number; status?: string }): Promise<PageResponse<HistoryOrder>> => {
    const res = await axiosClient.get<any, PageResponse<HistoryOrder>>("/orders", { params })
    return res as unknown as PageResponse<HistoryOrder>
  },

  getOrderDetail: async (orderId: number | string): Promise<DetailOrderResponse> => {
    const res = await axiosClient.get<any, DetailOrderResponse>(`/orders/${orderId}`)
    return res as unknown as DetailOrderResponse
  },

  cancelOrder: async (orderId: number | string, reason?: string): Promise<any> => {
    const res = await axiosClient.put<any, any>(`/orders/${orderId}/cancel`, reason || "Buyer requested cancellation")
    return res
  },

  getAddresses: async (): Promise<BackendAddress[]> => {
    const res = await axiosClient.get<any, BackendAddress[]>("/users/me/addresses")
    return res || []
  },

  addAddress: async (data: CreateAddressPayload): Promise<BackendAddress> => {
    const res = await axiosClient.post<any, BackendAddress>("/users/me/addresses", data)
    return res
  },

  updateAddress: async (addressId: number, data: CreateAddressPayload): Promise<BackendAddress> => {
    const res = await axiosClient.put<any, BackendAddress>(`/users/me/addresses/${addressId}`, data)
    return res
  },

  deleteAddress: async (addressId: number): Promise<void> => {
    await axiosClient.delete(`/users/me/addresses/${addressId}`)
  },

  setDefaultAddress: async (addressId: number): Promise<BackendAddress> => {
    const res = await axiosClient.put<any, BackendAddress>(`/users/me/addresses/${addressId}/default`)
    return res
  },
}
