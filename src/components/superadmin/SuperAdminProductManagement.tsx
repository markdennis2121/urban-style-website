
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { Package, Plus } from 'lucide-react';
import { Product } from '@/hooks/useAdminData';
import ProductTable from '@/components/admin/ProductTable';
import ProductForm from '@/components/admin/ProductForm';
import CollapsibleTable from '@/components/ui/collapsible-table';

interface SuperAdminProductManagementProps {
  products: Product[];
  loading: boolean;
  onProductDeleted: (id: string) => void;
  onProductCreated: () => void;
  onProductUpdated: () => void;
}

const SuperAdminProductManagement: React.FC<SuperAdminProductManagementProps> = ({
  products,
  loading,
  onProductDeleted,
  onProductCreated,
  onProductUpdated
}) => {
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          brand: productData.brand,
          price: productData.price,
          description: productData.description,
          category: productData.category,
          stock: productData.stock,
          image: productData.image || '/placeholder.svg',
          is_featured: productData.is_featured || false,
          is_new_arrival: productData.is_new_arrival || false
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Product updated successfully.",
      });

      setEditingProduct(null);
      onProductUpdated();
    } catch (err) {
      console.error('Error updating product:', err);
      toast({
        title: "Error",
        description: "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Product deleted successfully.",
      });

      onProductDeleted(id);
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  if (showForm && !editingProduct) {
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

  if (editingProduct) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
          <Button 
            variant="outline" 
            onClick={handleCancelEdit}
            className="rounded-lg"
          >
            Back to Products
          </Button>
        </div>
        <ProductForm
          product={editingProduct}
          onSubmit={handleUpdateProduct}
          onCancel={handleCancelEdit}
          loading={loading}
          isEditing={true}
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
            canEdit={true}
            canDelete={true}
            onEdit={handleEdit}
            onDelete={handleDeleteProduct}
            loading={loading}
          />
        </div>
      </CollapsibleTable>
    </div>
  );
};

export default SuperAdminProductManagement;
