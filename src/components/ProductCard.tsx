
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useProductComparison } from '../contexts/ProductComparisonContext';
import { useAdminMode } from '../contexts/AdminModeContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import LazyImage from '@/components/ui/LazyImage';
import ProductBadges from './ProductCard/ProductBadges';
import ProductActionButtons from './ProductCard/ProductActionButtons';
import ProductInfo from './ProductCard/ProductInfo';
import ProductCartButton from './ProductCard/ProductCartButton';

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isSale?: boolean;
  originalPrice?: number;
  inStock?: boolean;
  brand?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { dispatch } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare, canAddToCompare } = useProductComparison();
  const { canUseShoppingFeatures } = useAdminMode();
  const { isAuthenticated, loading, initialized } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const productIdString = String(product.id);

  const requireAuth = (action: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: `Please log in to ${action}.`,
        variant: "destructive"
      });
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!requireAuth('add items to cart')) return;
      
      if (!canUseShoppingFeatures) {
        toast({
          title: "Shopping disabled",
          description: "Switch to Customer Mode to use shopping features.",
          variant: "destructive"
        });
        return;
      }

      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id: productIdString,
          name: product.name,
          price: product.price,
          image: product.image,
        },
      });

      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!requireAuth('manage your wishlist')) return;
      
      if (!canUseShoppingFeatures) {
        toast({
          title: "Shopping disabled",
          description: "Switch to Customer Mode to use shopping features.",
          variant: "destructive"
        });
        return;
      }

      addToWishlist(product);
    } catch (error) {
      console.error('Error managing wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!canUseShoppingFeatures) {
        toast({
          title: "Shopping disabled",
          description: "Switch to Customer Mode to use shopping features.",
          variant: "destructive"
        });
        return;
      }

      addToCompare({
        id: productIdString,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        brand: product.brand,
        rating: product.rating,
        description: product.description
      });
    } catch (error) {
      console.error('Error managing comparison:', error);
      toast({
        title: "Error",
        description: "Failed to update comparison. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLoginRedirect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/login');
  };

  // Add safety checks
  if (!product || !product.id) {
    console.warn('ProductCard received invalid product data:', product);
    return null;
  }

  const isWishlisted = isAuthenticated && isInWishlist(productIdString);
  const isInComparison = isInCompare(productIdString);

  // Only show loading state if not initialized yet
  const showLoadingState = !initialized;

  return (
    <Card className="group bg-card/60 backdrop-blur-md border border-border/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2">
      <Link to={`/product/${productIdString}`} className="block">
        <div className="relative overflow-hidden">
          <LazyImage 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          <ProductBadges product={product} />

          {canUseShoppingFeatures && (
            <ProductActionButtons
              isWishlisted={isWishlisted}
              isInComparison={isInComparison}
              canAddToCompare={canAddToCompare}
              isAuthenticated={isAuthenticated}
              inStock={product.inStock}
              onWishlistToggle={handleWishlistToggle}
              onCompareToggle={handleCompareToggle}
              onAddToCart={handleAddToCart}
              loading={showLoadingState}
            />
          )}
        </div>

        <CardContent className="p-4 sm:p-6">
          <ProductInfo product={product} />

          {canUseShoppingFeatures && (
            <ProductCartButton
              isAuthenticated={isAuthenticated}
              inStock={product.inStock}
              onAddToCart={handleAddToCart}
              onLoginRedirect={handleLoginRedirect}
              loading={showLoadingState}
            />
          )}
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProductCard;
