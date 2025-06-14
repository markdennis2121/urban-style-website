
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Scale, ShoppingCart } from 'lucide-react';

interface ProductActionButtonsProps {
  isWishlisted: boolean;
  isInComparison: boolean;
  canAddToCompare: boolean;
  isAuthenticated: boolean;
  inStock?: boolean;
  onWishlistToggle: (e: React.MouseEvent) => void;
  onCompareToggle: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
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
}) => {
  return (
    <>
      {/* Wishlist and Compare buttons */}
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <Button 
          size="icon" 
          variant="ghost" 
          className={`w-10 h-10 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isWishlisted 
              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-500' 
              : 'bg-white/20 hover:bg-white/30 text-white hover:text-red-500'
          }`}
          onClick={onWishlistToggle}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </Button>

        <Button 
          size="icon" 
          variant="ghost" 
          className={`w-10 h-10 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isInComparison 
              ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-500' 
              : 'bg-white/20 hover:bg-white/30 text-white hover:text-blue-500'
          } ${!canAddToCompare && !isInComparison ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={onCompareToggle}
          disabled={!canAddToCompare && !isInComparison}
        >
          <Scale className={`w-5 h-5 ${isInComparison ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Quick Add Button - only show for authenticated users */}
      {isAuthenticated && inStock && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            size="icon"
            onClick={onAddToCart}
            className="w-10 h-10 rounded-full bg-primary/90 hover:bg-primary backdrop-blur-sm"
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
        </div>
      )}
    </>
  );
};

export default ProductActionButtons;
