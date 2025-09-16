export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  category: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubcategoryResponse {
  results: number;
  metadata: {
    currentPage: number;
    numberOfPages: number;
    limit: number;
  };
  data: Subcategory[];
}
