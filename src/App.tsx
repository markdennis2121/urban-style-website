
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import AdminDashboard from "./pages/admin/Dashboard";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import { WishlistProvider } from "./contexts/WishlistContext";
import Wishlist from "./pages/Wishlist";

// Aggressively block Firebase initialization from ALL sources
if (typeof window !== 'undefined') {
  // Block Firebase initialization attempts
  Object.defineProperty(window, 'firebase', {
    get: () => {
      console.warn('Firebase access blocked - using Supabase only');
      return undefined;
    },
    set: () => {
      console.warn('Firebase initialization blocked - using Supabase only');
      return false;
    },
    configurable: false,
    enumerable: false
  });
  
  // Block Firestore initialization
  Object.defineProperty(window, 'firestore', {
    get: () => {
      console.warn('Firestore access blocked - using Supabase only');
      return undefined;
    },
    set: () => {
      console.warn('Firestore initialization blocked - using Supabase only');
      return false;
    },
    configurable: false,
    enumerable: false
  });

  // Block other Firebase services
  const firebaseServices = [
    'FirebaseApp', 'FirebaseFirestore', 'FirebaseAuth', 
    'FirebaseStorage', 'FirebaseFunctions', 'FirebaseMessaging'
  ];
  
  firebaseServices.forEach(service => {
    Object.defineProperty(window, service, {
      get: () => {
        console.warn(`${service} access blocked - using Supabase only`);
        return undefined;
      },
      set: () => {
        console.warn(`${service} initialization blocked - using Supabase only`);
        return false;
      },
      configurable: false,
      enumerable: false
    });
  });

  // Override common Firebase initialization methods
  const blockFirebaseInit = () => {
    console.warn('Firebase initialization attempt blocked');
    return { app: null, firestore: null, auth: null };
  };

  Object.defineProperty(window, 'initializeApp', {
    value: blockFirebaseInit,
    configurable: false,
    writable: false
  });

  Object.defineProperty(window, 'getFirestore', {
    value: blockFirebaseInit,
    configurable: false,
    writable: false
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <Routes>
                {/* Auth Routes - These should be accessible without login */}
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/login" element={<UserLoginPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* All other routes require authentication */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shop"
                  element={
                    <ProtectedRoute>
                      <Shop />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/product/:id"
                  element={
                    <ProtectedRoute>
                      <ProductDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <ProtectedRoute>
                      <About />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/blog"
                  element={
                    <ProtectedRoute>
                      <Blog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <ProtectedRoute>
                      <Contact />
                    </ProtectedRoute>
                  }
                />
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

                {/* Wishlist Route */}
                <Route path="/wishlist" element={<Wishlist />} />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
            <Sonner />
          </WishlistProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
