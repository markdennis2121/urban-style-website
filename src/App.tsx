
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ProductComparisonProvider } from './contexts/ProductComparisonContext';
import { AdminModeProvider } from './contexts/AdminModeContext';
import ScrollToTop from './components/ScrollToTop';
import SecurityHeaders from './components/SecurityHeaders';
import ErrorBoundary from './components/ErrorBoundary';

// Pages - Lazy Loaded
const Index = lazy(() => import('./pages/Index'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const CheckoutSuccess = lazy(() => import('./pages/checkout/Success'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Blog = lazy(() => import('./pages/Blog'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages - Lazy Loaded
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/Dashboard'));

// Auth Pages - Lazy Loaded
const UserLoginPage = lazy(() => import('./components/auth/UserLoginPage'));
const AdminLoginPage = lazy(() => import('./components/auth/AdminLoginPage'));
const SuperAdminLoginPage = lazy(() => import('./components/auth/SuperAdminLoginPage'));
const SignUpPage = lazy(() => import('./components/auth/SignUpPage'));
const AuthCallback = lazy(() => import('./components/auth/AuthCallback'));
const PasswordResetPage = lazy(() => import('./components/auth/PasswordResetPage'));

import './App.css';

const queryClient = new QueryClient();

const FullPageLoader = () => (
  <div className="flex justify-center items-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AdminModeProvider>
          <CartProvider>
            <WishlistProvider>
              <ProductComparisonProvider>
                <Router>
                  <SecurityHeaders />
                  <ScrollToTop />
                  <div className="App">
                    <Suspense fallback={<FullPageLoader />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/checkout/success" element={<CheckoutSuccess />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/blog" element={<Blog />} />
                        
                        {/* Auth Routes */}
                        <Route path="/login" element={<UserLoginPage />} />
                        <Route path="/admin/login" element={<AdminLoginPage />} />
                        <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/reset-password" element={<PasswordResetPage />} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </div>
                  <Toaster />
                </Router>
              </ProductComparisonProvider>
            </WishlistProvider>
          </CartProvider>
        </AdminModeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
