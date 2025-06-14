
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { PlusCircle, Package, Trash2 } from 'lucide-react';
import { Product } from '@/hooks/useAdminData';

interface ProductManagementProps {
  products: Product[];
  loading: boolean;
  onProductDeleted: (id: string) => void;
  onProductCreated: () => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  loading,
  onProductDeleted,
  onProductCreated
}) => {
  const { toast } = useToast();
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    image: ''
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productForm.name,
          brand: productForm.brand,
          price: parseFloat(productForm.price),
          description: productForm.description,
          category: productForm.category,
          stock: parseInt(productForm.stock),
          image: productForm.image || '/placeholder.svg'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Product created successfully.",
      });

      setProductForm({
        name: '',
        brand: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        image: ''
      });

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

  return (
    <div className="space-y-8">
      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
            <div className="bg-green-500 p-2 rounded-lg">
              <PlusCircle className="h-5 w-5 text-white" />
            </div>
            Add New Product
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleCreateProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="mt-1 rounded-lg border-gray-300"
                  required
                />
              </div>
              <div>
                <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Brand</Label>
                <Input
                  id="brand"
                  value={productForm.brand}
                  onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                  className="mt-1 rounded-lg border-gray-300"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  className="mt-1 rounded-lg border-gray-300"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                  className="mt-1 rounded-lg border-gray-300"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
                <Select onValueChange={(value) => setProductForm({...productForm, category: value})}>
                  <SelectTrigger className="mt-1 rounded-lg border-gray-300">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="home">Home & Garden</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image" className="text-sm font-medium text-gray-700">Image URL</Label>
                <Input
                  id="image"
                  value={productForm.image}
                  onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                  className="mt-1 rounded-lg border-gray-300"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                className="mt-1 rounded-lg border-gray-300"
                rows={3}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 rounded-lg py-3 font-medium">
              {loading ? 'Adding Product...' : 'Add Product'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
            <div className="bg-green-500 p-2 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            Product Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {products.length > 0 ? products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg border border-gray-300" />
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">₱{product.price}</Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">Stock: {product.stock}</Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onProductDeleted(product.id)}
                  className="rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagement;
