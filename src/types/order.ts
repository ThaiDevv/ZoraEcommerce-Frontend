export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'COMPLETED'

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

export interface HistoryOrderItem {
  orderItemId: number
  productId: number
  productName: string
  productPictureUrl?: string
  variantName?: string
  price: number
  quantity: number
  subTotal: number
}

export interface HistoryOrder {
  orderId: number
  orderNumber: string
  shopId: number
  shopAvatarUrl?: string
  shopName: string
  totalAmount: number
  subTotal: number
  status: OrderStatus
  createDate: string
  items: HistoryOrderItem[]
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

export interface DetailOrderItem {
  id: number
  variantId: number
  productName: string
  productId: number
  productPictureUrl?: string
  variantName?: string
  price: number
  quantity: number
  subtotal: number
}

export interface DetailOrderResponse {
  orderId: number
  shopId: number
  paymentId?: number
  orderNumber: string
  method: 'COD' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'CREDIT_CARD'
  transactionId?: string
  shopName: string
  logoUrl?: string
  nameReceive: string
  phoneReceive: string
  address: string
  subtotal: number
  shippingFee: number
  discountAmount: number
  totalAmount: number
  statusType: OrderStatus
  createdDate: string
  orderItemResponses: DetailOrderItem[]
}
