
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { Product } from '@/hooks/useAdminData';
import ProductTable from '@/components/admin/ProductTable';
import ProductForm from '@/components/admin/ProductForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import CollapsibleTable from '@/components/ui/collapsible-table';

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
      <CollapsibleTable
        title="Product Management"
        icon={<Package className="h-5 w-5 text-white" />}
        itemCount={products.length}
        defaultExpanded={false}
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
          <ProductTable
            products={products}
            canEdit={false}
            canDelete={false}
            loading={loading}
          />
        </div>
      </CollapsibleTable>
    </div>
  );
};

export default ProductManagement;
