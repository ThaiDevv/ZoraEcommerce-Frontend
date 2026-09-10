import axiosClient from './axiosClient'
import type { PaymentResponse } from '../types/payment'

export const paymentApi = {
  /**
   * POST /api/v1/orders/{orderId}/payment
   * Xử lý thanh toán cho đơn hàng cụ thể (tạo giao dịch VNPay/COD/Bank Transfer/Credit Card/Momo).
   */
  processPayment: async (orderId: number | string): Promise<PaymentResponse> => {
    const res = await axiosClient.post<any, PaymentResponse>(`/orders/${orderId}/payment`)
    return res as unknown as PaymentResponse
  },

  /**
   * GET /api/v1/orders/{orderId}/payment
   * Lấy thông tin & trạng thái giao dịch thanh toán của đơn hàng.
   */
  getPaymentStatus: async (orderId: number | string): Promise<PaymentResponse> => {
    const res = await axiosClient.get<any, PaymentResponse>(`/orders/${orderId}/payment`)
    return res as unknown as PaymentResponse
  },
}

export default paymentApi
