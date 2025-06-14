
import React from 'react';
import { Star } from 'lucide-react';

interface Product {
  name: string;
  category: string;
  brand?: string;
  rating?: number;
  reviews?: number;
  price: number;
  originalPrice?: number;
}

interface ProductInfoProps {
  product: Product;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  return (
    <div className="mb-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground">{product.category}</p>
          {product.brand && (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          )}
        </div>
      </div>

      {/* Rating */}
      {product.rating && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating!) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.reviews || 0})
          </span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-primary">
          ₱{product.price.toLocaleString()}
        </span>
        {product.originalPrice && (
          <span className="text-lg text-muted-foreground line-through">
            ₱{product.originalPrice.toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
