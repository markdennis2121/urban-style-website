
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
      {/* Wishlist Button */}
      <Button
        variant="secondary"
        size="icon"
        className={`rounded-full shadow-lg backdrop-blur-sm transition-colors duration-300 ${
          isWishlisted
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-white/90 hover:bg-white text-gray-700'
        }`}
        onClick={onWishlistToggle}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </Button>

      {/* Compare Button */}
      <Button
        variant="secondary"
        size="icon"
        className={`rounded-full shadow-lg backdrop-blur-sm transition-colors duration-300 ${
          isInComparison
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-white/90 hover:bg-white text-gray-700'
        } ${!canAddToCompare && !isInComparison ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onCompareToggle}
        disabled={!canAddToCompare && !isInComparison}
      >
        <Scale className="w-4 h-4" />
      </Button>

      {/* Quick Add to Cart Button */}
      {isAuthenticated && (
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg backdrop-blur-sm bg-primary/90 hover:bg-primary text-white transition-colors duration-300 disabled:bg-gray-300 disabled:text-gray-500"
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
