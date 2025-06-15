
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
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
      {/* Minimal Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`w-8 h-8 rounded-lg transition-all duration-200 ${
          isWishlisted
            ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
            : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 border border-gray-200 hover:border-red-200'
        }`}
        onClick={onWishlistToggle}
      >
        <Heart 
          className={`w-4 h-4 transition-all duration-200 ${
            isWishlisted ? 'fill-red-500 text-red-500' : ''
          }`} 
        />
      </Button>

      {/* Minimal Compare Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`w-8 h-8 rounded-lg transition-all duration-200 ${
          isInComparison
            ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200'
            : 'bg-white/90 hover:bg-white text-gray-600 hover:text-blue-500 border border-gray-200 hover:border-blue-200'
        } ${!canAddToCompare && !isInComparison ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onCompareToggle}
        disabled={!canAddToCompare && !isInComparison}
      >
        <Scale className="w-4 h-4" />
      </Button>

      {/* Minimal Quick Add to Cart Button */}
      {isAuthenticated && (
        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 rounded-lg transition-all duration-200 ${
            inStock 
              ? 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/30' 
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
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
