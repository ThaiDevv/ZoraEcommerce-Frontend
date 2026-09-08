import axiosClient from './axiosClient'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth'
import type { ApiResponse } from '../types/api'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const res = await axiosClient.post<any, ApiResponse<AuthResponse>>('/auth/login', credentials)
    return res.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await axiosClient.post<any, ApiResponse<AuthResponse>>('/auth/register', data)
    return res.data
  },

  getProfile: async (): Promise<User> => {
    const res = await axiosClient.get<any, ApiResponse<User>>('/users/me')
    return res.data
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await axiosClient.put<any, ApiResponse<User>>('/users/me', data)
    return res.data
  },
}
