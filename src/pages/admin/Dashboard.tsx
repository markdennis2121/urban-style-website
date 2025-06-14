
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Package, Users, MessageSquare, Plus, LogOut, Shield, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const predefinedCategories = [
  'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags', 'Jewelry'
];

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    stock: '',
    is_featured: false,
    is_new_arrival: false
  });

  useEffect(() => {
    loadProducts();
    loadUsers();
    loadAdmins();
    loadMessages();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (err) {
      console.error('Error loading admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          image_url: newProduct.image_url,
          stock: parseInt(newProduct.stock),
          is_featured: newProduct.is_featured,
          is_new_arrival: newProduct.is_new_arrival
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Product added successfully.",
      });

      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        stock: '',
        is_featured: false,
        is_new_arrival: false
      });

      loadProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFeature = async (productId: string, field: 'is_featured' | 'is_new_arrival', currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ [field]: !currentValue })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Product ${field === 'is_featured' ? 'featured status' : 'new arrival status'} updated.`,
      });

      loadProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Stock updated successfully.",
      });

      loadProducts();
    } catch (err) {
      console.error('Error updating stock:', err);
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
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

      loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Manage your e-commerce platform</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground border-border rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:shadow-lg transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold text-foreground">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:shadow-lg transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold text-foreground">{admins.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20 hover:shadow-lg transition-all duration-300 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-full">
                  <MessageSquare className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Messages</p>
                  <p className="text-2xl font-bold text-foreground">{messages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-2xl">
            <TabsTrigger value="products" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-xl">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-xl">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-xl">
              <Shield className="w-4 h-4" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-xl">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Plus className="w-5 h-5" />
                  Add New Product
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="bg-background/80 border-border"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price (₱)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="bg-background/80 border-border"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                      <SelectTrigger className="bg-background/80 border-border">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {predefinedCategories.map(category => (
                          <SelectItem key={category} value={category} className="hover:bg-muted">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      className="bg-background/80 border-border"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={newProduct.image_url}
                      onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                      className="bg-background/80 border-border"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      className="bg-background/80 border-border"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={newProduct.is_featured}
                        onChange={(e) => setNewProduct({...newProduct, is_featured: e.target.checked})}
                        className="rounded border-border"
                      />
                      <Label htmlFor="is_featured">Featured Product</Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_new_arrival"
                        checked={newProduct.is_new_arrival}
                        onChange={(e) => setNewProduct({...newProduct, is_new_arrival: e.target.checked})}
                        className="rounded border-border"
                      />
                      <Label htmlFor="is_new_arrival">New Arrival</Label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                      Add Product
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Products List */}
            <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground">Products ({products.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-background/50 border border-border rounded-lg p-4 hover:shadow-md transition-all duration-300">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-md mb-3"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-primary">₱{product.price}</span>
                        <Badge variant="outline" className="border-border">
                          {product.category}
                        </Badge>
                      </div>
                      
                      {/* Stock Management */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-muted-foreground">Stock:</span>
                        <Input
                          type="number"
                          value={product.stock}
                          onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value))}
                          className="w-20 h-8 text-sm"
                          min="0"
                        />
                        {product.stock === 0 && (
                          <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                        )}
                      </div>

                      {/* Feature Toggles */}
                      <div className="flex gap-2 mb-3">
                        <Button
                          variant={product.is_featured ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleFeature(product.id, 'is_featured', product.is_featured)}
                          className="text-xs"
                        >
                          {product.is_featured ? '★ Featured' : '☆ Feature'}
                        </Button>
                        <Button
                          variant={product.is_new_arrival ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleFeature(product.id, 'is_new_arrival', product.is_new_arrival)}
                          className="text-xs"
                        >
                          {product.is_new_arrival ? '🆕 New' : 'Mark New'}
                        </Button>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg rounded-2xl">
              <CardHeader className="border-b border-border rounded-t-2xl">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Regular Users ({users.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user) => (
                    <div key={user.id} className="bg-background/50 border border-border rounded-xl p-4 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{user.full_name || 'No name'}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Role: <Badge variant="outline" className="ml-1 border-border">user</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins">
            <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg rounded-2xl">
              <CardHeader className="border-b border-border rounded-t-2xl">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admin Accounts ({admins.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="bg-background/50 border border-border rounded-xl p-4 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          admin.role === 'super_admin' ? 'bg-red-500/10' : 'bg-green-500/10'
                        }`}>
                          <Shield className={`w-5 h-5 ${
                            admin.role === 'super_admin' ? 'text-red-500' : 'text-green-500'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{admin.full_name || 'No name'}</h3>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Role: <Badge 
                          variant={admin.role === 'super_admin' ? 'destructive' : 'default'} 
                          className="ml-1"
                        >
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground">Contact Messages ({messages.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div key={message.id} className="bg-background/50 border border-border rounded-lg p-4 hover:shadow-md transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-foreground">{message.subject}</h3>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          From: {message.name} ({message.email})
                        </p>
                        <p className="text-sm text-foreground">{message.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No messages yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
