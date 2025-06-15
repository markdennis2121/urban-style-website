
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const MobileOptimizedHero = () => {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Mobile-first background with responsive image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://www.camella.com.ph/wp-content/uploads/2022/04/Bacolod-City-Lacson-Tourism-Strip-Photo-from-SkyscraperCity-Bacolod-via-Facebook.jpg')"
        }}
      />
      
      {/* Gradient overlay - stronger on mobile for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 md:from-black/70 md:to-black/50" />
      
      {/* Content container - mobile-first responsive */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Mobile-optimized typography */}
        <div className="space-y-4 md:space-y-6">
          <h4 className="text-sm sm:text-base md:text-lg text-orange-400 font-medium tracking-wide uppercase animate-fade-in">
            Trade-in-offer
          </h4>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight animate-fade-in">
            Super value deals
          </h2>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in">
            On all products
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Save more with coupons & up to 70% off!
          </p>
          
          {/* Mobile-optimized CTA button */}
          <div className="pt-4 md:pt-8 animate-fade-in">
            <Link to="/shop">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 py-4 text-base sm:text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce md:hidden">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default MobileOptimizedHero;
