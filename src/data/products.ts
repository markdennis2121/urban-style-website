
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
    name: 'Urban Style T-Shirt',    price: 1499.00,
    originalPrice: 1999.00,
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
    price: 4499.00,
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
    name: 'Slim Fit Jeans',    price: 3999.00,
    originalPrice: 4999.00,
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
    price: 5999.00,
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
    price: 2999.00,    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      'https://images.unsplash.com/photo-1700501957502-d98918c18ca7?w=400',
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
  },  {
    id: '6',
    name: 'Summer Dress',    price: 3499.00,
    originalPrice: 4499.00,
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
  },  {    id: '7',
    name: 'Athletic Performance Shorts',
    price: 1999.00,
    image: 'https://i5.walmartimages.com/seo/Rosvigor-Womens-Athletic-Shorts-High-Waisted-Running-Shorts-Gym-Workout-Shorts-with-Pockets_523d08fe-ad09-47e2-a6cc-b5ee24fa1f15.1f580d550f776e28762abff5e24365b1.jpeg',
    images: [
      'https://i5.walmartimages.com/seo/Rosvigor-Womens-Athletic-Shorts-High-Waisted-Running-Shorts-Gym-Workout-Shorts-with-Pockets_523d08fe-ad09-47e2-a6cc-b5ee24fa1f15.1f580d550f776e28762abff5e24365b1.jpeg',
      'https://i5.walmartimages.com/seo/Rosvigor-Womens-Athletic-Shorts-High-Waisted-Running-Shorts-Gym-Workout-Shorts-with-Pockets_523d08fe-ad09-47e2-a6cc-b5ee24fa1f15.1f580d550f776e28762abff5e24365b1.jpeg',
    ],
    category: 'Shorts',
    brand: 'Nike',
    rating: 4.7,
    reviews: 45,
    description: 'High-performance athletic shorts with moisture-wicking technology. Perfect for workouts and sports.',
    features: ['Moisture Wicking', 'Quick Dry', 'Breathable Mesh', 'Hidden Pocket'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Gray', 'Red'],
    inStock: true,
    isNew: true,
  },
  {
    id: '8',
    name: 'Crossbody Leather Bag',
    price: 4999.00,
    originalPrice: 5999.00,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400',
    ],
    category: 'Accessories',
    brand: 'Urban',
    rating: 4.8,
    reviews: 34,
    description: 'Premium leather crossbody bag with modern design. Perfect blend of style and functionality.',
    features: ['Genuine Leather', 'Adjustable Strap', 'Multiple Compartments', 'Metal Hardware'],
    sizes: ['One Size'],
    colors: ['Brown', 'Black', 'Tan'],
    inStock: true,
    isNew: true,
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
