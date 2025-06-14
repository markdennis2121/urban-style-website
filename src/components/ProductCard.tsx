
import React from 'react';
import { Product } from '../data/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { dispatch } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
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

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Quick View",
      description: "Quick view feature coming soon!",
    });
  };

  return (
    <Link to={`/product/${product.id}`}>
      <div className="group bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
        <div className="relative overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && <Badge className="bg-green-500 rounded-xl">New</Badge>}
            {product.isSale && <Badge className="bg-red-500 rounded-xl">Sale</Badge>}
            {product.stock !== undefined && (
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-border/50 rounded-xl">
                Stock: {product.stock}
              </Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              size="icon" 
              variant="secondary" 
              className={`w-8 h-8 rounded-full backdrop-blur-sm ${
                isInWishlist(product.id) 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-secondary/80 hover:bg-secondary'
              }`}
              onClick={handleWishlist}
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              size="icon" 
              variant="secondary" 
              className="w-8 h-8 rounded-full bg-secondary/80 backdrop-blur-sm hover:bg-secondary"
              onClick={handleQuickView}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>

          {/* Add to cart overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              onClick={handleAddToCart}
              className="w-full rounded-xl bg-primary hover:bg-primary/90" 
              size="sm"
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-3">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground">{product.brand}</p>
          </div>

          <div className="flex items-center gap-1 mb-3">
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
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">₱{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₱{product.originalPrice}
                </span>
              )}
            </div>
            {!product.inStock && (
              <Badge variant="destructive" className="rounded-xl">Out of Stock</Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
