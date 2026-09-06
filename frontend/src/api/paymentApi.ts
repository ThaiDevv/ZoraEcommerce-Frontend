import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { PaymentResponse } from '../types/payment';

export const paymentApi = {
  processPayment: (orderId: number | string) =>
    axiosClient.post<any, ApiResponse<PaymentResponse>>(`/orders/${orderId}/payment`),

  getPaymentStatus: (orderId: number | string) =>
    axiosClient.get<any, ApiResponse<PaymentResponse>>(`/orders/${orderId}/payment`),
};
