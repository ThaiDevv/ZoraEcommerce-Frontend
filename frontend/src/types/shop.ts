export interface CreateShopRequest {
  name: string;
  description?: string;
}

export interface UpdateShopRequire {
  name?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface ShopResponse {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  rating?: number;
  totalProducts?: number;
  totalFollowers?: number;
  isActive?: boolean;
}

export interface CreateProductVariantRequest {
  variantName: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface CreateProductImageRequest {
  imageUrl: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  categoryId: number;
  images: CreateProductImageRequest[];
  variants: CreateProductVariantRequest[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  status?: string;
  categoryId?: number;
  images?: CreateProductImageRequest[];
  variants?: CreateProductVariantRequest[];
}
