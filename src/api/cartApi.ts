import axiosClient from './axiosClient'

export interface BackendCartItem {
  id: number
  productId: number
  productName: string
  productImage?: string
  variantName?: string
  price: number
  quantity: number
  totalPrice: number
}

export interface BackendCartShopGroup {
  shopId: number
  shopName: string
  shopLogo?: string
  cartItems: BackendCartItem[]
}

export interface BackendCartResponse {
  cartId: number
  totalAmount: number
  totalItem: number
  shopGroups: BackendCartShopGroup[]
}

export const cartApi = {
  getCart: async (): Promise<BackendCartResponse | null> => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (!token) return null
      const res = await axiosClient.get<any, BackendCartResponse>('/cart')
      return res
    } catch {
      return null
    }
  },

  addToCart: async (sku: string, quantity: number = 1) => {
    return await axiosClient.post('/cart/item', { sku, quantity })
  },

  updateItemQuantity: async (cartItemId: number, quantity: number) => {
    return await axiosClient.put(`/cart/item/${cartItemId}`, null, {
      params: { quantity }
    })
  },

  removeItem: async (cartItemId: number) => {
    return await axiosClient.delete(`/cart/item/${cartItemId}`)
  },

  clearCart: async () => {
    return await axiosClient.delete('/cart')
  },
}
