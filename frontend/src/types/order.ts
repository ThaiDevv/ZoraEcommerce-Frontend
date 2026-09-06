import type { PaymentMethod, PaymentStatus } from './payment';

export type StatusType = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItemResponse {
  id: number;
  variantId: number;
  productName: string;
  productId: number;
  productPictureUrl?: string;
  variantName?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface HistoryOrderItemResponse {
  orderItemId: number;
  productId: number;
  productName: string;
  productPictureUrl?: string;
  variantName?: string;
  price: number;
  quantity: number;
  subTotal: number;
}

export interface HistoryOrderResponse {
  orderId: number;
  orderNumber: string;
  shopId: number;
  shopAvatarUrl?: string;
  shopName: string;
  totalAmount: number;
  subTotal: number;
  status: StatusType;
  createDate: string;
  items: HistoryOrderItemResponse[];
}

export interface DetailOrderResponse {
  orderId: number;
  shopId: number;
  paymentId?: number;
  orderNumber: string;
  method?: PaymentMethod;
  transactionId?: string;
  shopName: string;
  logoUrl?: string;
  nameReceive: string;
  phoneReceive: string;
  address: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  statusType: StatusType;
  createdDate: string;
  orderItemResponses: OrderItemResponse[];
}

export interface OrderSummaryResponse {
  orderId: number;
  orderNumber: string;
  buyerName: string;
  totalAmount: number;
  status: StatusType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalItems: number;
  createdDate: string;
}

export interface SellerOrderDetailResponse {
  orderId: number;
  orderNumber: string;
  status: StatusType;
  note?: string;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
  items: OrderItemResponse[];
  createdDate: string;
}

export interface CheckoutCartRequest {
  addressId: number;
  voucherId?: number | null;
  paymentMethod: PaymentMethod;
  note?: string;
  cartItemIds: number[];
}

export interface OrderResponse {
  orderId: number;
  orderNumber: string;
  shopId: number;
  shop_name?: string;
  shopName?: string;
  addressId?: number;
  receiveName?: string;
  shopUrl?: string;
  receivePhone?: string;
  receiveAddress?: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  status: StatusType;
  note?: string;
  createdDate: string;
  items?: OrderItemResponse[];
}

export interface CheckoutResponse {
  grandTotal?: number;
  totalOrders?: number;
  orders: (OrderResponse | DetailOrderResponse)[];
}

export interface CancelOrderResponse {
  orderId: number;
  orderNumber?: string;
  status: StatusType;
  reason?: string;
  cancelAt?: string;
}

