
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, User, LogOut, Heart, Search } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
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

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { state } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const profile = await getCurrentProfile();
      setCurrentUser(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
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
          <Link to="/" className="cursor-pointer transform hover:scale-105 transition-transform duration-300">
            <div className="w-[60px] h-[60px] rounded-lg flex items-center justify-center">
              <img src="/favicon.png" alt="Urban Logo" className="w-full h-full object-contain" />
            </div>
          </Link>

          {/* Desktop Navigation */}
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
              <li className="px-5 relative">
                <Link className="text-primary hover:text-muted-foreground transition-colors duration-200 relative" to="/cart">
                  <ShoppingBag className="w-5 h-5" />
                  {state.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {state.itemCount}
                    </span>
                  )}
                </Link>
              </li>
              <div className="inline-block w-px h-5 bg-border mx-2.5"></div>
              
              {/* User Profile Dropdown */}
              <li className="px-5">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.username} />
                        <AvatarFallback>
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
              </li>
            </ul>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-muted/80">
                <Heart className="w-5 h-5" />
              </Button>
            </Link>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-40 h-8 rounded-lg border border-border/50 px-3 py-2 focus:outline-none focus:border-primary"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* User Button */}
            <Link className="text-primary hover:text-muted-foreground transition-colors duration-200 relative" to="/cart">
              <ShoppingBag className="w-5 h-5" />
              {state.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {state.itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <Link className="text-primary hover:text-muted-foreground transition-colors duration-200 relative" to="/cart">
              <ShoppingBag className="w-5 h-5" />
              {state.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {state.itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-primary hover:text-muted-foreground transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden animate-fade-in">
              <nav className="py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-5 py-3 text-primary hover:bg-gray-50 transition-colors ${
                      item.isActive ? 'font-bold bg-gray-50' : ''
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-5 py-3 text-primary hover:bg-gray-50 transition-colors"
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
