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
import { 
  Crown, Shield, Users, Package, Settings, Plus, Edit, Trash2, LogOut, 
  Eye, UserX, Activity, BarChart3, Calendar, Clock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({
    totalUsers: 0,
    totalProducts: 0,
    activeUsers: 0,
    totalRevenue: 0
  });

  // Dialog states
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  
  // Form states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
    role: 'user'
  });

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
      console.log('Loading super admin dashboard data...');
      
      const profile = await getCurrentProfile();
      console.log('Current profile:', profile);
      setCurrentUser(profile);

      // Verify super admin access
      if (!profile || profile.role !== 'super_admin') {
        console.error('Access denied - insufficient permissions');
        navigate('/superadmin/login');
        return;
      }

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Users fetch error:', usersError);
      } else {
        setUsers(usersData || []);
      }

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Products fetch error:', productsError);
      } else {
        setProducts(productsData || []);
      }

      // Calculate metrics
      setSystemMetrics({
        totalUsers: usersData?.length || 0,
        totalProducts: productsData?.length || 0,
        activeUsers: usersData?.filter(u => u.role !== 'inactive').length || 0,
        totalRevenue: productsData?.reduce((sum, p) => sum + (p.price * (100 - p.stock)), 0) || 0
      });

      // Mock audit logs
      setAuditLogs([
        { id: 1, action: 'User Login', user: 'admin@example.com', timestamp: new Date().toISOString(), details: 'Successful login' },
        { id: 2, action: 'Product Created', user: 'admin@example.com', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Created new T-shirt product' },
        { id: 3, action: 'User Role Changed', user: 'superadmin@example.com', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Changed user role to admin' }
      ]);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Super admin logging out...');
      await supabase.auth.signOut();
      navigate('/superadmin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const validateUserData = (userData) => {
    const errors = [];
    
    if (!userData.email?.trim()) errors.push('Email is required');
    if (!userData.username?.trim()) errors.push('Username is required');
    if (!userData.full_name?.trim()) errors.push('Full name is required');
    if (!userData.role?.trim()) errors.push('Role is required');
    if (!selectedUser && !userData.password?.trim()) errors.push('Password is required');
    
    return errors;
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

  const handleCreateUser = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      console.log('Creating user with data:', newUser);
      
      const validationErrors = validateUserData(newUser);
      if (validationErrors.length > 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: validationErrors.join(', '),
        });
        return;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            username: newUser.username,
            full_name: newUser.full_name,
            role: newUser.role
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      toast({
        title: "User Created",
        description: "User has been created successfully.",
      });

      setShowCreateUser(false);
      setNewUser({
        email: '',
        password: '',
        username: '',
        full_name: '',
        role: 'user'
      });
      await loadData();
    } catch (err) {
      console.error('Error creating user:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to create user.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      console.log('Updating user:', selectedUser?.id, 'with data:', newUser);
      
      const validationErrors = validateUserData(newUser);
      if (validationErrors.length > 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: validationErrors.join(', '),
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: newUser.username,
          full_name: newUser.full_name,
          role: newUser.role
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
      });

      setShowEditUser(false);
      setSelectedUser(null);
      await loadData();
    } catch (err) {
      console.error('Error updating user:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update user.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      console.log('Deleting user:', userId);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });

      await loadData();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete user.",
      });
    }
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

      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) throw error;

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

      if (error) throw error;

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

      if (error) throw error;

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

  const openEditUserDialog = (user) => {
    setSelectedUser(user);
    setNewUser({
      email: user.email,
      password: '',
      username: user.username || '',
      full_name: user.full_name || '',
      role: user.role
    });
    setShowEditUser(true);
  };

  const openEditProductDialog = (product) => {
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
              <Crown className="h-8 w-8 text-amber-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
                Super Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 ring-2 ring-amber-400/50">
                  <AvatarImage src={currentUser?.avatar_url} />
                  <AvatarFallback className="bg-amber-600 text-white">
                    {currentUser?.username?.charAt(0)?.toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-white">
                  {currentUser?.username}
                </span>
                <Badge className="bg-amber-600/20 text-amber-300 border-amber-500/30">
                  {currentUser?.role}
                </Badge>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="border-amber-500/30 text-amber-300 hover:bg-amber-600/20"
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

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-black/20 backdrop-blur-xl rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'audit', label: 'Audit Logs', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-black/40 backdrop-blur-xl border-purple-500/20">
                <div className="flex items-center">
                  <Users className="h-12 w-12 text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">Total Users</p>
                    <p className="text-2xl font-bold text-white">{systemMetrics.totalUsers}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-black/40 backdrop-blur-xl border-purple-500/20">
                <div className="flex items-center">
                  <Package className="h-12 w-12 text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">Total Products</p>
                    <p className="text-2xl font-bold text-white">{systemMetrics.totalProducts}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-black/40 backdrop-blur-xl border-purple-500/20">
                <div className="flex items-center">
                  <Activity className="h-12 w-12 text-purple-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">Active Users</p>
                    <p className="text-2xl font-bold text-white">{systemMetrics.activeUsers}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-black/40 backdrop-blur-xl border-purple-500/20">
                <div className="flex items-center">
                  <BarChart3 className="h-12 w-12 text-amber-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-300">Revenue</p>
                    <p className="text-2xl font-bold text-white">₱{systemMetrics.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6 bg-black/40 backdrop-blur-xl border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-purple-900/20">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">{log.action}</p>
                        <p className="text-gray-400 text-sm">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">{log.user}</p>
                      <p className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className="p-6 bg-black/40 backdrop-blur-xl border-purple-500/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">User Management</h2>
              <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-purple-500/30 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-purple-300">Create New User</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Add a new user to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="user-email" className="text-right text-gray-300">Email</Label>
                      <Input
                        id="user-email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="user-password" className="text-right text-gray-300">Password</Label>
                      <Input
                        id="user-password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                        placeholder="Password"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="user-username" className="text-right text-gray-300">Username</Label>
                      <Input
                        id="user-username"
                        value={newUser.username}
                        onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                        className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                        placeholder="username"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="user-fullname" className="text-right text-gray-300">Full Name</Label>
                      <Input
                        id="user-fullname"
                        value={newUser.full_name}
                        onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                        className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="user-role" className="text-right text-gray-300">Role</Label>
                      <select
                        id="user-role"
                        value={newUser.role}
                        onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                        className="col-span-3 bg-slate-800 border border-purple-500/30 text-white rounded-md px-3 py-2"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateUser(false)} 
                      className="border-purple-500/30 text-purple-300"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateUser} 
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                      disabled={submitting}
                    >
                      {submitting ? 'Creating...' : 'Create User'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="rounded-lg border border-purple-500/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-purple-500/20 hover:bg-purple-900/20">
                    <TableHead className="text-purple-300">Avatar</TableHead>
                    <TableHead className="text-purple-300">Username</TableHead>
                    <TableHead className="text-purple-300">Email</TableHead>
                    <TableHead className="text-purple-300">Role</TableHead>
                    <TableHead className="text-purple-300">Created</TableHead>
                    <TableHead className="text-purple-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-purple-500/20 hover:bg-purple-900/10">
                      <TableCell>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium text-white">{user.username}</TableCell>
                      <TableCell className="text-white">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={
                          user.role === 'super_admin' ? "bg-amber-600/20 text-amber-300 border-amber-500/30" :
                          user.role === 'admin' ? "bg-blue-600/20 text-blue-300 border-blue-500/30" :
                          "bg-green-600/20 text-green-300 border-green-500/30"
                        }>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => openEditUserDialog(user)}
                            variant="outline"
                            size="sm"
                            className="border-blue-500/30 text-blue-300 hover:bg-blue-600/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteUser(user.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-300 hover:bg-red-600/20"
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <Card className="p-6 bg-black/40 backdrop-blur-xl border-purple-500/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Product Management</h2>
              <Dialog open={showCreateProduct} onOpenChange={setShowCreateProduct}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700">
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
                      <Label htmlFor="product-name" className="text-right text-gray-300">Name</Label>
                      <Input
                        id="product-name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                        className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                        placeholder="Product name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product-description" className="text-right text-gray-300">Description</Label>
                      <Textarea
                        id="product-description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                        className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                        placeholder="Product description"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product-price" className="text-right text-gray-300">Price</Label>
                      <Input
                        id="product-price"
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
                      <Label htmlFor="product-category" className="text-right text-gray-300">Category</Label>
                      <Input
                        id="product-category"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                        className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                        placeholder="T-Shirts"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product-stock" className="text-right text-gray-300">Stock</Label>
                      <Input
                        id="product-stock"
                        type="number"
                        min="0"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                        className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                        placeholder="0"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product-image" className="text-right text-gray-300">Image URL</Label>
                      <Input
                        id="product-image"
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
                      className="bg-gradient-to-r from-green-600 to-purple-600"
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
                              e.target.style.display = 'none';
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
                            onClick={() => openEditProductDialog(product)}
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
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <Card className="p-6 bg-black/40 backdrop-blur-xl border-purple-500/20">
            <h2 className="text-lg font-semibold text-white mb-6">System Audit Logs</h2>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 rounded-lg bg-purple-900/20 border border-purple-500/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div>
                      <p className="text-white font-medium">{log.action}</p>
                      <p className="text-gray-400 text-sm">{log.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-300 text-sm">{log.user}</p>
                    <p className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Edit User Dialog */}
        <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
          <DialogContent className="bg-slate-900 border-purple-500/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-purple-300">Edit User</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update user information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-user-email" className="text-right text-gray-300">Email</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={newUser.email}
                  disabled
                  className="col-span-3 bg-slate-700 border-purple-500/30 text-gray-400"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-user-username" className="text-right text-gray-300">Username</Label>
                <Input
                  id="edit-user-username"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-user-fullname" className="text-right text-gray-300">Full Name</Label>
                <Input
                  id="edit-user-fullname"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-user-role" className="text-right text-gray-300">Role</Label>
                <select
                  id="edit-user-role"
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="col-span-3 bg-slate-800 border border-purple-500/30 text-white rounded-md px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowEditUser(false)} 
                className="border-purple-500/30 text-purple-300"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditUser} 
                className="bg-gradient-to-r from-blue-600 to-purple-600"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                <Label htmlFor="edit-product-name" className="text-right text-gray-300">Name</Label>
                <Input
                  id="edit-product-name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-product-description" className="text-right text-gray-300">Description</Label>
                <Textarea
                  id="edit-product-description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-product-price" className="text-right text-gray-300">Price</Label>
                <Input
                  id="edit-product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-product-category" className="text-right text-gray-300">Category</Label>
                <Input
                  id="edit-product-category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-product-stock" className="text-right text-gray-300">Stock</Label>
                <Input
                  id="edit-product-stock"
                  type="number"
                  min="0"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                  className="col-span-3 bg-slate-800 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-product-image" className="text-right text-gray-300">Image URL</Label>
                <Input
                  id="edit-product-image"
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
                className="bg-gradient-to-r from-green-600 to-purple-600"
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

export default SuperAdminDashboard;
