export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AddressResponse {
  id: number;
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  // Aliases for compatibility
  recipientName?: string;
  phoneNumber?: string;
  detailAddress?: string;
  province?: string;
}
