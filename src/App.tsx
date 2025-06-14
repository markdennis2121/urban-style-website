
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AdminModeProvider } from "./contexts/AdminModeContext";
import { ProductComparisonProvider } from './contexts/ProductComparisonContext';
import SecurityHeaders from "./components/SecurityHeaders";
import ErrorBoundary from "./components/ErrorBoundary";
import FloatingComparisonButton from "./components/FloatingComparisonButton";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import UserLoginPage from "./components/auth/UserLoginPage";
import AdminLoginPage from "./components/auth/AdminLoginPage";
import SuperAdminLoginPage from "./components/auth/SuperAdminLoginPage";
import SignUpPage from "./components/auth/SignUpPage";
import AuthCallback from "./components/auth/AuthCallback";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import Wishlist from "./pages/Wishlist";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AdminModeProvider>
            <CartProvider>
              <WishlistProvider>
                <ProductComparisonProvider>
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <Toaster />
                    <Sonner />
                    <SecurityHeaders />
                    <ErrorBoundary>
                      <Routes>
                        {/* Auth Routes */}
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/login" element={<UserLoginPage />} />
                        <Route path="/admin/login" element={<AdminLoginPage />} />
                        <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* Public browsing routes - no authentication required */}
                        <Route path="/" element={<Index />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/contact" element={<Contact />} />

                        {/* Protected shopping routes - require authentication */}
                        <Route
                          path="/cart"
                          element={
                            <ProtectedRoute>
                              <Cart />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute>
                              <Checkout />
                            </ProtectedRoute>
                          }
                        />
                        <Route 
                          path="/wishlist" 
                          element={
                            <ProtectedRoute>
                              <Wishlist />
                            </ProtectedRoute>
                          } 
                        />

                        {/* Protected Admin Routes */}
                        <Route
                          path="/admin/dashboard"
                          element={
                            <ProtectedRoute requiredRole="admin">
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />

                        {/* Protected Super Admin Routes */}
                        <Route
                          path="/superadmin/dashboard"
                          element={
                            <ProtectedRoute requiredRole="super_admin">
                              <SuperAdminDashboard />
                            </ProtectedRoute>
                          }
                        />

                        {/* 404 Route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <FloatingComparisonButton />
                    </ErrorBoundary>
                  </div>
                </ProductComparisonProvider>
              </WishlistProvider>
            </CartProvider>
          </AdminModeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
