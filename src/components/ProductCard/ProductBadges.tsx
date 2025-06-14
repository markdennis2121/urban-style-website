
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';

interface Product {
  isNew?: boolean;
  isSale?: boolean;
  inStock?: boolean;
}

interface ProductBadgesProps {
  product: Product;
}

const ProductBadges: React.FC<ProductBadgesProps> = ({ product }) => {
  return (
    <div className="absolute top-3 left-3 flex flex-col gap-2">
      {product.isNew && (
        <Badge className="bg-green-500/90 hover:bg-green-500 text-white backdrop-blur-sm">
          NEW
        </Badge>
      )}
      {product.isSale && (
        <Badge className="bg-red-500/90 hover:bg-red-500 text-white backdrop-blur-sm">
          SALE
        </Badge>
      )}
      {!product.inStock && (
        <Badge variant="secondary" className="bg-gray-500/90 text-white backdrop-blur-sm">
          <Package className="w-3 h-3 mr-1" />
          OUT OF STOCK
        </Badge>
      )}
    </div>
  );
};

export default ProductBadges;
