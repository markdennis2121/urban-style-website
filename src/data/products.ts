
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  isNew?: boolean;
  isSale?: boolean;
}

// Empty array - no hardcoded products
export const products: Product[] = [];

export const categories = [
  'All',
  'T-Shirts',
  'Jackets',
  'Jeans',
  'Shoes',
  'Hoodies',
  'Dresses',
  'Shorts',
  'Accessories',
];

export const brands = [
  'All Brands',
  'Urban',
  'Nike',
  'Adidas',
  'Levi\'s',
];
