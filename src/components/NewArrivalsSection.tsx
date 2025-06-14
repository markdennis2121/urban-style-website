
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from './ProductCard';

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  is_new_arrival: boolean;
  created_at: string;
  brand: string;
}

const NewArrivalsSection = () => {
  const [dbProducts, setDbProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewArrivals();
  }, []);

  const loadNewArrivals = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_new_arrival', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDbProducts(data || []);
    } catch (err) {
      console.error('Error loading new arrivals:', err);
    } finally {
      setLoading(false);
    }
  };

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
    features: ['New Arrival'],
    sizes: ['One Size'],
    colors: ['Default'],
    inStock: product.stock > 0,
    isNew: true,
    isSale: false,
  }));

  return (
    <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            New Arrivals
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-muted-foreground font-light">
            Fresh styles, just for you
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Skeleton className="bg-muted/50 rounded-xl h-64 mb-4" />
                <Skeleton className="bg-muted/50 rounded h-4 mb-2" />
                <Skeleton className="bg-muted/50 rounded h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : transformedDbProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {transformedDbProducts.map((product, index) => (
              <div 
                key={product.id}
                className="animate-fade-in hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">📦</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">No New Arrivals</h3>
            <p className="text-muted-foreground">Check back soon for new products!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivalsSection;
