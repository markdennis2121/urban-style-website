
import React from 'react';
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

// Pages
import Index from './pages/Index';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/checkout/Success';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import SuperAdminDashboard from './pages/superadmin/Dashboard';

// Auth Pages
import UserLoginPage from './components/auth/UserLoginPage';
import AdminLoginPage from './components/auth/AdminLoginPage';
import SuperAdminLoginPage from './components/auth/SuperAdminLoginPage';
import SignUpPage from './components/auth/SignUpPage';
import AuthCallback from './components/auth/AuthCallback';
import PasswordResetPage from './components/auth/PasswordResetPage';

import './App.css';

const queryClient = new QueryClient();

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
