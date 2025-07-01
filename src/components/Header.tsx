
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingBag, Menu, X, User, LogOut, Heart, LogIn } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAdminMode } from '../contexts/AdminModeContext';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ProfileSettings from './ProfileSettings';
import AdminModeToggle from './AdminModeToggle';
import GlobalSearch from './GlobalSearch';
import { products } from '@/data/products';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchItems, setSearchItems] = useState([]);
  const [searchLoaded, setSearchLoaded] = useState(false);
  
  const { state } = useCart();
  const { state: wishlistState } = useWishlist();
  const { canUseShoppingFeatures } = useAdminMode();
  const { isAuthenticated, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Memoize search data loading with proper error handling
  const loadSearchData = useCallback(async () => {
    if (searchLoaded) return;
    
    try {
      console.log('Loading search data...');
      const { data: dbProducts, error } = await supabase
        .from('products')
        .select('id, name, category, description, image, price')
        .gt('stock', 0)
        .limit(50);

      if (error) {
        console.error('Error fetching products for search:', error);
        // Don't throw, just use local products
      }

      const allProducts = [
        ...products.filter(p => p.inStock).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          type: 'product' as const,
          url: `/product/${p.id}`,
          image: p.image,
          price: p.price
        })),
        ...(dbProducts || []).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          type: 'product' as const,
          url: `/product/${p.id}`,
          image: p.image,
          price: p.price
        }))
      ];

      setSearchItems(allProducts);
      setSearchLoaded(true);
      console.log('Search data loaded successfully:', allProducts.length, 'items');
    } catch (error) {
      console.error('Error loading search data:', error);
      setSearchItems([]);
      setSearchLoaded(true);
    }
  }, [searchLoaded]);

  // Load search data only once when component mounts
  useEffect(() => {
    loadSearchData();
  }, [loadSearchData]);

  // Memoize navigation items
  const navItems = useMemo(() => [
    { name: 'Home', href: '/', isActive: location.pathname === '/' },
    { name: 'Shop', href: '/shop', isActive: location.pathname === '/shop' },
    { name: 'Blog', href: '/blog', isActive: location.pathname === '/blog' },
    { name: 'About', href: '/about', isActive: location.pathname === '/about' },
    { name: 'Contact', href: '/contact', isActive: location.pathname === '/contact' },
  ], [location.pathname]);

  // Optimized handlers with proper error handling
  const handleSearch = useCallback((term: string) => {
    try {
      if (term.trim()) {
        console.log('Searching for:', term);
        navigate(`/shop?search=${encodeURIComponent(term)}`);
      }
    } catch (error) {
      console.error('Error in search navigation:', error);
    }
  }, [navigate]);

  const handleAuthAction = useCallback(() => {
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return false;
    }
    return true;
  }, [isAuthenticated, navigate]);

  const handleCartClick = useCallback(() => {
    if (handleAuthAction()) {
      console.log('Navigating to cart');
      navigate('/cart');
    }
  }, [handleAuthAction, navigate]);

  const handleWishlistClick = useCallback(() => {
    if (handleAuthAction()) {
      console.log('Navigating to wishlist');
      navigate('/wishlist');
    }
  }, [handleAuthAction, navigate]);

  const handleLogout = useCallback(async () => {
    try {
      console.log('User logging out...');
      await supabase.auth.signOut();
      setIsMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  }, [navigate]);

  const handleProfileUpdate = useCallback(() => {
    setIsProfileOpen(false);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Loading state with consistent styling
  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="cursor-pointer transform hover:scale-105 transition-transform duration-300">
                <div className="w-[60px] h-[60px] rounded-lg flex items-center justify-center">
                  <img src="/favicon.png" alt="Urban Logo" className="w-full h-full object-contain" />
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex">
              <ul className="flex items-center justify-center">
                {navItems.map((item) => (
                  <li key={item.name} className="px-5 relative group">
                    <div className="w-16 h-6 bg-muted/30 rounded animate-pulse"></div>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-muted/30 animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="cursor-pointer transform hover:scale-105 transition-transform duration-300">
              <div className="w-[60px] h-[60px] rounded-lg flex items-center justify-center">
                <img src="/favicon.png" alt="Urban Logo" className="w-full h-full object-contain" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex items-center justify-center">
              {navItems.map((item) => (
                <li key={item.name} className="px-5 relative group">
                  <Link
                    className={`text-primary hover:text-muted-foreground transition-colors duration-200 relative ${
                      item.isActive ? 'font-bold' : ''
                    }`}
                    to={item.href}
                  >
                    {item.name}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
                        item.isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    ></span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            {/* Admin Mode Toggle - only show if authenticated and has admin access */}
            {isAuthenticated && (profile?.role === 'admin' || profile?.role === 'superadmin') && (
              <div className="hidden md:block">
                <AdminModeToggle />
              </div>
            )}

            {/* Search - Desktop only */}
            <div className="hidden md:block">
              <GlobalSearch
                placeholder="Search products..."
                className="w-48 lg:w-64"
                items={searchItems}
                onSearch={handleSearch}
              />
            </div>

            {/* Wishlist */}
            {canUseShoppingFeatures && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-xl hover:bg-muted/80 text-primary hover:text-muted-foreground"
                onClick={handleWishlistClick}
              >
                <Heart className="w-5 h-5" />
                {isAuthenticated && wishlistState.items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {wishlistState.items.length}
                  </span>
                )}
              </Button>
            )}

            {/* Cart */}
            {canUseShoppingFeatures && (
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl hover:bg-muted/80 text-primary hover:text-muted-foreground"
                onClick={handleCartClick}
              >
                <ShoppingBag className="w-5 h-5" />
                {isAuthenticated && state.itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {state.itemCount}
                  </span>
                )}
              </Button>
            )}

            {/* User Profile or Login */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-background border shadow-lg" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile?.username}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                      <DialogTrigger className="w-full">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile Settings</span>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <ProfileSettings 
                          currentUser={profile} 
                          onProfileUpdate={handleProfileUpdate}
                        />
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuItem>
                  {(profile?.role === 'admin' || profile?.role === 'superadmin') && (
                    <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  {profile?.role === 'superadmin' && (
                    <DropdownMenuItem onClick={() => navigate('/superadmin/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Super Admin</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm" className="rounded-xl">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-primary hover:text-muted-foreground transition-colors duration-200"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-md shadow-lg animate-fade-in border-b border-border/50 z-40">
            <nav className="py-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-5 py-3 text-primary hover:bg-muted/50 transition-colors ${
                    item.isActive ? 'font-bold bg-muted/30' : ''
                  }`}
                  onClick={handleMobileMenuClose}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Search */}
              <div className="px-5 py-3">
                <GlobalSearch
                  placeholder="Search products..."
                  className="w-full"
                  items={searchItems}
                  onSearch={(term) => {
                    handleSearch(term);
                    handleMobileMenuClose();
                  }}
                  showResults={false}
                />
              </div>

              {/* Mobile Admin Toggle */}
              {isAuthenticated && (profile?.role === 'admin' || profile?.role === 'superadmin') && (
                <div className="px-5 py-3 border-t border-border/30">
                  <AdminModeToggle />
                </div>
              )}
              
              {/* Mobile Auth */}
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-5 py-3 text-primary hover:bg-muted/50 transition-colors border-t border-border/30"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block px-5 py-3 text-primary hover:bg-muted/50 transition-colors border-t border-border/30"
                  onClick={handleMobileMenuClose}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
