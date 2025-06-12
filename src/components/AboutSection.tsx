
import React from 'react';
import { CheckCircle } from 'lucide-react';

const AboutSection = () => {
  const features = [
    'Quality Materials',
    'Sustainable Practices',
    'Fast Shipping'
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative overflow-hidden rounded-xl shadow-lg">
            <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">U</span>
                </div>
                <p className="text-muted-foreground">About Image Placeholder</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Who We Are?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Urban is a premier fashion destination that brings together style, quality, and affordability. 
              Founded with a passion for contemporary fashion, we've grown to become a trusted name in the industry, 
              serving customers worldwide with our curated collection of clothing and accessories.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Our mission is to empower individuals to express their unique style through high-quality, 
              trend-setting fashion pieces. We believe that everyone deserves to look and feel their best, 
              which is why we offer a diverse range of products at competitive prices.
            </p>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-primary mr-3" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
