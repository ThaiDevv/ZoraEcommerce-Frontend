import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { LoginResponse, UserResponse } from '../types/auth';

export const authApi = {
  login: (data: { email?: string; username?: string; password: string }) =>
    axiosClient.post<any, ApiResponse<LoginResponse>>('/auth/login', data),

  register: (data: any) =>
    axiosClient.post<any, ApiResponse<any>>('/auth/register', data),

  getProfile: () =>
    axiosClient.get<any, ApiResponse<UserResponse>>('/users/me'),

  getAddresses: () =>
    axiosClient.get<any, ApiResponse<any[]>>('/users/me/addresses'),
};

export * from './userApi';

