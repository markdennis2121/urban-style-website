
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
import SafeRoute from './components/SafeRoute';

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

// Optimized React Query configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});

// Optimized loading component with hardware acceleration
const FullPageLoader = React.memo(() => (
  <div className="flex justify-center items-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary transform-gpu"></div>
  </div>
));

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
                    <Routes>
                      <Route path="/" element={<SafeRoute><Index /></SafeRoute>} />
                      <Route path="/shop" element={<SafeRoute><Shop /></SafeRoute>} />
                      <Route path="/product/:id" element={<SafeRoute><ProductDetail /></SafeRoute>} />
                      <Route path="/cart" element={<SafeRoute><Cart /></SafeRoute>} />
                      <Route path="/checkout" element={<SafeRoute><Checkout /></SafeRoute>} />
                      <Route path="/checkout/success" element={<SafeRoute><CheckoutSuccess /></SafeRoute>} />
                      <Route path="/wishlist" element={<SafeRoute><Wishlist /></SafeRoute>} />
                      <Route path="/about" element={<SafeRoute><About /></SafeRoute>} />
                      <Route path="/contact" element={<SafeRoute><Contact /></SafeRoute>} />
                      <Route path="/blog" element={<SafeRoute><Blog /></SafeRoute>} />
                      
                      {/* Auth Routes */}
                      <Route path="/login" element={<SafeRoute><UserLoginPage /></SafeRoute>} />
                      <Route path="/admin/login" element={<SafeRoute><AdminLoginPage /></SafeRoute>} />
                      <Route path="/superadmin/login" element={<SafeRoute><SuperAdminLoginPage /></SafeRoute>} />
                      <Route path="/signup" element={<SafeRoute><SignUpPage /></SafeRoute>} />
                      <Route path="/auth/callback" element={<SafeRoute><AuthCallback /></SafeRoute>} />
                      <Route path="/reset-password" element={<SafeRoute><PasswordResetPage /></SafeRoute>} />
                      
                      {/* Admin Routes */}
                      <Route path="/admin/dashboard" element={<SafeRoute><AdminDashboard /></SafeRoute>} />
                      <Route path="/superadmin/dashboard" element={<SafeRoute><SuperAdminDashboard /></SafeRoute>} />
                      
                      <Route path="*" element={<SafeRoute><NotFound /></SafeRoute>} />
                    </Routes>
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
