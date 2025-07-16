
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const MobileOptimizedProducts = React.memo(() => {
  const [dbProducts, setDbProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced resize handler for better performance
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerPage(2); // Mobile: 2 items per "page"
      } else if (width < 1024) {
        setItemsPerPage(4); // Tablet: 4 items
      } else {
        setItemsPerPage(6); // Desktop: 6 items
      }
    }, 100);
  }, []);

  const loadFeaturedProducts = useCallback(async () => {
    try {
      console.log('Loading featured products from database...');
      
      // Optimize query to only get needed fields
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image, category, brand, stock, is_featured, description, created_at')
        .eq('is_featured', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Supabase error loading featured products:', error);
        throw error;
      }

      console.log('Featured products loaded successfully:', data?.length || 0, 'products');
      setDbProducts(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading featured products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setDbProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeaturedProducts();
  }, [loadFeaturedProducts]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  // Memoize transformed products with proper optimization
  const transformedDbProducts = useMemo(() => 
    dbProducts.map(product => ({
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
      features: ['Featured Product'],
      sizes: ['One Size'],
      colors: ['Default'],
      inStock: product.stock > 0,
      isNew: false,
      isSale: false,
    })), [dbProducts]
  );

  const { totalPages, displayedProducts } = useMemo(() => {
    const total = Math.ceil(transformedDbProducts.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const displayed = transformedDbProducts.slice(startIndex, startIndex + itemsPerPage);
    return { totalPages: total, displayedProducts: displayed };
  }, [transformedDbProducts, currentPage, itemsPerPage]);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  if (error) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">⚠️</div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">Error Loading Products</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={loadFeaturedProducts}
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
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile-optimized header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Featured Products
          </h2>
          <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 mx-auto mb-4 sm:mb-6 rounded-full"></div>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Discover our handpicked collection of premium items
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Skeleton className="bg-muted/50 rounded-xl aspect-square mb-3 sm:mb-4" />
                <Skeleton className="bg-muted/50 rounded h-3 sm:h-4 mb-2" />
                <Skeleton className="bg-muted/50 rounded h-3 sm:h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : transformedDbProducts.length > 0 ? (
          <>
            {/* Products grid - mobile-first responsive with optimized animations */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {displayedProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="animate-fade-in hover:scale-105 transition-all duration-300 transform-gpu will-change-transform"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Mobile-friendly pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 sm:mt-12 space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  className="p-2 sm:p-3"
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex space-x-1 sm:space-x-2">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                        currentPage === index ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  className="p-2 sm:p-3"
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-4 opacity-50">⭐</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">No Featured Products</h3>
            <p className="text-muted-foreground text-sm sm:text-base">Featured products will appear here once added by admin!</p>
          </div>
        )}
      </div>
    </section>
  );
});

MobileOptimizedProducts.displayName = 'MobileOptimizedProducts';

export default MobileOptimizedProducts;
