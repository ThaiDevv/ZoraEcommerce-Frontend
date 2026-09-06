export interface CartItemResponse {
  id: number;
  variantId: number;
  sku: string;
  productName: string;
  variantName: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stock: number;
  imageUrl?: string;
}

export interface CartShopGroupResponse {
  shopId: number;
  shopName: string;
  shopLogo?: string;
  cartItems: CartItemResponse[];
}

export interface CartResponse {
  cartId: number;
  totalAmount: number;
  totalItem: number;
  shopGroups: CartShopGroupResponse[];
}
