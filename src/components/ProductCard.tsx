
import React from 'react';
import { Product } from '../data/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { dispatch } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Quick view functionality would go here
    toast({
      title: "Quick View",
      description: "Quick view feature coming soon!",
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Added to wishlist!",
      description: `${product.name} has been added to your wishlist.`,
    });
  };

  return (
    <Link to={`/product/${product.id}`}>
      <div className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && <Badge className="bg-green-500">New</Badge>}
            {product.isSale && <Badge className="bg-red-500">Sale</Badge>}
          </div>

          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              size="icon" 
              variant="secondary" 
              className="w-8 h-8"
              onClick={handleWishlist}
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              className="w-8 h-8"
              onClick={handleQuickView}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>

          {/* Add to cart overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              onClick={handleAddToCart}
              className="w-full" 
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground">{product.brand}</p>
          </div>

          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              ({product.reviews})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">              <span className="font-bold text-foreground">₱{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₱{product.originalPrice}
                </span>
              )}
            </div>
            {!product.inStock && (
              <Badge variant="secondary">Out of Stock</Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
