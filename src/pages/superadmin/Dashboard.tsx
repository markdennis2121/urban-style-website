import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Shield, 
  Crown,
  Package, 
  MessageSquare, 
  PlusCircle, 
  Trash2,
  Heart,
  Star,
  Activity,
  TrendingUp,
  BarChart3,
  FileText,
  Mail,
  Calendar,
  User,
  Zap
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Admin creation form
  const [adminForm, setAdminForm] = useState({
    email: '',
    password: '',
    username: '',
    role: 'admin'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUsers(),
        loadAdmins(),
        loadProducts(), 
        loadMessages(),
        loadWishlists(),
        loadReviews(),
        loadSystemLogs()
      ]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
    }
  };

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

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Messages table not accessible, using empty array');
        setMessages([]);
        return;
      }
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    }
  };

  const loadWishlists = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          profiles:user_id (username, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading wishlists:', error);
        setWishlists([]);
        return;
      }
      setWishlists(data || []);
    } catch (err) {
      console.error('Error loading wishlists:', err);
      setWishlists([]);
    }
  };

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (username, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Reviews table not accessible, using empty array');
        setReviews([]);
        return;
      }
      setReviews(data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setReviews([]);
    }
  };

  const loadSystemLogs = async () => {
    // Simulate system logs for now
    setSystemLogs([
      { id: 1, action: 'User Login', user: 'john@example.com', timestamp: new Date().toISOString(), status: 'success', details: 'Successful authentication' },
      { id: 2, action: 'Product Added', user: 'admin@example.com', timestamp: new Date(Date.now() - 300000).toISOString(), status: 'success', details: 'New product created' },
      { id: 3, action: 'Failed Login Attempt', user: 'unknown@example.com', timestamp: new Date(Date.now() - 600000).toISOString(), status: 'error', details: 'Invalid credentials' },
      { id: 4, action: 'Admin Created', user: 'superadmin@example.com', timestamp: new Date(Date.now() - 900000).toISOString(), status: 'success', details: 'New admin account created' },
    ]);
  };

  const deleteMessage = async (messageId) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Contact message deleted successfully.",
      });

      // Reload messages
      loadMessages();
    } catch (err) {
      console.error('Error deleting message:', err);
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminForm.email,
        password: adminForm.password,
        email_confirm: true
      });

      if (authError) throw authError;

      // Update profile with admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: adminForm.username,
          role: adminForm.role
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast({
        title: "Success!",
        description: "Admin account created successfully.",
      });

      // Reset form
      setAdminForm({
        email: '',
        password: '',
        username: '',
        role: 'admin'
      });

      // Reload admins
      loadAdmins();
    } catch (err) {
      console.error('Error creating admin:', err);
      toast({
        title: "Error",
        description: "Failed to create admin account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAdmin = async (id) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) throw error;

      toast({
        title: "Success!",
        description: "Admin account deleted successfully.",
      });

      loadAdmins();
    } catch (err) {
      console.error('Error deleting admin:', err);
      toast({
        title: "Error",
        description: "Failed to delete admin account.",
        variant: "destructive",
      });
    }
  };

  const deleteWishlistItem = async (wishlistId) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Wishlist item deleted successfully.",
      });

      loadWishlists();
    } catch (err) {
      console.error('Error deleting wishlist item:', err);
      toast({
        title: "Error",
        description: "Failed to delete wishlist item.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading super admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Premium Header Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold">
                      Super Admin Dashboard
                    </h1>
                  </div>
                  <p className="text-xl text-amber-100">
                    Complete system control and advanced management
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-4 rounded-xl">
                    <Zap className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert className="mb-8 bg-red-50 border-red-200 rounded-xl">
              <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Premium Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{users.length}</div>
                <p className="text-blue-100">Total Users</p>
                <p className="text-xs text-blue-200 mt-1">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">System</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{admins.length}</div>
                <p className="text-green-100">Admin Accounts</p>
                <p className="text-xs text-green-200 mt-1">Secure access control</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">Inventory</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{products.length}</div>
                <p className="text-purple-100">Products</p>
                <p className="text-xs text-purple-200 mt-1">Catalog management</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-xl shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">Live</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">99.9%</div>
                <p className="text-amber-100">System Health</p>
                <p className="text-xs text-amber-200 mt-1">Uptime this month</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 rounded-lg px-4 py-3 font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="admins" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-lg px-4 py-3 font-medium">
                <Shield className="w-4 h-4 mr-2" />
                Admin Management
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg px-4 py-3 font-medium">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-lg px-4 py-3 font-medium">
                <Package className="w-4 h-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger value="wishlists" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 rounded-lg px-4 py-3 font-medium">
                <Heart className="w-4 h-4 mr-2" />
                User Wishlists
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-lg px-4 py-3 font-medium">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Messages
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg px-4 py-3 font-medium">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700 rounded-lg px-4 py-3 font-medium">
                <FileText className="w-4 h-4 mr-2" />
                System Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">New user registered</p>
                          <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Product added to inventory</p>
                          <p className="text-xs text-gray-500">5 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Admin login detected</p>
                          <p className="text-xs text-gray-500">10 minutes ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Total Wishlists</span>
                        <span className="font-bold text-purple-600">{wishlists.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Total Reviews</span>
                        <span className="font-bold text-yellow-600">{reviews.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Contact Messages</span>
                        <span className="font-bold text-orange-600">{messages.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Low Stock Items</span>
                        <span className="font-bold text-red-600">
                          {products.filter(p => p.stock < 10).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="admins" className="space-y-8">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <PlusCircle className="h-5 w-5 text-white" />
                    </div>
                    Create New Admin
                  </CardTitle>
                  <CardDescription className="text-gray-600">Add a new administrator to the system</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCreateAdmin} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={adminForm.email}
                          onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                          className="mt-1 rounded-lg border-gray-300"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
                        <Input
                          id="username"
                          value={adminForm.username}
                          onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                          className="mt-1 rounded-lg border-gray-300"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={adminForm.password}
                          onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                          className="mt-1 rounded-lg border-gray-300"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                        <Select onValueChange={(value) => setAdminForm({...adminForm, role: value})}>
                          <SelectTrigger className="mt-1 rounded-lg border-gray-300">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 rounded-lg py-3 font-medium">
                      {loading ? 'Creating Admin...' : 'Create Admin Account'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    Admin Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {admins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${admin.role === 'super_admin' ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}>
                            {admin.role === 'super_admin' ? (
                              <Crown className="h-6 w-6 text-white" />
                            ) : (
                              <Shield className="h-6 w-6 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{admin.username || 'No username'}</p>
                            <p className="text-sm text-gray-600">{admin.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'} 
                                 className={admin.role === 'super_admin' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' : 'bg-blue-100 text-blue-700'}>
                            {admin.role === 'super_admin' ? (
                              <>
                                <Crown className="w-3 h-3 mr-1" />
                                Super Admin
                              </>
                            ) : (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </>
                            )}
                          </Badge>
                          {admin.role !== 'super_admin' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteAdmin(admin.id)}
                              className="rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    User Management
                  </CardTitle>
                  <CardDescription className="text-gray-600">Monitor and manage all user accounts</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {users.length > 0 ? users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.username || 'No username'}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{user.role}</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No users found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    Product Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {products.length > 0 ? products.slice(0, 10).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-300" />
                          <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.brand}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">₱{product.price}</Badge>
                          <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'} 
                                 className={product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                            Stock: {product.stock}
                          </Badge>
                        </div>
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
            </TabsContent>

            <TabsContent value="wishlists" className="space-y-8">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-pink-500 p-2 rounded-lg">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    User Wishlists
                  </CardTitle>
                  <CardDescription className="text-gray-600">Monitor user wishlist items and preferences</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {wishlists.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Added Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {wishlists.map((wishlist) => (
                          <TableRow key={wishlist.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{wishlist.profiles?.username || 'Unknown'}</p>
                                <p className="text-sm text-gray-500">{wishlist.profiles?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={wishlist.product_image || '/placeholder.svg'} 
                                  alt={wishlist.product_name}
                                  className="w-10 h-10 object-cover rounded border"
                                />
                                <div>
                                  <p className="font-medium">{wishlist.product_name}</p>
                                  <p className="text-sm text-gray-500">ID: {wishlist.product_id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">₱{wishlist.product_price}</TableCell>
                            <TableCell>{new Date(wishlist.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteWishlistItem(wishlist.id)}
                                className="rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No wishlist items found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-8">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    Contact Messages
                  </CardTitle>
                  <CardDescription className="text-gray-600">View and manage customer contact messages</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {messages.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.map((message) => (
                          <TableRow key={message.id}>
                            <TableCell className="font-medium">{message.name}</TableCell>
                            <TableCell>{message.email}</TableCell>
                            <TableCell className="max-w-xs truncate">{message.subject}</TableCell>
                            <TableCell className="max-w-md truncate">{message.message}</TableCell>
                            <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteMessage(message.id)}
                                className="rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No contact messages found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      User Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-green-600 mb-2">+15.2%</div>
                    <p className="text-sm text-gray-600">User growth this month</p>
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">Steady growth in user registrations</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Package className="h-5 w-5 text-blue-600" />
                      Product Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-blue-600 mb-2">₱{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}</div>
                    <p className="text-sm text-gray-600">Total inventory value</p>
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">Healthy inventory levels maintained</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Heart className="h-5 w-5 text-purple-600" />
                      Wishlist Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{wishlists.length}</div>
                    <p className="text-sm text-gray-600">Total wishlist items</p>
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-700">High user engagement with products</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <MessageSquare className="h-5 w-5 text-orange-600" />
                      Customer Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{messages.length + reviews.length}</div>
                    <p className="text-sm text-gray-600">Total interactions</p>
                    <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-700">Active customer communication</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-gray-600 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    System Activity Logs
                  </CardTitle>
                  <CardDescription className="text-gray-600">Real-time system monitoring and audit trail</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {systemLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div>
                            <p className="font-semibold text-gray-900">{log.action}</p>
                            <p className="text-sm text-gray-600">{log.user}</p>
                            <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                          </div>
                        </div>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'} 
                               className={log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {new Date(log.timestamp).toLocaleString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
