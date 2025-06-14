
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Clock } from 'lucide-react';

const Footer = () => {
  const socialIcons = [
    { Icon: Facebook, href: 'https://www.facebook.com/markx.faulkerson/', label: 'Facebook' },
    { Icon: Twitter, href: '#', label: 'Twitter' },
    { Icon: Instagram, href: '#', label: 'Instagram' },
    { Icon: Youtube, href: '#', label: 'YouTube' },
  ];
  
  const aboutLinks = [
    { name: 'About us', href: '/about' },
    { name: 'Delivery Information', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms & Condition', href: '#' },
    { name: 'Contact Us', href: '/contact' }
  ];
  
  const accountLinks = [
    { name: 'Sign In', href: '#' },
    { name: 'View Cart', href: '/cart' },
    { name: 'My Wishlist', href: '#' },
    { name: 'Track My Order', href: '#' },
    { name: 'Help', href: '#' }
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top Section - Brand and Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <img src="/logo.png" alt="Urban Logo" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-2xl font-bold">Urban</h3>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed max-w-md">
              Modern e-commerce experience with quality products and exceptional service. Your trusted shopping destination.
            </p>
            
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Address</p>
                    <p className="text-sm font-medium">Canetown subd. Victoria City</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Phone</p>
                    <p className="text-sm font-medium">094602345678</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Hours</p>
                    <p className="text-sm font-medium">10:00 - 10:00, Mon - Sat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social & Apps Section */}
          <div className="space-y-8">
            {/* Social Media */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-white">Connect With Us</h4>
              <div className="flex space-x-4">
                {socialIcons.map(({ Icon, href, label }, index) => (
                  <a
                    key={index}
                    href={href}
                    aria-label={label}
                    className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* App Downloads */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Get Our App</h4>
              <p className="text-slate-300 mb-6">Download from App Store or Google Play</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" 
                   className="hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us"
                    alt="Download on the App Store"
                    className="h-14 rounded-lg"
                  />
                </a>
                <a href="https://play.google.com" target="_blank" rel="noopener noreferrer"
                   className="hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                    alt="Get it on Google Play"
                    className="h-14 rounded-lg"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* About Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Company</h4>
            <ul className="space-y-3">
              {aboutLinks.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Your Account</h4>
            <ul className="space-y-3">
              {accountLinks.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Security */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Secure Payments</h4>
            <p className="text-slate-300 mb-4">We use industry-standard encryption to protect your data</p>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" className="inline-block">
                <img 
                  src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" 
                  alt="PayPal Secure Payments" 
                  className="h-8 rounded bg-white/90 p-1"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-slate-400">© 2023 Urban - Modern E-commerce Website</p>
              <p className="text-slate-500 text-sm">Created by: Mark Dennis V. Manangan</p>
            </div>
            <div className="text-slate-400 text-sm">
              All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
