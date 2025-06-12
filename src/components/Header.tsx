
import React, { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { state } = useCart();
  const location = useLocation();

  const navItems = [
    { name: 'Home', href: '/', isActive: location.pathname === '/' },
    { name: 'Shop', href: '/shop', isActive: location.pathname === '/shop' },
    { name: 'Blog', href: '/blog', isActive: location.pathname === '/blog' },
    { name: 'About', href: '/about', isActive: location.pathname === '/about' },
    { name: 'Contact', href: '/contact', isActive: location.pathname === '/contact' },
  ];

  return (
    <header className="fixed top-0 right-0 w-full z-50 flex items-center justify-between px-5 py-4 bg-white/90 backdrop-blur-sm shadow-md">      <Link to="/" className="cursor-pointer transform hover:scale-105 transition-transform duration-300">
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
          <li className="px-5 relative group">
            <a
              className="text-primary hover:text-muted-foreground transition-colors duration-200 relative"
              href="#"
            >
              Logout
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </a>
          </li>
        </ul>
      </nav>

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
            <a href="#" className="block px-5 py-3 text-primary hover:bg-gray-50 transition-colors">
              Logout
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
