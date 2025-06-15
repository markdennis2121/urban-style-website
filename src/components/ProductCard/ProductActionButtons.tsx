
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Scale, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductActionButtonsProps {
  isWishlisted: boolean;
  isInComparison: boolean;
  canAddToCompare: boolean;
  isAuthenticated: boolean;
  inStock?: boolean;
  onWishlistToggle: (e: React.MouseEvent) => void;
  onCompareToggle: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  loading?: boolean;
}

const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
  isWishlisted,
  isInComparison,
  canAddToCompare,
  isAuthenticated,
  inStock,
  onWishlistToggle,
  onCompareToggle,
  onAddToCart,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    );
  }

  return (
    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
      {/* Wishlist Button - Professional design with clear states */}
      <Button
        variant="secondary"
        size="icon"
        className={`w-10 h-10 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 flex items-center justify-center relative overflow-hidden ${
          isWishlisted
            ? 'bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-red-200'
            : 'bg-white/95 hover:bg-white text-gray-600 hover:text-red-500 border-white/80 hover:border-red-200'
        }`}
        onClick={onWishlistToggle}
      >
        <Heart 
          className={`w-4 h-4 transition-all duration-200 ${
            isWishlisted 
              ? 'fill-white text-white scale-110' 
              : 'hover:fill-red-500 hover:scale-110'
          }`} 
        />
        {/* Subtle pulse animation for wishlisted items */}
        {isWishlisted && (
          <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />
        )}
      </Button>

      {/* Compare Button - Consistent with wishlist design */}
      <Button
        variant="secondary"
        size="icon"
        className={`w-10 h-10 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 flex items-center justify-center ${
          isInComparison
            ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-blue-200'
            : 'bg-white/95 hover:bg-white text-gray-600 hover:text-blue-500 border-white/80 hover:border-blue-200'
        } ${!canAddToCompare && !isInComparison ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onCompareToggle}
        disabled={!canAddToCompare && !isInComparison}
      >
        <Scale className="w-4 h-4" />
      </Button>

      {/* Quick Add to Cart Button - Enhanced design */}
      {isAuthenticated && (
        <Button
          variant="secondary"
          size="icon"
          className={`w-10 h-10 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 flex items-center justify-center ${
            inStock 
              ? 'bg-primary/90 hover:bg-primary text-white border-primary/80 hover:shadow-primary/20' 
              : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
          }`}
          onClick={onAddToCart}
          disabled={!inStock}
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default ProductActionButtons;
