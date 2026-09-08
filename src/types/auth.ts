export interface User {
  id?: number
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
  role?: string
  isActive?: boolean
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
