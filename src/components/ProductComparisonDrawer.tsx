
import React from 'react';
import { X, Scale, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useProductComparison } from '@/contexts/ProductComparisonContext';
import LazyImage from '@/components/ui/LazyImage';
import { Link } from 'react-router-dom';

interface ProductComparisonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductComparisonDrawer: React.FC<ProductComparisonDrawerProps> = ({ isOpen, onClose }) => {
  const { compareList, removeFromCompare, clearCompare } = useProductComparison();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Product Comparison ({compareList.length}/3)</h3>
          </div>
          <div className="flex items-center gap-2">
            {compareList.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearCompare}>
                Clear All
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {compareList.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products to compare</h3>
              <p className="text-muted-foreground">Add products to comparison to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareList.map((product) => (
                <Card key={product.id} className="bg-card/60 backdrop-blur-md border border-border/50">
                  <CardContent className="p-4">
                    <div className="relative mb-4">
                      <LazyImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 w-6 h-6 p-0"
                        onClick={() => removeFromCompare(product.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Link to={`/product/${product.id}`} onClick={onClose}>
                        <h4 className="font-semibold hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                      </Link>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                        {product.brand && (
                          <Badge variant="secondary" className="text-xs">
                            {product.brand}
                          </Badge>
                        )}
                      </div>

                      <div className="text-xl font-bold text-primary">
                        ₱{product.price.toLocaleString()}
                      </div>

                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{product.rating}</span>
                        </div>
                      )}

                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductComparisonDrawer;
