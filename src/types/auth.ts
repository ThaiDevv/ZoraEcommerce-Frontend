export interface User {
  id: number
  email: string
  fullName: string
  phone?: string
  avatarUrl?: string
  role?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface AuthResponse {
  token: string
  user: User
}
