
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  isNew?: boolean;
  isSale?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const MobileOptimizedProductCard = React.memo(({ product }: ProductCardProps) => {
  const { dispatch } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { canUseShoppingFeatures } = useAdminMode();
  const { isAuthenticated } = useAuth();

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        size: product.sizes[0],
        color: product.colors[0],
      },
    });
    toast.success('Added to cart!');
  }, [dispatch, isAuthenticated, product]);

  const handleWishlistToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to manage your wishlist');
      return;
    }
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [addToWishlist, removeFromWishlist, product, isAuthenticated, isWishlisted]);

  return (
    <div className="group relative bg-card rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-border/50 w-full">
      {/* Product badges - minimal design */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isNew && (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-md font-medium">
            New
          </span>
        )}
        {product.isSale && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md font-medium">
            Sale
          </span>
        )}
      </div>

      {/* Minimal Wishlist button */}
      {canUseShoppingFeatures && (
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-lg transition-all duration-200 flex items-center justify-center ${
            isWishlisted
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 border border-gray-200 hover:border-red-200'
          } opacity-0 group-hover:opacity-100 md:opacity-100`}
        >
          <Heart 
            className={`w-4 h-4 transition-all duration-200 ${
              isWishlisted ? 'fill-red-500 text-red-500' : ''
            }`} 
          />
        </button>
      )}

      <Link to={`/product/${product.id}`} className="block">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-muted/20">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Minimal overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button size="sm" variant="secondary" className="text-xs px-3 py-1 bg-white/90 backdrop-blur-sm border border-gray-200">
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
          </div>
        </div>

        {/* Product info - minimal spacing */}
        <div className="p-3 sm:p-4 space-y-2">
          {/* Brand and category */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">{product.brand}</span>
            <span className="capitalize">{product.category}</span>
          </div>

          {/* Product name */}
          <h3 className="font-semibold text-sm sm:text-base text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating - minimal */}
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews})</span>
          </div>

          {/* Price and add to cart */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">${product.price}</span>
              {product.isSale && (
                <span className="text-xs text-red-500 line-through">
                  ${(product.price * 1.2).toFixed(2)}
                </span>
              )}
            </div>

            {canUseShoppingFeatures && product.inStock && isAuthenticated && (
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="px-3 py-1 text-xs h-8 bg-primary hover:bg-primary/90 rounded-lg"
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Add
              </Button>
            )}
          </div>

          {/* Stock status */}
          {!product.inStock && (
            <div className="text-center">
              <span className="text-xs text-red-500 font-medium">Out of Stock</span>
            </div>
          )}

          {/* Login prompt */}
          {!isAuthenticated && canUseShoppingFeatures && (
            <div className="text-center">
              <span className="text-xs text-muted-foreground">Login to add to cart or wishlist</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
});

MobileOptimizedProductCard.displayName = 'MobileOptimizedProductCard';

export default MobileOptimizedProductCard;
