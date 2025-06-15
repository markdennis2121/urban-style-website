
import React from 'react';
import MobileOptimizedProductCard from './MobileOptimizedProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
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

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return <MobileOptimizedProductCard product={product} />;
};

export default ProductCard;
