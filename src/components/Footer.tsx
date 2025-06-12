
import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const socialIcons = [
    { Icon: Facebook, href: '#' },
    { Icon: Twitter, href: '#' },
    { Icon: Instagram, href: '#' },
    { Icon: Youtube, href: '#' },
  ];

  const aboutLinks = [
    'About us',
    'Delivery Information',
    'Privacy Policy',
    'Terms & Condition',
    'Contact Us'
  ];

  const accountLinks = [
    'Sign IN',
    'View Cart',
    'My Wishlist',
    'Track My Order',
    'Help'
  ];

  return (
    <footer className="py-20 bg-foreground text-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto px-4">
        <div>
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-6">
            <span className="text-white font-bold text-xl">U</span>
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

        <div>
          <h4 className="text-xl font-bold mb-6">About</h4>
          {aboutLinks.map((link, index) => (
            <a
              key={index}
              href="#"
              className="block text-muted-foreground hover:text-background mb-3 transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        <div>
          <h4 className="text-xl font-bold mb-6">My Account</h4>
          {accountLinks.map((link, index) => (
            <a
              key={index}
              href="#"
              className="block text-muted-foreground hover:text-background mb-3 transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        <div>
          <h4 className="text-xl font-bold mb-6">Install App</h4>
          <p className="mb-4">From App Store or Google Play</p>
          <div className="flex gap-4 mb-6">
            <div className="w-32 h-12 bg-muted/20 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer">
              <span className="text-sm">App Store</span>
            </div>
            <div className="w-32 h-12 bg-muted/20 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer">
              <span className="text-sm">Google Play</span>
            </div>
          </div>
          <p className="mb-4">Secured Payment Gateways</p>
          <div className="w-40 h-8 bg-muted/20 rounded flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer">
            <span className="text-sm">PayPal</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 pt-8 border-t border-muted/20">
        <p className="text-muted-foreground">2023, Urban Fashion - Modern E-commerce Website</p>
      </div>
    </footer>
  );
};

export default Footer;
