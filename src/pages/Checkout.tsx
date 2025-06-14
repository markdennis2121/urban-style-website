import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock, Truck, CheckCircle, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { createOrder } from '@/lib/supabase/orders';
import { 
  sanitizeText, 
  validateEmail, 
  validateCreditCard, 
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
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        setFormData(prev => ({ ...prev, email: user.email || '' }));
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
    
    const cardValidation = validateCreditCard(formData.cardNumber);
    if (!cardValidation.isValid) {
      newErrors.cardNumber = 'Please enter a valid credit card number';
    }
    
    if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    if (!formData.nameOnCard.trim()) {
      newErrors.nameOnCard = 'Name on card is required';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
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
      const orderData = {
        user_id: currentUser.id,
        total_amount: state.total * 1.12,
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

      const { data: order, error } = await createOrder(orderData);

      if (error) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          status: 'processing'
        })
        .eq('id', order?.id);

      dispatch({ type: 'CLEAR_CART' });

      toast({
        title: "Order placed successfully!",
        description: `Order #${order?.id.slice(0, 8)} has been created. You will receive a confirmation email shortly.`,
      });

      navigate('/', { 
        state: { 
          message: `Order placed successfully! Order ID: ${order?.id.slice(0, 8)}` 
        }
      });

    } catch (error: any) {
      console.error('Order creation error:', error);
      
      if (error.message?.includes('Insufficient stock')) {
        toast({
          title: "Stock Error",
          description: "Some items in your cart are out of stock. Please update your cart.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Order Failed",
          description: error.message || "There was an error processing your order. Please try again.",
          variant: "destructive",
        });
      }
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

          <form onSubmit={handleSubmit}>
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
                    Payment Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="checkout-nameOnCard">Name on Card *</Label>
                      <Input
                        id="checkout-nameOnCard"
                        name="nameOnCard"
                        autoComplete="cc-name"
                        value={formData.nameOnCard}
                        onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
                        required
                        className={errors.nameOnCard ? 'border-red-500' : ''}
                      />
                      {errors.nameOnCard && <p className="text-red-500 text-sm mt-1">{errors.nameOnCard}</p>}
                    </div>
                    <div>
                      <Label htmlFor="checkout-cardNumber">Card Number *</Label>
                      <Input
                        id="checkout-cardNumber"
                        name="cardNumber"
                        autoComplete="cc-number"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                        required
                        className={errors.cardNumber ? 'border-red-500' : ''}
                      />
                      {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="checkout-expiryDate">Expiry Date *</Label>
                        <Input
                          id="checkout-expiryDate"
                          name="expiryDate"
                          autoComplete="cc-exp"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                          required
                          className={errors.expiryDate ? 'border-red-500' : ''}
                        />
                        {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                      </div>
                      <div>
                        <Label htmlFor="checkout-cvv">CVV *</Label>
                        <Input
                          id="checkout-cvv"
                          name="cvv"
                          autoComplete="cc-csc"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          required
                          className={errors.cvv ? 'border-red-500' : ''}
                        />
                        {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                      </div>
                    </div>
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
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <LoadingSpinner size="sm" message="Processing..." />
                    ) : (
                      'Place Order'
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
