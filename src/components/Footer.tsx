
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const socialIcons = [
    { Icon: Facebook, href: 'https://www.facebook.com/markx.faulkerson/' },
    { Icon: Twitter, href: '#' },
    { Icon: Instagram, href: '#' },
    { Icon: Youtube, href: '#' },
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
    <footer className="py-20 bg-foreground text-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto px-4">
        <div>          <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-6">
            <img src="/favicon.png" alt="Urban Logo" className="w-full h-full object-contain" />
          </div>
          <h4 className="text-xl font-bold mb-6">Contact</h4>
          <p className="mb-3"><strong>Address: </strong> Canetown subd. Victoria City</p>
          <p className="mb-3"><strong>Phone:</strong> 094602345678</p>
          <p className="mb-6"><strong>Hours:</strong> 10:00 - 10:00, Mon - Sat</p>
          <div>
            <h4 className="text-xl font-bold mb-6">Follow us</h4>
            <div className="flex gap-4">
              {socialIcons.map(({ Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center hover:bg-primary transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div>          <h4 className="text-xl font-bold mb-6">About</h4>
          {aboutLinks.map((link, index) => (
            <div key={index}>
              {link.href.startsWith('/') ? (
                <Link
                  to={link.href}
                  className="block text-muted-foreground hover:text-background mb-3 transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  href={link.href}
                  className="block text-muted-foreground hover:text-background mb-3 transition-colors"
                >
                  {link.name}
                </a>
              )}
            </div>
          ))}
        </div>

        <div>          <h4 className="text-xl font-bold mb-6">My Account</h4>
          {accountLinks.map((link, index) => (
            <div key={index}>
              {link.href.startsWith('/') ? (
                <Link
                  to={link.href}
                  className="block text-muted-foreground hover:text-background mb-3 transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  href={link.href}
                  className="block text-muted-foreground hover:text-background mb-3 transition-colors"
                >
                  {link.name}
                </a>
              )}
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-xl font-bold mb-6">Install App</h4>
          <p className="mb-4">From App Store or Google Play</p>          <div className="flex gap-4 mb-6">
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-90 transition-opacity">
              <img 
                src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us"
                alt="Download on the App Store"
                className="h-12"
              />
            </a>
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-90 transition-opacity">
              <img 
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Get it on Google Play"
                className="h-12"
              />
            </a>
          </div><p className="mb-4">Secured Payment Gateways</p>
          <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" className="inline-block">
            <img 
              src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" 
              alt="PayPal Secure Payments" 
              className="h-8 rounded bg-white p-1"
            />
          </a>
        </div>
      </div>

      <div className="text-center mt-12 pt-8 border-t border-muted/20">
        <p className="text-muted-foreground">2023, Urban - Modern E-commerce Website</p>
        <p className="text-muted-foreground">Created by: Mark Dennis V. Manangan</p>
        <p className="text-muted-foreground">All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
