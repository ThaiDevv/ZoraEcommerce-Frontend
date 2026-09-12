export type UserSex = 'MALE' | 'FEMALE'

export interface User {
  id?: number
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
  role?: string
  isActive?: boolean
  sex?: UserSex | null
  dateOfBirth?: string | null
}

export interface UpdateProfilePayload {
  fullName: string
  phone?: string
  sex?: UserSex
  birthDate?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  fullname?: string
  phone?: string
  sex?: UserSex
  birthDay?: string
  BirthDay?: string
  dateOfBirth?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  username: string
}

export interface RegisterResponse {
  fullName: string
  email: string
  phone?: string
}

export interface AuthResponse {
  accessToken?: string
  refreshToken?: string
  token?: string
  username?: string
  user?: User
}
