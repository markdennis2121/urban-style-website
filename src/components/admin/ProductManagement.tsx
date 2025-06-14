import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { Product } from '@/hooks/useAdminData';
import ProductTable from '@/components/admin/ProductTable';
import ProductForm from '@/components/admin/ProductForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';

interface ProductManagementProps {
  products: Product[];
  loading: boolean;
  onProductCreated: () => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  loading,
  onProductCreated
}) => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  const handleCreateProduct = async (productData: any) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          brand: productData.brand,
          price: productData.price,
          description: productData.description,
          category: productData.category,
          stock: productData.stock,
          image: productData.image || '/placeholder.svg',
          is_featured: productData.is_featured || false,
          is_new_arrival: productData.is_new_arrival || false
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Product created successfully.",
      });

      setShowForm(false);
      onProductCreated();
    } catch (err) {
      console.error('Error creating product:', err);
      toast({
        title: "Error",
        description: "Failed to create product.",
        variant: "destructive",
      });
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
          <Button 
            variant="outline" 
            onClick={() => setShowForm(false)}
            className="rounded-lg"
          >
            Back to Products
          </Button>
        </div>
        <ProductForm
          onSubmit={handleCreateProduct}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
              <div className="bg-green-500 p-2 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              Product Management ({products.length})
            </CardTitle>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ProductTable
            products={products}
            canEdit={false}
            canDelete={false}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagement;
