export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'

export type PaymentMethod = 'COD' | 'VNPAY' | 'WALLET'

export interface OrderItemResponse {
  id: number
  productId: number
  productName: string
  variantId?: number
  variantName?: string
  imageUrl?: string
  price: number
  quantity: number
  totalPrice: number
}

export interface AddressResponse {
  id: number
  recipientName: string
  phone: string
  province: string
  district: string
  ward: string
  streetAddress: string
  isDefault?: boolean
}

export interface OrderResponse {
  id: number
  orderCode: string
  status: OrderStatus
  totalAmount: number
  shippingFee: number
  finalAmount: number
  paymentMethod: PaymentMethod
  paymentStatus: string
  shippingAddress: AddressResponse | string
  note?: string
  orderItems: OrderItemResponse[]
  createdAt: string
  updatedAt?: string
}

export interface CreateOrderRequest {
  addressId: number
  paymentMethod: PaymentMethod
  note?: string
  items: {
    cartItemId?: number
    variantId: number
    quantity: number
  }[]
}
