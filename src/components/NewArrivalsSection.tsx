
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNewArrivals();
  }, []);

  const loadNewArrivals = async () => {
    try {
      console.log('Loading new arrivals from database...');
      
      // First try to load products marked as new arrivals
      let { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_new_arrival', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(8);

      // If no new arrivals, load recent products
      if (!data || data.length === 0) {
        console.log('No new arrivals found, loading recent products...');
        ({ data, error } = await supabase
          .from('products')
          .select('*')
          .gt('stock', 0)
          .order('created_at', { ascending: false })
          .limit(8));
      }

      if (error) {
        console.error('Supabase error loading products:', error);
        throw error;
      }

      console.log('Products loaded successfully:', data?.length || 0, 'products');
      setDbProducts(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading new arrivals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setDbProducts([]);
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
    brand: product.brand || 'Urban Style',
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

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">⚠️</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">Error Loading Products</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={loadNewArrivals}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

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
            <h3 className="text-2xl font-bold mb-2 text-foreground">No Products Available</h3>
            <p className="text-muted-foreground">Products will appear here once added by admin!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivalsSection;
