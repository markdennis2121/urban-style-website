
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProductStock {
  id: string;
  stock: number;
}

const Cart = () => {
  const { state, dispatch } = useCart();
  const [productStocks, setProductStocks] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state.items.length > 0) {
      loadProductStocks();
    } else {
      setLoading(false);
    }
  }, [state.items]);

  const loadProductStocks = async () => {
    try {
      const productIds = state.items.map(item => item.id);
      const { data, error } = await supabase
        .from('products')
        .select('id, stock')
        .in('id', productIds);

      if (error) throw error;
      setProductStocks(data || []);
    } catch (err) {
      console.error('Error loading product stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductStock = (productId: string) => {
    const product = productStocks.find(p => p.id === productId);
    return product ? product.stock : 0;
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="text-8xl mb-8">🛒</div>
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added anything to your cart yet
            </p>
            <Link to="/shop">
              <Button size="lg">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {state.itemCount} {state.itemCount === 1 ? 'item' : 'items'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Items in your cart</h2>
                <Button variant="outline" size="sm" onClick={clearCart}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-4">
                {state.items.map((item) => {
                  const stock = getProductStock(item.id);
                  const isLowStock = stock > 0 && stock <= 5;
                  const isOutOfStock = stock === 0;

                  return (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="bg-card rounded-lg p-4 shadow-sm">
                      <div className="flex gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{item.name}</h3>
                              <div className="text-sm text-muted-foreground">
                                {item.size && <span>Size: {item.size}</span>}
                                {item.size && item.color && <span> • </span>}
                                {item.color && <span>Color: {item.color}</span>}
                              </div>
                              
                              {/* Stock Information */}
                              <div className="flex items-center gap-2 mt-1">
                                <Package className="w-3 h-3" />
                                {loading ? (
                                  <span className="text-xs text-muted-foreground">Loading stock...</span>
                                ) : isOutOfStock ? (
                                  <span className="text-xs text-red-600 font-medium">Out of stock</span>
                                ) : isLowStock ? (
                                  <span className="text-xs text-orange-600 font-medium">Only {stock} left</span>
                                ) : (
                                  <span className="text-xs text-green-600 font-medium">{stock} in stock</span>
                                )}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="h-8 w-8"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={isOutOfStock || item.quantity >= stock}
                                className="h-8 w-8"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-semibold">₱{(item.price * item.quantity).toFixed(2)}</div>
                              <div className="text-sm text-muted-foreground">₱{item.price} each</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">                    <span>Subtotal</span>
                    <span>₱{state.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₱{(state.total * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₱{(state.total * 1.08).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Link to="/checkout" className="block">
                  <Button size="lg" className="w-full">
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <Link to="/shop" className="block mt-4">
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>

                {/* Promo */}
                <div className="mt-6 p-4 bg-muted rounded-lg">                  <div className="text-sm font-medium mb-2">Free shipping on orders over ₱2500!</div>
                  <div className="text-xs text-muted-foreground">
                    Add ₱{Math.max(0, 2500 - state.total).toFixed(2)} more to qualify
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
