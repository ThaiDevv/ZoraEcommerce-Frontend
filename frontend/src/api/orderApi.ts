import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api';
import {
  CancelOrderResponse,
  CheckoutCartRequest,
  CheckoutResponse,
  DetailOrderResponse,
  HistoryOrderResponse,
  StatusType,
} from '../types/order';

export const orderApi = {
  createOrder: (data: CheckoutCartRequest) =>
    axiosClient.post<any, ApiResponse<CheckoutResponse>>('/orders', data),

  getHistoryOrders: (status?: StatusType, page: number = 0, size: number = 10) =>
    axiosClient.get<any, ApiResponse<PageResponse<HistoryOrderResponse>>>('/orders', {
      params: { status, page, size },
    }),

  getOrderDetail: (id: number | string) =>
    axiosClient.get<any, ApiResponse<DetailOrderResponse>>(`/orders/${id}`),

  cancelOrder: (id: number | string, reason?: string) =>
    axiosClient.put<any, ApiResponse<CancelOrderResponse>>(
      `/orders/${id}/cancel`,
      reason || '',
      { headers: { 'Content-Type': 'text/plain' } }
    ),
};
