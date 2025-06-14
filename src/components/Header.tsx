import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, User, LogOut, Heart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { supabase, getCurrentProfile } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProfileSettings from './ProfileSettings';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import GlobalSearch from './GlobalSearch';
import { products } from '@/data/products';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchItems, setSearchItems] = useState([]);
  const { state } = useCart();
  const { state: wishlistState } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadCurrentUser();
    loadSearchData();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const profile = await getCurrentProfile();
      setCurrentUser(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadSearchData = async () => {
    try {
      // Load products from database
      const { data: dbProducts } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0);

      // Combine static and database products
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
          image: p.image_url,
          price: p.price
        }))
      ];

      setSearchItems(allProducts);
    } catch (error) {
      console.error('Error loading search data:', error);
    }
  };

  const handleSearch = (term: string) => {
    if (term.trim()) {
      navigate(`/shop?search=${encodeURIComponent(term)}`);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('User logging out, role:', currentUser?.role);
      await supabase.auth.signOut();
      
      // Redirect based on user role
      switch (currentUser?.role) {
        case 'super_admin':
          navigate('/superadmin/login');
          break;
        case 'admin':
          navigate('/admin/login');
          break;
        default:
          navigate('/login');
          break;
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to general login page
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Home', href: '/', isActive: location.pathname === '/' },
    { name: 'Shop', href: '/shop', isActive: location.pathname === '/shop' },
    { name: 'Blog', href: '/blog', isActive: location.pathname === '/blog' },
    { name: 'About', href: '/about', isActive: location.pathname === '/about' },
    { name: 'Contact', href: '/contact', isActive: location.pathname === '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Logo */}
          <div className="flex items-center">
            <Link to="/" className="cursor-pointer transform hover:scale-105 transition-transform duration-300">
              <div className="w-[60px] h-[60px] rounded-lg flex items-center justify-center">
                <img src="/favicon.png" alt="Urban Logo" className="w-full h-full object-contain" />
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex">
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

          {/* Right side: Search, Wishlist, Cart, Profile */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <GlobalSearch
                placeholder="Search products..."
                className="w-64"
                items={searchItems}
                onSearch={handleSearch}
              />
            </div>

            {/* Wishlist */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-muted/80 text-primary hover:text-muted-foreground">
                <Heart className="w-5 h-5" />
                {wishlistState.items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {wishlistState.items.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart Icon */}
            <Link className="text-primary hover:text-muted-foreground transition-colors duration-200 relative" to="/cart">
              <div className="p-2 rounded-xl hover:bg-muted/80 transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {state.itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {state.itemCount}
                  </span>
                )}
              </div>
            </Link>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.username} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{currentUser?.username}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {currentUser?.email}
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
                        currentUser={currentUser} 
                        onProfileUpdate={(updatedProfile) => {
                          setCurrentUser(updatedProfile);
                          setIsProfileOpen(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </DropdownMenuItem>
                {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
                  <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                )}
                {currentUser?.role === 'super_admin' && (
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

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-primary hover:text-muted-foreground transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-md shadow-lg md:hidden animate-fade-in border-b border-border/50">
              <nav className="py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-5 py-3 text-primary hover:bg-muted/50 transition-colors ${
                      item.isActive ? 'font-bold bg-muted/30' : ''
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="px-5 py-3">
                  <GlobalSearch
                    placeholder="Search products..."
                    className="w-full"
                    items={searchItems}
                    onSearch={(term) => {
                      handleSearch(term);
                      setIsMobileMenuOpen(false);
                    }}
                    showResults={false}
                  />
                </div>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-5 py-3 text-primary hover:bg-muted/50 transition-colors"
                >
                  Logout
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
