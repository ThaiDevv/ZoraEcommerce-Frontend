import type { Product, ProductVariant } from './product'

export interface CartItem {
  id: number
  productId: number
  variantId?: number
  quantity: number
  price: number
  product: Product
  variant?: ProductVariant
  selected?: boolean
}

export interface Cart {
  id: number
  userId: number
  items: CartItem[]
  totalPrice: number
  totalItems: number
}

export interface AddToCartRequest {
  variantId: number
  quantity: number
}

export interface UpdateCartItemRequest {
  cartItemId: number
  quantity: number
}
