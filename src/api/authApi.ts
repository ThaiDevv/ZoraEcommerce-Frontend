import axiosClient from './axiosClient'
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  User
} from '../types/auth'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const res = await axiosClient.post<any, LoginResponse>('/auth/login', {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    })
    return res as unknown as LoginResponse
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    // Spring Boot Jackson DTO requires 'fullname' (lowercase 'n')
    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      fullname: data.fullName.trim(),
      fullName: data.fullName.trim(),
      phone: data.phone?.trim() ? data.phone.trim() : null,
    }
    const res = await axiosClient.post<any, RegisterResponse>('/auth/register', payload)
    return res as unknown as RegisterResponse
  },

  getProfile: async (): Promise<User> => {
    const res = await axiosClient.get<any, User>('/users/me')
    return res as unknown as User
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await axiosClient.put<any, User>('/users/me', data)
    return res as unknown as User
  },
}
