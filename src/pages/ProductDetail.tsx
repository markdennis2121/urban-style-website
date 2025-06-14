import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductReviews from '../components/ProductReviews';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Plus, Minus, Truck, Shield, RotateCcw, LogIn } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAdminMode } from '../contexts/AdminModeContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DbProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  description: string;
  stock: number;
  is_new_arrival: boolean;
  created_at: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { dispatch } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { canUseShoppingFeatures } = useAdminMode();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Available sizes and colors (you can make these dynamic later)
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray'];

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading product:', error);
        setError('Product not found');
        return;
      }

      console.log('Loaded product:', data);
      setProduct(data);
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddToCart = () => {
    if (!product) return;
    
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
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '/placeholder.svg',
        size: selectedSize,
        color: selectedColor,
        quantity: quantity,
      },
    });

    toast({
      title: "Added to cart!",
      description: `${quantity}x ${product.name} added to your cart.`,
    });
  };

  const handleWishlist = () => {
    if (!product) return;

    if (!requireAuth('manage your wishlist')) return;
    
    if (!canUseShoppingFeatures) {
      toast({
        title: "Shopping disabled",
        description: "Switch to Customer Mode to use shopping features.",
        variant: "destructive"
      });
      return;
    }

    const wishlistProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '/placeholder.svg',
      category: product.category,
      brand: product.brand || 'Admin Added',
      rating: 4.5,
      reviews: 0,
      description: product.description,
      features: [],
      sizes: availableSizes,
      colors: availableColors,
      inStock: product.stock > 0,
      isNew: product.is_new_arrival || false,
      isSale: false,
      images: [product.image || '/placeholder.svg']
    };

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(wishlistProduct);
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <Header />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <Header />
        <div className="pt-24 pb-16 text-center">
          <div className="max-w-md mx-auto px-4">
            <div className="text-8xl mb-6 opacity-50">🔍</div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">Product Not Found</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              {error || 'The product you are looking for does not exist or has been removed.'}
            </p>
            <Link to="/shop">
              <Button className="bg-primary hover:bg-primary/90 rounded-xl px-8 py-3">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-xl">
                <img 
                  src={product.image || '/placeholder.svg'} 
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.is_new_arrival && <Badge className="bg-green-500 hover:bg-green-600">New</Badge>}
                  {product.stock < 10 && product.stock > 0 && (
                    <Badge variant="destructive">Low Stock</Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <p className="text-muted-foreground">{product.brand || 'Admin Added'}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < 4 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  4.5 (0 reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-foreground">₱{product.price?.toLocaleString()}</span>
              </div>

              {/* Description */}
              <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Product Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full bg-background/80 border-border/50 rounded-xl">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-xl">
                      {availableSizes.map(size => (
                        <SelectItem key={size} value={size} className="hover:bg-muted rounded-lg">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger className="w-full bg-background/80 border-border/50 rounded-xl">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-xl">
                      {availableColors.map(color => (
                        <SelectItem key={color} value={color} className="hover:bg-muted rounded-lg">
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="bg-background/80 border-border/50 rounded-xl"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium bg-background/80 border border-border/50 rounded-xl py-2">
                      {quantity}
                    </span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="bg-background/80 border-border/50 rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                {canUseShoppingFeatures && (
                  <>
                    {isAuthenticated ? (
                      <Button 
                        size="lg" 
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    ) : (
                      <Button 
                        size="lg"
                        onClick={() => navigate('/login')}
                        className="flex-1 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground"
                        variant="outline"
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        Login to Add to Cart
                      </Button>
                    )}
                    
                    {isAuthenticated ? (
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={handleWishlist}
                        className={`rounded-xl bg-background/80 border-border/50 ${
                          isInWishlist(product.id) 
                            ? 'bg-red-500 text-white hover:bg-red-600 border-red-500' 
                            : ''
                        }`}
                      >
                        <Heart className={`w-5 h-5 mr-2 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                        {isInWishlist(product.id) ? 'In Wishlist' : 'Wishlist'}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => navigate('/login')}
                        className="rounded-xl bg-background/80 border-border/50"
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        Login for Wishlist
                      </Button>
                    )}
                  </>
                )}
                
                <Button variant="outline" size="lg" className="rounded-xl bg-background/80 border-border/50">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <span className="text-sm">Free Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-primary" />
                  <span className="text-sm">Easy Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm">Secure Payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Reviews */}
          <ProductReviews productId={product.id} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
