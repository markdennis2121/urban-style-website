import React from 'react';
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

const MobileOptimizedProductCard = ({ product }: ProductCardProps) => {
  const { dispatch } = useCart();
  const { addToWishlist } = useWishlist();
  const { canUseShoppingFeatures } = useAdminMode();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
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
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    addToWishlist(product);
  };

  return (
    <div className="group relative bg-card rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-border/50">
      {/* Product badges - mobile optimized */}
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

      {/* Wishlist button - mobile optimized */}
      {canUseShoppingFeatures && (
        <button
          onClick={handleAddToWishlist}
          className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100 md:opacity-100"
        >
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 hover:text-red-500 transition-colors" />
        </button>
      )}

      <Link to={`/product/${product.id}`}>
        {/* Image container - mobile optimized aspect ratio */}
        <div className="relative aspect-square overflow-hidden bg-muted/20">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Mobile overlay with quick actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <Button size="sm" variant="secondary" className="text-xs px-3 py-1">
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        </div>

        {/* Product info - mobile optimized spacing */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {/* Brand and category */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium">{product.brand}</span>
            <span className="capitalize">{product.category}</span>
          </div>

          {/* Product name - mobile optimized text size */}
          <h3 className="font-semibold text-sm sm:text-base text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating - mobile optimized */}
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">
              ({product.reviews})
            </span>
          </div>

          {/* Price and add to cart - mobile optimized */}
          <div className="flex items-center justify-between pt-1 sm:pt-2">
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-primary">
                ${product.price}
              </span>
              {product.isSale && (
                <span className="text-xs text-red-500 line-through">
                  ${(product.price * 1.2).toFixed(2)}
                </span>
              )}
            </div>

            {canUseShoppingFeatures && product.inStock && (
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="px-3 py-1 text-xs sm:text-sm h-8 sm:h-9"
              >
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Add
              </Button>
            )}
          </div>

          {/* Stock status */}
          {!product.inStock && (
            <div className="text-center">
              <span className="text-xs sm:text-sm text-red-500 font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default MobileOptimizedProductCard;
