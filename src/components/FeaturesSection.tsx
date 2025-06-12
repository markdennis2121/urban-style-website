
import React from 'react';
import { Truck, ShoppingCart, DollarSign, Gift, Headphones } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Truck className="w-16 h-16 mx-auto mb-4 text-primary" />,
      title: "Free Shipping",
    },
    {
      icon: <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-primary" />,
      title: "Online Order",
    },
    {
      icon: <DollarSign className="w-16 h-16 mx-auto mb-4 text-primary" />,
      title: "Save Money",
    },
    {
      icon: <Gift className="w-16 h-16 mx-auto mb-4 text-primary" />,
      title: "Promotion",
    },
    {
      icon: <Headphones className="w-16 h-16 mx-auto mb-4 text-primary" />,
      title: "24/7 Support",
    },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 max-w-7xl mx-auto px-4">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-card p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {feature.icon}
            <h6 className="text-center font-semibold text-lg text-foreground">{feature.title}</h6>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
