
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogIn } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCartButtonProps {
  isAuthenticated: boolean;
  inStock?: boolean;
  onAddToCart: (e: React.MouseEvent) => void;
  onLoginRedirect: (e: React.MouseEvent) => void;
  loading?: boolean;
}

const ProductCartButton: React.FC<ProductCartButtonProps> = ({
  isAuthenticated,
  inStock,
  onAddToCart,
  onLoginRedirect,
  loading = false,
}) => {
  if (loading) {
    return <Skeleton className="w-full h-10 sm:h-auto rounded-xl" />;
  }

  if (isAuthenticated) {
    return (
      <Button 
        onClick={onAddToCart}
        disabled={!inStock}
        className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed rounded-xl transition-colors duration-300 h-10 sm:h-auto py-2 sm:py-2.5 text-sm sm:text-base"
        size="sm"
      >
        <ShoppingCart className="w-4 h-4 mr-1 sm:mr-2" />
        <span className="truncate">
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </span>
      </Button>
    );
  }

  return (
    <Button 
      onClick={onLoginRedirect}
      className="w-full bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl transition-colors duration-300 h-10 sm:h-auto py-2 sm:py-2.5 text-sm sm:text-base"
      size="sm"
      variant="outline"
    >
      <LogIn className="w-4 h-4 mr-1 sm:mr-2" />
      <span className="truncate">
        Login to Add
      </span>
    </Button>
  );
};

export default ProductCartButton;
