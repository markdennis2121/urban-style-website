
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
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Shield, 
  Crown,
  Package, 
  MessageSquare, 
  PlusCircle, 
  Edit,
  Trash2,
  Heart,
  Star,
  Activity,
  TrendingUp,
  BarChart3,
  FileText
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

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
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

      if (error) throw error;
      setWishlists(data || []);
    } catch (err) {
      console.error('Error loading wishlists:', err);
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

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const loadSystemLogs = async () => {
    // Simulate system logs for now
    setSystemLogs([
      { id: 1, action: 'User Login', user: 'john@example.com', timestamp: new Date().toISOString(), status: 'success' },
      { id: 2, action: 'Product Added', user: 'admin@example.com', timestamp: new Date().toISOString(), status: 'success' },
      { id: 3, action: 'Failed Login Attempt', user: 'unknown@example.com', timestamp: new Date().toISOString(), status: 'error' },
    ]);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      <Header />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-500 via-primary to-amber-600 bg-clip-text text-transparent">
              Super Admin Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">Complete system control and management</p>
          </div>

          {error && (
            <Alert className="mb-6 bg-destructive/10 border-destructive/20">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          {/* Advanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 via-card/80 to-blue-600/10 backdrop-blur-sm border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 via-card/80 to-green-600/10 backdrop-blur-sm border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{admins.length}</div>
                <p className="text-xs text-muted-foreground">Active admin accounts</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 via-card/80 to-purple-600/10 backdrop-blur-sm border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{products.length}</div>
                <p className="text-xs text-muted-foreground">Inventory items</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 via-card/80 to-amber-600/10 backdrop-blur-sm border-amber-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">99.9%</div>
                <p className="text-xs text-muted-foreground">Uptime this month</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background/80">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="admins" className="data-[state=active]:bg-background/80">
                <Shield className="w-4 h-4 mr-2" />
                Admin Management
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-background/80">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-background/80">
                <Package className="w-4 h-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-background/80">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-background/80">
                <FileText className="w-4 h-4 mr-2" />
                System Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">New user registered</p>
                          <p className="text-xs text-muted-foreground">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Product added to inventory</p>
                          <p className="text-xs text-muted-foreground">5 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Admin login detected</p>
                          <p className="text-xs text-muted-foreground">10 minutes ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Wishlists</span>
                        <span className="font-medium">{wishlists.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Reviews</span>
                        <span className="font-medium">{reviews.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Contact Messages</span>
                        <span className="font-medium">{messages.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Low Stock Items</span>
                        <span className="font-medium text-amber-600">
                          {products.filter(p => p.stock < 10).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="admins" className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Create New Admin
                  </CardTitle>
                  <CardDescription>Add a new administrator to the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateAdmin} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={adminForm.email}
                          onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={adminForm.username}
                          onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={adminForm.password}
                          onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select onValueChange={(value) => setAdminForm({...adminForm, role: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Creating...' : 'Create Admin Account'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Admin Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {admins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/50">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${admin.role === 'super_admin' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                          <div>
                            <p className="font-medium">{admin.username || 'No username'}</p>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={admin.role === 'super_admin' ? 'default' : 'secondary'} className="bg-gradient-to-r from-amber-500/20 to-primary/20">
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
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>Monitor and manage all user accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.username || 'No username'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{user.role}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.slice(0, 10).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/50">
                        <div className="flex items-center space-x-4">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">₱{product.price}</Badge>
                          <Badge variant={product.stock < 10 ? 'destructive' : 'secondary'}>
                            Stock: {product.stock}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 mb-2">+15.2%</div>
                    <p className="text-sm text-muted-foreground">User growth this month</p>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Product Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 mb-2">₱{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Total inventory value</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    System Activity Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/50">
                        <div className="flex items-center space-x-4">
                          <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div>
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-muted-foreground">{log.user}</p>
                          </div>
                        </div>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
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
