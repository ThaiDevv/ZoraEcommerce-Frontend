import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api';
import { OrderSummaryResponse, SellerOrderDetailResponse, StatusType } from '../types/order';

export const sellerOrderApi = {
  getOrders: (status?: StatusType, page: number = 0, size: number = 10) =>
    axiosClient.get<any, ApiResponse<PageResponse<OrderSummaryResponse>>>('/seller/orders', {
      params: { status, page, size },
    }),

  getOrderDetail: (id: number | string) =>
    axiosClient.get<any, ApiResponse<SellerOrderDetailResponse>>(`/seller/orders/${id}`),

  confirmOrder: (id: number | string) =>
    axiosClient.put<any, ApiResponse<SellerOrderDetailResponse>>(`/seller/orders/${id}/confirm`),

  shipOrder: (id: number | string) =>
    axiosClient.put<any, ApiResponse<SellerOrderDetailResponse>>(`/seller/orders/${id}/ship`),

  deliverOrder: (id: number | string) =>
    axiosClient.put<any, ApiResponse<SellerOrderDetailResponse>>(`/seller/orders/${id}/deliver`),
};
