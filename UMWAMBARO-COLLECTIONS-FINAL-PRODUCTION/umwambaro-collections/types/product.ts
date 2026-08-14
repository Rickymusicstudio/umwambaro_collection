export interface Product {
  id: string;
  sku?: string;
  slug: string;

  name: string;
  description?: string;

  category: string;
  condition?: "new" | "chaguwa";
  brand?: string;

  price: number;
  comparePrice?: number;
  currency?: "RWF";

  stock: number;

  // Backward compatibility
  image?: string;
  hoverImage?: string;

  // New gallery
  images: string[];

  rating?: number;
  reviews?: number;

  colors?: string[];
  sizes?: string[];

  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
  bestSeller?: boolean;

  createdAt?: string;
}