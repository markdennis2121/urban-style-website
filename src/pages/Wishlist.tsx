
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <Header />
      
      <section className="pt-24 pb-8 bg-gradient-to-r from-muted/30 via-background to-muted/30 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              My Wishlist
            </h1>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 mb-6 rounded-full"></div>
          <p className="text-xl text-muted-foreground font-light">
            Your favorite items saved for later ({state.items.length} {state.items.length === 1 ? 'item' : 'items'})
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {state.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {state.items.map((item, index) => (
              <Card key={item.id} className="group bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative overflow-hidden">
                  <img 
                    src={item.product_image} 
                    alt={item.product_name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="w-9 h-9 rounded-full bg-red-500/90 backdrop-blur-sm hover:bg-red-600 shadow-lg flex items-center justify-center"
                      onClick={() => handleRemoveFromWishlist(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {/* Wishlist indicator */}
                  <div className="absolute top-3 left-3">
                    <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-2">
                      {item.product_name}
                    </h3>
                    <p className="text-2xl font-bold text-primary">₱{item.product_price}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-primary hover:bg-primary/90 rounded-xl"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Link to={`/product/${item.product_id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl border-border/50 hover:bg-muted">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-8 bg-muted/20 rounded-full flex items-center justify-center">
              <Heart className="w-16 h-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Start adding items you love to your wishlist
            </p>
            <Link to="/shop">
              <Button className="bg-primary hover:bg-primary/90 rounded-xl px-8 py-3">
                <Heart className="w-4 h-4 mr-2" />
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
