
import React, { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = 0;

  const navItems = [
    { name: 'Home', href: '#', isActive: false },
    { name: 'Shop', href: '#', isActive: false },
    { name: 'Blog', href: '#', isActive: false },
    { name: 'About', href: '#', isActive: true },
    { name: 'Contact', href: '#', isActive: false },
  ];

  return (
    <header className="fixed top-0 right-0 w-full z-50 flex items-center justify-between px-5 py-4 bg-white/90 backdrop-blur-sm shadow-md">
      <div className="cursor-pointer transform hover:scale-105 transition-transform duration-300">
        <div className="w-[60px] h-[60px] bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xl">U</span>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex">
        <ul className="flex items-center justify-center">
          {navItems.map((item) => (
            <li key={item.name} className="px-5 relative group">
              <a
                className={`text-primary hover:text-muted-foreground transition-colors duration-200 relative ${
                  item.isActive ? 'font-bold' : ''
                }`}
                href={item.href}
              >
                {item.name}
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${
                    item.isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </a>
            </li>
          ))}
          <li className="px-5 relative">
            <a className="text-primary hover:text-muted-foreground transition-colors duration-200 relative" href="#">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
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
        <a className="text-primary hover:text-muted-foreground transition-colors duration-200" href="#">
          <ShoppingBag className="w-5 h-5" />
        </a>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-primary hover:text-muted-foreground transition-colors duration-200"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden">
          <nav className="py-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`block px-5 py-3 text-primary hover:bg-gray-50 transition-colors ${
                  item.isActive ? 'font-bold bg-gray-50' : ''
                }`}
              >
                {item.name}
              </a>
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
