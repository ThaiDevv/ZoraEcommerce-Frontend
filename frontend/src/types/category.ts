export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string | null;
  imageUrl?: string;
  level: number;
  sortOrder: number;
  children: CategoryResponse[];
  description?: string;
}

export interface CreateCategoryRequest {
  parentId?: number | null;
  name: string;
  slug: string;
  iconUrl?: string | null;
  sortOrder?: number;
}
