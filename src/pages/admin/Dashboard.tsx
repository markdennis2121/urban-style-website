
import React, { useState, useEffect } from 'react';
import { supabase, getCurrentProfile } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Package, Shield, Settings, Plus, Edit, Trash2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'T-Shirts',
    stock: '',
    image_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading admin dashboard data...');
      
      const profile = await getCurrentProfile();
      console.log('Current profile:', profile);
      setCurrentUser(profile);

      // Verify admin access
      if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
        console.error('Access denied - insufficient permissions');
        navigate('/admin/login');
        return;
      }

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Products fetch error:', productsError);
        throw productsError;
      }
      
      console.log('Products loaded:', productsData);
      setProducts(productsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Admin logging out...');
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const validateProductData = (productData) => {
    const errors = [];
    
    if (!productData.name?.trim()) errors.push('Product name is required');
    if (!productData.description?.trim()) errors.push('Description is required');
    if (!productData.price || parseFloat(productData.price) <= 0) errors.push('Valid price is required');
    if (!productData.category?.trim()) errors.push('Category is required');
    if (!productData.stock || parseInt(productData.stock) < 0) errors.push('Valid stock quantity is required');
    
    return errors;
  };

  const handleCreateProduct = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      console.log('Creating product with data:', newProduct);
      
      const validationErrors = validateProductData(newProduct);
      if (validationErrors.length > 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: validationErrors.join(', '),
        });
        return;
      }

      const productData = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price: parseFloat(newProduct.price),
        category: newProduct.category.trim(),
        stock: parseInt(newProduct.stock),
        image_url: newProduct.image_url.trim() || null
      };

      console.log('Inserting product data:', productData);

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (error) {
        console.error('Product creation error:', error);
        throw error;
      }

      console.log('Product created successfully:', data);

      toast({
        title: "Product Created",
        description: "Product has been created successfully.",
      });

      setShowCreateProduct(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: 'T-Shirts',
        stock: '',
        image_url: ''
      });
      await loadData();
    } catch (err) {
      console.error('Error creating product:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create product.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      console.log('Updating product:', selectedProduct?.id, 'with data:', newProduct);
      
      const validationErrors = validateProductData(newProduct);
      if (validationErrors.length > 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: validationErrors.join(', '),
        });
        return;
      }

      const productData = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        price: parseFloat(newProduct.price),
        category: newProduct.category.trim(),
        stock: parseInt(newProduct.stock),
        image_url: newProduct.image_url.trim() || null
      };

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', selectedProduct.id);

      if (error) {
        console.error('Product update error:', error);
        throw error;
      }

      toast({
        title: "Product Updated",
        description: "Product has been updated successfully.",
      });

      setShowEditProduct(false);
      setSelectedProduct(null);
      await loadData();
    } catch (err) {
      console.error('Error updating product:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update product.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      console.log('Deleting product:', productId);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Product deletion error:', error);
        throw error;
      }

      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });

      await loadData();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete product.",
      });
    }
  };

  const openEditDialog = (product) => {
    setSelectedProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image_url: product.image_url || ''
    });
    setShowEditProduct(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 ring-2 ring-purple-400/50">
                  <AvatarImage src={currentUser?.avatar_url} />
                  <AvatarFallback className="bg-purple-600 text-white">
                    {currentUser?.username?.charAt(0)?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-white">
                  {currentUser?.username}
                </span>
                <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                  {currentUser?.role}
                </Badge>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-900/50 border-red-500/50 text-red-200">
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-black/40 backdrop-blur-xl border-purple-500/20">
            <div className="flex items-center">
              <Package className="h-12 w-12 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Products</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-black/40 backdrop-blur-xl border-purple-500/20">
            <div className="flex items-center">
              <Settings className="h-12 w-12 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">In Stock</p>
                <p className="text-2xl font-bold text-white">
                  {products.filter(p => p.stock > 0).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-black/40 backdrop-blur-xl border-purple-500/20">
            <div className="flex items-center">
              <Shield className="h-12 w-12 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Admin Level</p>
                <p className="text-2xl font-bold text-white">Standard</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Product Management */}
        <Card className="p-6 bg-black/40 backdrop-blur-xl border-purple-500/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Product Management</h2>
            <Dialog open={showCreateProduct} onOpenChange={setShowCreateProduct}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-purple-500/30 text-white">
                <DialogHeader>
                  <DialogTitle className="text-purple-300">Create New Product</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Add a new product to your inventory.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right text-gray-300">Name</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                      placeholder="Product name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right text-gray-300">Description</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                      placeholder="Product description"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right text-gray-300">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                      className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right text-gray-300">Category</Label>
                    <Input
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                      className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                      placeholder="T-Shirts"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock" className="text-right text-gray-300">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                      className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="image_url" className="text-right text-gray-300">Image URL</Label>
                    <Input
                      id="image_url"
                      value={newProduct.image_url}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                      className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateProduct(false)} 
                    className="border-purple-500/30 text-purple-300"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateProduct} 
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create Product'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="rounded-lg border border-purple-500/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-purple-500/20 hover:bg-purple-900/20">
                  <TableHead className="text-purple-300">Image</TableHead>
                  <TableHead className="text-purple-300">Name</TableHead>
                  <TableHead className="text-purple-300">Category</TableHead>
                  <TableHead className="text-purple-300">Price</TableHead>
                  <TableHead className="text-purple-300">Stock</TableHead>
                  <TableHead className="text-purple-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="border-purple-500/20 hover:bg-purple-900/10">
                    <TableCell>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-purple-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-white">{product.name}</TableCell>
                    <TableCell>
                      <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">₱{product.price}</TableCell>
                    <TableCell>
                      <Badge className={product.stock < 10 ? "bg-red-600/20 text-red-300 border-red-500/30" : "bg-green-600/20 text-green-300 border-green-500/30"}>
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => openEditDialog(product)}
                          variant="outline"
                          size="sm"
                          className="border-blue-500/30 text-blue-300 hover:bg-blue-600/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-300 hover:bg-red-600/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                      No products found. Create your first product!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Edit Product Dialog */}
        <Dialog open={showEditProduct} onOpenChange={setShowEditProduct}>
          <DialogContent className="bg-slate-900 border-purple-500/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-purple-300">Edit Product</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update product information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right text-gray-300">Name</Label>
                <Input
                  id="edit-name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right text-gray-300">Description</Label>
                <Textarea
                  id="edit-description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right text-gray-300">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right text-gray-300">Category</Label>
                <Input
                  id="edit-category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right text-gray-300">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-image_url" className="text-right text-gray-300">Image URL</Label>
                <Input
                  id="edit-image_url"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowEditProduct(false)} 
                className="border-purple-500/30 text-purple-300"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditProduct} 
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Product'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
