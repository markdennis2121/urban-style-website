
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import LoadingSpinner from '@/components/LoadingSpinner';

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        console.log('Verifying payment for session:', sessionId);
        
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId }
        });

        if (error) {
          throw error;
        }

        console.log('Payment verification result:', data);
        setPaymentDetails(data);
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <LoadingSpinner size="lg" message="Verifying your payment..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="text-red-600 text-xl mb-4">Payment Verification Failed</div>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Link to="/checkout">
                  <Button>Return to Checkout</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isPaymentSuccessful = paymentDetails.payment_status === 'paid';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <Card className={`border ${isPaymentSuccessful ? 'border-green-200' : 'border-yellow-200'}`}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {isPaymentSuccessful ? (
                  <CheckCircle className="h-16 w-16 text-green-600" />
                ) : (
                  <CreditCard className="h-16 w-16 text-yellow-600" />
                )}
              </div>
              <CardTitle className={`text-2xl ${isPaymentSuccessful ? 'text-green-700' : 'text-yellow-700'}`}>
                {isPaymentSuccessful ? 'Payment Successful!' : 'Payment Processing'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {isPaymentSuccessful 
                    ? 'Thank you for your purchase. Your order has been confirmed.'
                    : 'Your payment is being processed. Please check back in a few minutes.'
                  }
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Amount Paid:</span>
                  <span className="text-lg font-bold">
                    ₱{((paymentDetails.amount_total || 0) / 100).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Payment Method:</span>
                  <span>Credit/Debit Card</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Transaction ID:</span>
                  <span className="text-sm font-mono">{sessionId?.slice(-8)}</span>
                </div>
                
                {paymentDetails.customer_email && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Email:</span>
                    <span>{paymentDetails.customer_email}</span>
                  </div>
                )}
              </div>

              {isPaymentSuccessful && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">What's Next?</span>
                  </div>
                  <ul className="text-sm text-green-600 space-y-1 ml-8">
                    <li>• You'll receive a confirmation email shortly</li>
                    <li>• Your order will be processed within 1-2 business days</li>
                    <li>• We'll send you tracking information once shipped</li>
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link to="/" className="flex-1">
                  <Button className="w-full" variant="outline">
                    Continue Shopping
                  </Button>
                </Link>
                <Link to="/contact" className="flex-1">
                  <Button className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
