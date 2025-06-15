
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
      {/* Wishlist Button - Fixed centering and enhanced state indication */}
      <Button
        variant="secondary"
        size="icon"
        className={`w-10 h-10 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 relative ${
          isWishlisted
            ? 'bg-red-500 hover:bg-red-600 text-white border-red-500 scale-110'
            : 'bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 border-white/50'
        }`}
        onClick={onWishlistToggle}
      >
        <Heart className={`w-4 h-4 transition-all duration-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
          isWishlisted ? 'fill-current text-white scale-110' : 'hover:fill-current'
        }`} />
      </Button>

      {/* Compare Button - Fixed centering */}
      <Button
        variant="secondary"
        size="icon"
        className={`w-10 h-10 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 relative ${
          isInComparison
            ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 scale-110'
            : 'bg-white/90 hover:bg-white text-gray-700 hover:text-blue-500 border-white/50'
        } ${!canAddToCompare && !isInComparison ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onCompareToggle}
        disabled={!canAddToCompare && !isInComparison}
      >
        <Scale className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </Button>

      {/* Quick Add to Cart Button - Fixed centering */}
      {isAuthenticated && (
        <Button
          variant="secondary"
          size="icon"
          className="w-10 h-10 rounded-full shadow-lg backdrop-blur-sm bg-primary/90 hover:bg-primary text-white transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 border-primary/50 relative"
          onClick={onAddToCart}
          disabled={!inStock}
        >
          <ShoppingCart className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </Button>
      )}
    </div>
  );
};

export default ProductActionButtons;
