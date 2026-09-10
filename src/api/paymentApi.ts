import axiosClient from './axiosClient'
import type { PaymentResponse } from '../types/payment'

export const paymentApi = {
  
  processPayment: async (orderId: number | string): Promise<PaymentResponse> => {
    const res = await axiosClient.post<any, PaymentResponse>(`/orders/${orderId}/payment`)
    return res as unknown as PaymentResponse
  },

  
  getPaymentStatus: async (orderId: number | string): Promise<PaymentResponse> => {
    const res = await axiosClient.get<any, PaymentResponse>(`/orders/${orderId}/payment`)
    return res as unknown as PaymentResponse
  },
}

export default paymentApi
