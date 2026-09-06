import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { UserResponse, AddressResponse } from '../types/auth';

export interface UpdateProfileRequest {
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Exactly matches backend CreateAddressRequest
export interface CreateAddressRequest {
  fullName: string;
  phone: string;
  street: string;
  ward?: string;
  district?: string;
  city: string;
  isDefault?: boolean;
}

export type AddressRequest = CreateAddressRequest;

export const userApi = {
  // Lấy thông tin cá nhân hiện tại: GET /api/v1/users/me
  getProfile: () =>
    axiosClient.get<any, ApiResponse<UserResponse>>('/users/me'),

  // Cập nhật thông tin cá nhân: PUT /api/v1/users/me
  updateProfile: (data: UpdateProfileRequest) =>
    axiosClient.put<any, ApiResponse<UserResponse>>('/users/me', data),

  // Đổi mật khẩu: PUT /api/v1/users/me/password
  changePassword: (data: ChangePasswordRequest) =>
    axiosClient.put<any, ApiResponse<any>>('/users/me/password', data),

  // Cập nhật avatar: POST /api/v1/users/me/avatar
  updateAvatar: (avatarUrl: string) =>
    axiosClient.post<any, ApiResponse<string>>('/users/me/avatar', null, {
      params: { url: avatarUrl },
    }),

  // Danh sách địa chỉ: GET /api/v1/users/me/addresses
  getAddresses: () =>
    axiosClient.get<any, ApiResponse<AddressResponse[]>>('/users/me/addresses'),

  // Thêm địa chỉ mới: POST /api/v1/users/me/addresses
  createAddress: (data: AddressRequest) =>
    axiosClient.post<any, ApiResponse<AddressResponse>>('/users/me/addresses', data),

  // Lấy chi tiết 1 địa chỉ theo ID: GET /api/v1/users/me/addresses/:addressId
  getAddress: (addressId: number | string) =>
    axiosClient.get<any, ApiResponse<AddressResponse>>(`/users/me/addresses/${addressId}`),

  // Cập nhật địa chỉ: PUT /api/v1/users/me/addresses/:addressId
  updateAddress: (addressId: number | string, data: AddressRequest) =>
    axiosClient.put<any, ApiResponse<AddressResponse>>(`/users/me/addresses/${addressId}`, data),

  // Xóa địa chỉ: DELETE /api/v1/users/me/addresses/:addressId
  deleteAddress: (addressId: number | string) =>
    axiosClient.delete<any, ApiResponse<any>>(`/users/me/addresses/${addressId}`),

  // Đặt làm địa chỉ mặc định: PUT /api/v1/users/me/addresses/:addressId/default
  setDefaultAddress: (addressId: number | string) =>
    axiosClient.put<any, ApiResponse<AddressResponse>>(`/users/me/addresses/${addressId}/default`),

  // Alias khớp tên setDefault của backend controller
  setDefault: (addressId: number | string) =>
    axiosClient.put<any, ApiResponse<AddressResponse>>(`/users/me/addresses/${addressId}/default`),
};
