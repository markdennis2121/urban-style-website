import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
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
import SuperAdminDashboard from "./pages/superadmin/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth Routes */}
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<UserLoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected User Routes */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={["user", "admin", "super_admin"]}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={["user", "admin", "super_admin"]}>
                  <Checkout />
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
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
