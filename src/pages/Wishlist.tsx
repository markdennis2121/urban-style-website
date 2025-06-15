
import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useWishlist } from '../contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const Wishlist = () => {
  const { state, removeFromWishlist, loadWishlist } = useWishlist();
  const { dispatch } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleAddToCart = (item: any) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: item.product_id,
        name: item.product_name,
        price: item.product_price,
        image: item.product_image,
      },
    });

    toast({
      title: "Added to cart!",
      description: `${item.product_name} has been added to your cart.`,
    });
  };

  const handleRemoveFromWishlist = (item: any) => {
    removeFromWishlist(item.product_id);
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Minimal header */}
      <section className="pt-24 pb-8 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
          </div>
          <p className="text-muted-foreground">
            {state.items.length} {state.items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {state.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {state.items.map((item, index) => (
              <Card key={item.id} className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img 
                    src={item.product_image} 
                    alt={item.product_name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  
                  {/* Minimal remove button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 border border-gray-200 hover:border-red-200 flex items-center justify-center transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Wishlist indicator */}
                  <div className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-1 text-sm">
                      {item.product_name}
                    </h3>
                    <p className="text-lg font-bold text-primary">₱{item.product_price}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-primary hover:bg-primary/90 rounded-lg text-xs h-8"
                      size="sm"
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Add to Cart
                    </Button>
                    <Link to={`/product/${item.product_id}`}>
                      <Button variant="outline" size="sm" className="rounded-lg border-border/50 hover:bg-muted text-xs h-8 px-3">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Start adding items you love to your wishlist
            </p>
            <Link to="/shop">
              <Button className="bg-primary hover:bg-primary/90 rounded-lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;
