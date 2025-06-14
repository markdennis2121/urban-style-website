
import React, { useState, useEffect } from 'react';
import { products } from '../data/products';
import { supabase } from '@/lib/supabase/client';
import ProductCard from './ProductCard';

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  is_featured: boolean;
  created_at: string;
  brand: string;
}

const ProductsSection = () => {
  const [dbProducts, setDbProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDbProducts(data || []);
    } catch (err) {
      console.error('Error loading featured products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Combine existing products with database products, filter out of stock
  const existingFeaturedProducts = products.slice(0, 6).filter(product => product.inStock);
  
  // Transform database products to match Product interface
  const transformedDbProducts = dbProducts.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image || '/placeholder.svg',
    images: [product.image || '/placeholder.svg'],
    category: product.category,
    brand: product.brand || 'Admin Added',
    rating: 4.5,
    reviews: 0,
    description: product.description,
    features: ['Admin Product'],
    sizes: ['One Size'],
    colors: ['Default'],
    inStock: product.stock > 0,
    isNew: false,
    isSale: false,
  }));

  const allFeaturedProducts = [...existingFeaturedProducts, ...transformedDbProducts];

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Featured Products
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-muted-foreground font-light">
            Discover our handpicked collection of premium items
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted/50 rounded-xl h-64 mb-4"></div>
                <div className="bg-muted/50 rounded h-4 mb-2"></div>
                <div className="bg-muted/50 rounded h-4 w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {allFeaturedProducts.map((product, index) => (
              <div 
                key={product.id}
                className="animate-fade-in hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
