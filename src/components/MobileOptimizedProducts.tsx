
import React, { useState, useEffect } from 'react';
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

const MobileOptimizedProducts = () => {
  const [dbProducts, setDbProducts] = useState<DatabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    loadFeaturedProducts();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleResize = () => {
    const width = window.innerWidth;
    if (width < 640) {
      setItemsPerPage(2); // Mobile: 2 items per "page"
    } else if (width < 1024) {
      setItemsPerPage(4); // Tablet: 4 items
    } else {
      setItemsPerPage(6); // Desktop: 6 items
    }
  };

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

  const totalPages = Math.ceil(transformedDbProducts.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const displayedProducts = transformedDbProducts.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

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
            {/* Products grid - mobile-first responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {displayedProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="animate-fade-in hover:scale-105 transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
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
};

export default MobileOptimizedProducts;
