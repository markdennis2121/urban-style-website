
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Package, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useProductComparison } from '../contexts/ProductComparisonContext';
import { useAdminMode } from '../contexts/AdminModeContext';
import { useToast } from '@/hooks/use-toast';
import LazyImage from '@/components/ui/LazyImage';

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
  const { toast } = useToast();

  const productIdString = String(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canUseShoppingFeatures) {
      toast({
        title: "Shopping disabled",
        description: "Switch to Customer Mode to use shopping features.",
        variant: "destructive"
      });
      return;
    }

    addToWishlist(product);
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
  };

  const isWishlisted = isInWishlist(productIdString);
  const isInComparison = isInCompare(productIdString);

  return (
    <Card className="group bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
      <Link to={`/product/${productIdString}`} className="block">
        <div className="relative overflow-hidden">
          <LazyImage 
            src={product.image} 
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-green-500/90 hover:bg-green-500 text-white backdrop-blur-sm">
                NEW
              </Badge>
            )}
            {product.isSale && (
              <Badge className="bg-red-500/90 hover:bg-red-500 text-white backdrop-blur-sm">
                SALE
              </Badge>
            )}
            {!product.inStock && (
              <Badge variant="secondary" className="bg-gray-500/90 text-white backdrop-blur-sm">
                <Package className="w-3 h-3 mr-1" />
                OUT OF STOCK
              </Badge>
            )}
          </div>

          {/* Action Buttons - only show if shopping features are enabled */}
          {canUseShoppingFeatures && (
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className={`w-10 h-10 rounded-full backdrop-blur-sm transition-all duration-300 ${
                  isWishlisted 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-500' 
                    : 'bg-white/20 hover:bg-white/30 text-white hover:text-red-500'
                }`}
                onClick={handleWishlistToggle}
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
                onClick={handleCompareToggle}
                disabled={!canAddToCompare && !isInComparison}
              >
                <Scale className={`w-5 h-5 ${isInComparison ? 'fill-current' : ''}`} />
              </Button>
            </div>
          )}

          {/* Quick Add Button - only show if shopping features are enabled */}
          {canUseShoppingFeatures && product.inStock && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button 
                size="icon"
                onClick={handleAddToCart}
                className="w-10 h-10 rounded-full bg-primary/90 hover:bg-primary backdrop-blur-sm"
              >
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          <div className="mb-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground">{product.category}</p>
                {product.brand && (
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                )}
              </div>
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating!) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.reviews || 0})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                ₱{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ₱{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button - only show if shopping features are enabled */}
          {canUseShoppingFeatures && (
            <Button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed rounded-xl transition-colors duration-300"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          )}
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProductCard;
