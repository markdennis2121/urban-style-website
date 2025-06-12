
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-sm font-medium">Rated #1 Fashion Store</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Discover Your
                <span className="text-primary block">Perfect Style</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Shop the latest trends in fashion. From casual wear to formal attire, 
                find everything you need to express your unique style.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop">
                <Button size="lg" className="group hover:scale-105 transition-transform duration-200">
                  <ShoppingBag className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Shop Now
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="hover:scale-105 transition-transform duration-200">
                View Collection
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Brands</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop" 
                alt="Fashion Hero" 
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-white font-bold">NEW</span>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white rounded-lg p-4 shadow-lg animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <div className="text-sm font-semibold">Free Shipping</div>
                  <div className="text-xs text-muted-foreground">On orders over $50</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
