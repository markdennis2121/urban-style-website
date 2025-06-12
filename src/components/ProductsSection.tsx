
import React from 'react';
import { products } from '../data/products';
import ProductCard from './ProductCard';

const ProductsSection = () => {
  const featuredProducts = products.slice(0, 6);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-2 text-foreground">Featured Products</h2>
        <p className="text-lg text-center text-muted-foreground mb-12">Summer Collection New Modern Design</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product, index) => (
            <div 
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
