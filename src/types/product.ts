export interface CategoryResponse {
  id: number
  name: string
  slug: string
  iconUrl?: string | null
  level: number
  sortOrder: number
  children?: CategoryResponse[]
}

export interface Category {
  id: number
  name: string
  slug: string
  imageUrl?: string
  parentId?: number | null
}

export interface ProductVariant {
  id: number
  variantName: string
  sku: string
  price: number
  stock: number
  imageUrl?: string
}

export interface ProductSummaryResponse {
  id: number
  name: string
  slug: string
  price: number
  originalPrice?: number
  primaryImageUrl: string
  ratingAvg?: number
  ratingCount?: number
  soldCount?: number
  shopName?: string
}

export interface Product {
  id: number
  name: string
  slug: string
  description?: string
  price: number
  originalPrice?: number
  soldCount?: number
  rating?: number
  imageUrl: string
  primaryImageUrl?: string
  category?: Category
  shopId?: number
  shopName?: string
  variants?: ProductVariant[]
  createdAt?: string
}
