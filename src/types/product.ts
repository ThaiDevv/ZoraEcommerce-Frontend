export interface CategoryResponse {
  id: number
  name: string
  slug: string
  iconUrl?: string | null
  level: number
  sortOrder: number
  children?: CategoryResponse[]
}

export interface CategorySummary {
  id: number
  name: string
  slug?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  imageUrl?: string
  parentId?: number | null
}

export interface ProductImage {
  id: number
  imageUrl: string
  sortOrder?: number
  isPrimary?: boolean
}

export interface ProductVariant {
  id: number
  variantName: string
  sku: string
  price: number
  stock: number
  imageUrl?: string
}

export interface ShopSummary {
  id: number
  name: string
  logoUrl?: string
  rating?: number
  totalProducts?: number
  responseRate?: string
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
  ratingAvg?: number
  ratingCount?: number
  viewCount?: number
  status?: string
  imageUrl?: string
  primaryImageUrl?: string
  category?: CategorySummary
  shop?: ShopSummary
  shopId?: number
  shopName?: string
  images?: ProductImage[]
  variants?: ProductVariant[]
  createdAt?: string
  createdDate?: string
}
