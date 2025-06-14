import React, { useState, useEffect } from 'react';
import { supabase, getCurrentProfile } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload,
  LogOut,
  User,
  Users,
  BarChart3,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Shield,
  Activity,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalValue: 0,
    activeUsers: 0
  });

  const navigate = useNavigate();

  const categories = [
    'T-Shirts',
    'Shirts', 
    'Pants',
    'Dresses',
    'Shoes',
    'Accessories',
    'Jackets',
    'Hoodies',
    'Shorts',
    'Skirts'
  ];

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image_url: ''
  });

  useEffect(() => {
    loadProfile();
    loadProducts();
    loadUsers();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getCurrentProfile();
      if (!profile || profile.role !== 'super_admin') {
        navigate('/superadmin/login');
        return;
      }
      setCurrentUser(profile);
    } catch (err) {
      console.error('Error loading profile:', err);
      navigate('/superadmin/login');
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    }
  };

  const loadStats = async () => {
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('price, stock');

      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at');

      if (productsError) throw productsError;
      if (usersError) throw usersError;

      const totalProducts = products.length;
      const totalUsers = users.length;
      const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * p.stock), 0);
      const activeUsers = users.filter(u => {
        const createdAt = new Date(u.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt > thirtyDaysAgo;
      }).length;

      setStats({
        totalProducts,
        totalUsers,
        totalValue,
        activeUsers
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          category: newProduct.category,
          stock: parseInt(newProduct.stock),
          image_url: newProduct.image_url
        }]);

      if (error) throw error;

      setSuccess('Product added successfully!');
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image_url: ''
      });
      setShowAddProduct(false);
      loadProducts();
      loadStats();
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('products')
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: parseFloat(editingProduct.price),
          category: editingProduct.category,
          stock: parseInt(editingProduct.stock),
          image_url: editingProduct.image_url
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      setSuccess('Product updated successfully!');
      setEditingProduct(null);
      loadProducts();
      loadStats();
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setSuccess('Product deleted successfully!');
      loadProducts();
      loadStats();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setSuccess('User role updated successfully!');
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      setSuccess('User deleted successfully!');
      loadUsers();
      loadStats();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/superadmin/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
                <p className="text-white/70">Welcome back, {currentUser?.username || currentUser?.email}</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/20 text-red-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-500/10 border-green-500/20 text-green-300">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Users</CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₱{stats.totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-md border-white/20">
            <TabsTrigger value="products" className="data-[state=active]:bg-white/20 text-white">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white/20 text-white">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20 text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Product Management</CardTitle>
                    <CardDescription className="text-white/70">
                      Manage your product inventory
                    </CardDescription>
                  </div>
                  <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-white/20 text-white">
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription className="text-white/70">
                          Create a new product in your inventory
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddProduct} className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-white">Product Name</Label>
                          <Input
                            id="name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            className="bg-white/10 border-white/20 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description" className="text-white">Description</Label>
                          <Textarea
                            id="description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="category" className="text-white">Category</Label>
                          <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/20">
                              {categories.map(category => (
                                <SelectItem key={category} value={category} className="text-white hover:bg-white/10">
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price" className="text-white">Price (₱)</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                              className="bg-white/10 border-white/20 text-white"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="stock" className="text-white">Stock</Label>
                            <Input
                              id="stock"
                              type="number"
                              value={newProduct.stock}
                              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                              className="bg-white/10 border-white/20 text-white"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="image_url" className="text-white">Image URL</Label>
                          <Input
                            id="image_url"
                            value={newProduct.image_url}
                            onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Product'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-4">
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
                          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-white/50" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-white">{product.name}</h3>
                          <p className="text-sm text-white/70">{product.category}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                              ₱{product.price}
                            </Badge>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                              Stock: {product.stock}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProduct(product)}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
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

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-white/70">
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{user.username || user.email}</h3>
                          <p className="text-sm text-white/70">{user.email}</p>
                          <Badge 
                            variant="secondary" 
                            className={`mt-1 ${
                              user.role === 'super_admin' ? 'bg-red-500/20 text-red-300' :
                              user.role === 'admin' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select value={user.role} onValueChange={(value) => handleUpdateUserRole(user.id, value)}>
                          <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-white/20">
                            <SelectItem value="user" className="text-white hover:bg-white/10">User</SelectItem>
                            <SelectItem value="admin" className="text-white hover:bg-white/10">Admin</SelectItem>
                            <SelectItem value="super_admin" className="text-white hover:bg-white/10">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
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

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">System Overview</CardTitle>
                  <CardDescription className="text-white/70">Key metrics and statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Active Sessions</span>
                    <Badge className="bg-green-500/20 text-green-300">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Database Status</span>
                    <Badge className="bg-green-500/20 text-green-300">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">Last Backup</span>
                    <span className="text-white text-sm">2 hours ago</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-white/70">Latest system events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-white text-sm">New user registered</p>
                      <p className="text-white/50 text-xs">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Package className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-white text-sm">Product updated</p>
                      <p className="text-white/50 text-xs">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-white text-sm">User role changed</p>
                      <p className="text-white/50 text-xs">1 hour ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Product Dialog */}
        {editingProduct && (
          <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent className="bg-slate-800 border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription className="text-white/70">
                  Update product information
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="text-white">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description" className="text-white">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category" className="text-white">Category</Label>
                  <Select value={editingProduct.category} onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      {categories.map(category => (
                        <SelectItem key={category} value={category} className="text-white hover:bg-white/10">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-price" className="text-white">Price (₱)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-stock" className="text-white">Stock</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-image_url" className="text-white">Image URL</Label>
                  <Input
                    id="edit-image_url"
                    value={editingProduct.image_url}
                    onChange={(e) => setEditingProduct({...editingProduct, image_url: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Product'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
