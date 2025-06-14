
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, LogIn } from 'lucide-react';

interface ProductCartButtonProps {
  isAuthenticated: boolean;
  inStock?: boolean;
  onAddToCart: (e: React.MouseEvent) => void;
  onLoginRedirect: (e: React.MouseEvent) => void;
}

const ProductCartButton: React.FC<ProductCartButtonProps> = ({
  isAuthenticated,
  inStock,
  onAddToCart,
  onLoginRedirect,
}) => {
  if (isAuthenticated) {
    return (
      <Button 
        onClick={onAddToCart}
        disabled={!inStock}
        className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed rounded-xl transition-colors duration-300"
        size="sm"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {inStock ? 'Add to Cart' : 'Out of Stock'}
      </Button>
    );
  }

  return (
    <Button 
      onClick={onLoginRedirect}
      className="w-full bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl transition-colors duration-300"
      size="sm"
      variant="outline"
    >
      <LogIn className="w-4 h-4 mr-2" />
      Login to Add to Cart
    </Button>
  );
};

export default ProductCartButton;
