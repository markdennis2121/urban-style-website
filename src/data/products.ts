
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

export const products: Product[] = [
  {
    id: '1',
    name: 'Urban Style T-Shirt',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=400',
    ],
    category: 'T-Shirts',
    brand: 'Urban',
    rating: 4.5,
    reviews: 128,
    description: 'Premium cotton t-shirt with modern urban design. Perfect for casual wear.',
    features: ['100% Cotton', 'Machine Washable', 'Comfortable Fit', 'Durable Material'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'White', 'Navy', 'Gray'],
    inStock: true,
    isNew: true,
    isSale: true,
  },
  {
    id: '2',
    name: 'Classic Denim Jacket',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
    images: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
    ],
    category: 'Jackets',
    brand: 'Urban',
    rating: 4.8,
    reviews: 89,
    description: 'Timeless denim jacket that never goes out of style. Perfect for layering.',
    features: ['Premium Denim', 'Classic Fit', 'Multiple Pockets', 'Vintage Wash'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black', 'Light Blue'],
    inStock: true,
    isNew: false,
  },
  {
    id: '3',
    name: 'Slim Fit Jeans',
    price: 79.99,
    originalPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400',
    ],
    category: 'Jeans',
    brand: 'Urban',
    rating: 4.6,
    reviews: 156,
    description: 'Contemporary slim-fit jeans with stretch comfort. Perfect everyday wear.',
    features: ['Stretch Denim', 'Slim Fit', '5-Pocket Design', 'Fade Resistant'],
    sizes: ['28', '30', '32', '34', '36', '38'],
    colors: ['Dark Blue', 'Black', 'Light Blue'],
    inStock: true,
    isSale: true,
  },
  {
    id: '4',
    name: 'Casual Sneakers',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
    ],
    category: 'Shoes',
    brand: 'Urban',
    rating: 4.7,
    reviews: 203,
    description: 'Comfortable sneakers perfect for everyday adventures. Premium materials and cushioned sole.',
    features: ['Cushioned Sole', 'Breathable Material', 'Durable Construction', 'Versatile Style'],
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['White', 'Black', 'Gray', 'Navy'],
    inStock: true,
  },
  {
    id: '5',
    name: 'Hoodie Sweatshirt',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400',
    ],
    category: 'Hoodies',
    brand: 'Urban',
    rating: 4.4,
    reviews: 92,
    description: 'Cozy hoodie perfect for cooler weather. Soft fleece interior and adjustable hood.',
    features: ['Fleece Lined', 'Adjustable Hood', 'Kangaroo Pocket', 'Ribbed Cuffs'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Gray', 'Navy', 'Burgundy'],
    inStock: true,
    isNew: true,
  },
  {
    id: '6',
    name: 'Summer Dress',
    price: 69.99,
    originalPrice: 89.99,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400',
    ],
    category: 'Dresses',
    brand: 'Urban',
    rating: 4.9,
    reviews: 67,
    description: 'Elegant summer dress perfect for any occasion. Lightweight and comfortable.',
    features: ['Lightweight Fabric', 'Elegant Design', 'Comfortable Fit', 'Easy Care'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Floral', 'Solid Blue', 'Black', 'White'],
    inStock: true,
    isSale: true,
  },
];

export const categories = [
  'All',
  'T-Shirts',
  'Jackets',
  'Jeans',
  'Shoes',
  'Hoodies',
  'Dresses',
];

export const brands = [
  'All Brands',
  'Urban',
  'Nike',
  'Adidas',
  'Levi\'s',
];
