
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  brand?: string;
  rating?: number;
  description?: string;
}

interface ProductComparisonContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  canAddToCompare: boolean;
}

const ProductComparisonContext = createContext<ProductComparisonContextType | undefined>(undefined);

export const ProductComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const { toast } = useToast();
  const maxCompareItems = 3;

  useEffect(() => {
    const stored = localStorage.getItem('product-comparison');
    if (stored) {
      try {
        setCompareList(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading comparison list:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('product-comparison', JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (product: Product) => {
    if (compareList.length >= maxCompareItems) {
      toast({
        title: "Comparison limit reached",
        description: `You can only compare up to ${maxCompareItems} products at once.`,
        variant: "destructive"
      });
      return;
    }

    if (isInCompare(product.id)) {
      toast({
        title: "Already in comparison",
        description: "This product is already in your comparison list.",
        variant: "destructive"
      });
      return;
    }

    setCompareList(prev => [...prev, product]);
    toast({
      title: "Added to comparison",
      description: `${product.name} has been added to comparison.`,
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareList(prev => prev.filter(item => item.id !== productId));
    toast({
      title: "Removed from comparison",
      description: "Product has been removed from comparison.",
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    toast({
      title: "Comparison cleared",
      description: "All products have been removed from comparison.",
    });
  };

  const isInCompare = (productId: string) => {
    return compareList.some(item => item.id === productId);
  };

  const canAddToCompare = compareList.length < maxCompareItems;

  return (
    <ProductComparisonContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      canAddToCompare
    }}>
      {children}
    </ProductComparisonContext.Provider>
  );
};

export const useProductComparison = () => {
  const context = useContext(ProductComparisonContext);
  if (context === undefined) {
    throw new Error('useProductComparison must be used within a ProductComparisonProvider');
  }
  return context;
};
