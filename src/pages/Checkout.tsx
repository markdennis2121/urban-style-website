import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock, Truck, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { createOrder } from '@/lib/supabase/orders';
import { 
  sanitizeText, 
  validateEmail, 
  validatePhone,
  checkoutRateLimiter 
} from '@/lib/security';
import LoadingSpinner from '@/components/LoadingSpinner';

const Checkout = () => {
  const { state, dispatch } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (message: string) => {
    console.log('[CHECKOUT DEBUG]', message);
    setDebugInfo(prev => [...prev, message]);
  };

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'PH',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    const getUser = async () => {
      addDebugInfo('Checking user authentication...');
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        addDebugInfo(`Auth error: ${error.message}`);
        return;
      }
      if (user) {
        addDebugInfo(`User authenticated: ${user.email}`);
        setCurrentUser(user);
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      } else {
        addDebugInfo('No user found - user needs to log in');
      }
    };
    getUser();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeText(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleStripeCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    addDebugInfo('Starting checkout process...');
    setDebugInfo([]); // Clear previous debug info
    
    // Rate limiting check
    const userIdentifier = currentUser?.id || 'anonymous';
    if (!checkoutRateLimiter.isAllowed(userIdentifier)) {
      const remainingTime = Math.ceil(checkoutRateLimiter.getRemainingTime(userIdentifier) / 1000 / 60);
      toast({
        title: "Too Many Attempts",
        description: `Please wait ${remainingTime} minutes before trying again`,
        variant: "destructive",
      });
      return;
    }
    
    if (!validateForm()) {
      addDebugInfo('Form validation failed');
      toast({
        title: "Validation Error",
        description: "Please fill in all required shipping information",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      addDebugInfo('User not authenticated - redirecting to login');
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your order",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      addDebugInfo('Creating Stripe checkout session...');
      
      // Get the current session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('No valid session found. Please log in again.');
      }
      
      addDebugInfo('Valid session found, proceeding with checkout...');
      
      // Create order in database first
      const orderData = {
        user_id: currentUser.id,
        total_amount: state.total * 1.12, // Including tax
        shipping_address: {
          name: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
        },
        items: state.items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          price_per_unit: item.price,
          size: item.size,
          color: item.color,
        })),
      };

      addDebugInfo('Creating order in database...');
      const { data: order, error: orderError } = await createOrder(orderData);
      if (orderError) {
        addDebugInfo(`Order creation failed: ${orderError.message}`);
        throw orderError;
      }

      addDebugInfo(`Order created with ID: ${order?.id}`);

      // Prepare the exact payload the edge function expects
      const checkoutPayload = {
        items: state.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          brand: 'Urban Store', // Default brand
          size: item.size || undefined,
          color: item.color || undefined,
        })),
        total: state.total,
        orderId: order?.id,
      };

      addDebugInfo(`Sending payload to Stripe function: ${JSON.stringify(checkoutPayload)}`);

      // Create Stripe checkout session with explicit request configuration
      addDebugInfo('Calling Stripe checkout function...');
      
      // Use environment variables directly
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const functionUrl = `${supabaseUrl}/functions/v1/create-checkout`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify(checkoutPayload),
      });

      addDebugInfo(`Response status: ${response.status}`);
      addDebugInfo(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);

      if (!response.ok) {
        const errorText = await response.text();
        addDebugInfo(`Error response text: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }

      const responseData = await response.json();
      addDebugInfo(`Stripe function response: ${JSON.stringify(responseData)}`);

      if (!responseData.url) {
        addDebugInfo('No checkout URL received from Stripe');
        throw new Error('No checkout URL received from Stripe. Please check your Stripe configuration.');
      }

      addDebugInfo(`Stripe checkout session created: ${responseData.session_id}`);
      addDebugInfo('Clearing cart and redirecting to Stripe...');
      
      // Clear cart before redirecting to Stripe
      dispatch({ type: 'CLEAR_CART' });
      
      // Redirect to Stripe Checkout
      window.location.href = responseData.url;

    } catch (error: any) {
      addDebugInfo(`Checkout error: ${error.message}`);
      console.error('Checkout error:', error);
      
      let errorMessage = "There was an error processing your checkout. Please try again.";
      
      if (error.message?.includes('STRIPE_SECRET_KEY')) {
        errorMessage = "Stripe is not properly configured. Please contact support.";
      } else if (error.message?.includes('Authentication')) {
        errorMessage = "Please log out and log back in, then try again.";
      } else if (error.message?.includes('CORS')) {
        errorMessage = "Network configuration error. Please try again or contact support.";
      }
      
      toast({
        title: "Checkout Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold mb-4">No items to checkout</h1>
          <Link to="/shop">
            <Button>Return to Shop</Button>
          </Link>
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
          <div className="flex items-center gap-2 mb-8">
            <Shield className="w-6 h-6 text-green-600" />
            <h1 className="text-3xl font-bold">Secure Checkout</h1>
          </div>

          {/* Debug Information Panel */}
          {debugInfo.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Debug Information:</span>
              </div>
              <div className="text-sm space-y-1">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-gray-600">• {info}</div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleStripeCheckout}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Checkout Form */}
              <div className="space-y-8">
                {/* Contact Information */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkout-email">Email *</Label>
                      <Input
                        id="checkout-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="checkout-phone">Phone (Optional)</Label>
                      <Input
                        id="checkout-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkout-firstName">First Name *</Label>
                      <Input
                        id="checkout-firstName"
                        name="firstName"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="checkout-lastName">Last Name *</Label>
                      <Input
                        id="checkout-lastName"
                        name="lastName"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="checkout-address">Address *</Label>
                      <Input
                        id="checkout-address"
                        name="address"
                        autoComplete="street-address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                        className={errors.address ? 'border-red-500' : ''}
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>
                    <div>
                      <Label htmlFor="checkout-city">City *</Label>
                      <Input
                        id="checkout-city"
                        name="city"
                        autoComplete="address-level2"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="checkout-state">State *</Label>
                      <Input
                        id="checkout-state"
                        name="state"
                        autoComplete="address-level1"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        required
                        className={errors.state ? 'border-red-500' : ''}
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <Label htmlFor="checkout-zipCode">ZIP Code *</Label>
                      <Input
                        id="checkout-zipCode"
                        name="zipCode"
                        autoComplete="postal-code"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        required
                        className={errors.zipCode ? 'border-red-500' : ''}
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                    <div>
                      <Label htmlFor="checkout-country">Country</Label>
                      <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                        <SelectTrigger id="checkout-country" name="country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PH">Philippines</SelectItem>
                          <SelectItem value="SG">Singapore</SelectItem>
                          <SelectItem value="MY">Malaysia</SelectItem>
                          <SelectItem value="ID">Indonesia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-700">Secure Payment with Stripe</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      You'll be redirected to Stripe's secure payment page to complete your purchase.
                      We accept all major credit cards and debit cards.
                    </p>
                  </div>
                </div>

                {/* Enhanced Security Features */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 p-4 rounded-lg border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">SSL encrypted • PCI compliant • Your data is secure</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700">256-bit encryption • Fraud protection • Secure processing</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-card rounded-lg p-6 shadow-sm sticky top-24">
                  <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    {state.items.map((item) => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <div className="text-xs text-muted-foreground">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.size && item.color && <span> • </span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm">Qty: {item.quantity}</span>
                            <span className="font-medium">₱{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₱{state.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₱{(state.total * 0.12).toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>₱{(state.total * 1.12).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <LoadingSpinner size="sm" message="Processing..." />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay with Stripe
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                    <Truck className="w-4 h-4" />
                    <span>Free shipping on all orders</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
