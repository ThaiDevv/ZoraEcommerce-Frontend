export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
  imageUrl?: string;
  level?: number;
  sortOrder?: number;
  children?: CategoryResponse[];
  description?: string;
}

export interface CategorySummaryResponse {
  id: number;
  name: string;
  slug?: string;
}

export interface ShopSummaryResponse {
  id: number;
  name: string;
  logoUrl?: string;
  rating?: number;
}

export interface ProductImageResponse {
  id: number;
  imageUrl: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface ProductVariantResponse {
  id: number;
  variantName: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface ProductSummaryResponse {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  primaryImageUrl: string;
  ratingAvg?: number;
  ratingCount?: number;
  soldCount?: number;
  shopName: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  soldCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
  viewCount?: number;
  status: string;
  createdDate: string;
  shop: ShopSummaryResponse;
  category: CategorySummaryResponse;
  images: ProductImageResponse[];
  variants: ProductVariantResponse[];
}

// ── Filter & Sort Request (ProductController) ──────────────────────────
export type ProductSortBy = 'CREATED_DATE' | 'PRICE' | 'SOLD_COUNT' | 'RATING_AVG';
export type ProductSortDir = 'ASC' | 'DESC';

export interface FilterSortRequest {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortBy;
  sortDir?: ProductSortDir;
  page?: number;
  size?: number;
}

// Keep ProductFilterParams for backward compatibility
export interface ProductFilterParams extends FilterSortRequest {
  sort?: string;
}

// ── Seller Product Requests (SellerProductController) ─────────────────
export interface CreateProductImageRequest {
  imageUrl: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface CreateProductVariantRequest {
  variantName: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export interface CreateProductRequest {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images: CreateProductImageRequest[];
  variants: CreateProductVariantRequest[];
}

export interface UpdateProductImageRequest {
  id?: number;
  imageUrl?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface UpdateProductVariantRequest {
  id?: number;
  variantName?: string;
  sku?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  status?: string;
  categoryId?: number;
  images?: UpdateProductImageRequest[];
  variants?: UpdateProductVariantRequest[];
}

// ── Seller Inventory Types (SellerInventoryController) ────────────────
export type InventoryLogType = 'IN' | 'OUT' | 'RESERVED' | 'CANCEL_RESERVED' | 'ADJUST';

export interface InventoryLogResponse {
  id: number;
  inventoryId: number;
  type: InventoryLogType;
  quantityChange: number;
  quantityAfter: number;
  reason: string;
  referenceId?: number;
  createdAt: string;
}

