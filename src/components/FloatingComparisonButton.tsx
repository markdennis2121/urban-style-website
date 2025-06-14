
import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductComparison } from '@/contexts/ProductComparisonContext';
import ProductComparisonDrawer from './ProductComparisonDrawer';

const FloatingComparisonButton: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { compareList } = useProductComparison();

  if (compareList.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-primary hover:bg-primary/90 rounded-full shadow-lg w-14 h-14 relative"
          size="icon"
        >
          <Scale className="w-6 h-6" />
          <Badge 
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white border-white"
            variant="secondary"
          >
            {compareList.length}
          </Badge>
        </Button>
      </div>

      <ProductComparisonDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
};

export default FloatingComparisonButton;
