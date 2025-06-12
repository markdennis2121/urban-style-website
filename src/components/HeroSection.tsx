
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section 
      className="bg-cover bg-center h-[90vh] w-full flex flex-col items-center justify-center text-center px-4 relative mt-16"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop')"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <h4 className="text-lg text-white mb-2 animate-fade-in">Trade-in-offer</h4>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 animate-fade-in">Super value deals</h2>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in">On all products</h1>
        <p className="text-lg text-white mb-8 animate-fade-in">Save more with coupons & up to 70% off!</p>
        <div className="animate-fade-in">
          <Link to="/shop">
            <Button size="lg" className="px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform duration-300">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
