
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Shield, 
  UserX, 
  Trash2, 
  Lock,
  History,
  Users,
  Settings,
  LogOut,
  Package,
  TrendingUp,
  DollarSign,
  Activity,
  Eye,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';

interface Profile {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'super_admin';
  created_at: string;
  last_login: string | null;
  failed_login_attempts: number;
  account_locked: boolean;
  last_password_change: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  ip_address: string | null;
  created_at: string;
}

interface UserSession {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
  revoked: boolean;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  totalRevenue: number;
  dailySignups: number;
  dailyLogins: number;
}

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const { toast } = useToast();

  const metrics = useMemo<SystemMetrics>(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      totalUsers: profiles.length,
      activeUsers: profiles.filter(p => p.last_login && new Date(p.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      totalProducts: products.length,
      totalRevenue: products.reduce((sum, p) => sum + (p.price * Math.max(0, 100 - p.stock)), 0),
      dailySignups: profiles.filter(p => new Date(p.created_at) >= today).length,
      dailyLogins: profiles.filter(p => p.last_login && new Date(p.last_login) >= today).length
    };
  }, [profiles, products]);

  const stats = useMemo(() => ({
    totalUsers: profiles.length,
    admins: profiles.filter(p => p.role === 'admin').length,
    regularUsers: profiles.filter(p => p.role === 'user').length,
    superAdmins: profiles.filter(p => p.role === 'super_admin').length,
    lockedAccounts: profiles.filter(p => p.account_locked).length,
    activeSessions: sessions.filter(s => !s.revoked).length,
    recentActivity: auditLogs.filter(log => 
      new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length
  }), [profiles, sessions, auditLogs]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      if (data) setProfiles(data);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profiles');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      if (data) setAuditLogs(data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: 'user' | 'admin' | 'super_admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });

      fetchProfiles();
      fetchAuditLogs();
    } catch (err) {
      console.error('Error updating role:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role.",
      });
    }
  };

  const handleCreateAdmin = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdminData.email,
        password: newAdminData.password,
        options: {
          data: {
            username: newAdminData.username,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      const { error: roleError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          last_password_change: new Date().toISOString()
        })
        .eq('id', authData.user.id);

      if (roleError) throw roleError;

      toast({
        title: "Admin Created",
        description: "New admin account has been created successfully.",
      });

      setShowCreateAdmin(false);
      setNewAdminData({ email: '', username: '', password: '' });
      fetchProfiles();
      fetchAuditLogs();
    } catch (err) {
      console.error('Error creating admin:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create admin account.",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(selectedUser.id);
      if (error) throw error;

      toast({
        title: "User Deleted",
        description: "User account has been permanently deleted.",
      });

      setShowDeleteConfirm(false);
      setSelectedUser(null);
      fetchProfiles();
      fetchAuditLogs();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user account.",
      });
    }
  };

  const handleUnlockAccount = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          account_locked: false,
          failed_login_attempts: 0
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Account Unlocked",
        description: "User account has been unlocked successfully.",
      });

      fetchProfiles();
      fetchAuditLogs();
    } catch (err) {
      console.error('Error unlocking account:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unlock user account.",
      });
    }
  };

  const handleRevokeSessions = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ revoked: true })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sessions Revoked",
        description: "All user sessions have been revoked successfully.",
      });

      fetchSessions();
      fetchAuditLogs();
    } catch (err) {
      console.error('Error revoking sessions:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to revoke user sessions.",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProfiles(),
        fetchProducts(),
        fetchAuditLogs(),
        fetchSessions()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredProfiles = useMemo(() => 
    profiles.filter(profile =>
      profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [profiles, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">Complete system administration</p>
            </div>
            <div className="flex gap-4">
              <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Admin Account</DialogTitle>
                    <DialogDescription>
                      Create a new administrator account. They will receive an email to verify their account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Email"
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <Input
                      placeholder="Username"
                      value={newAdminData.username}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, username: e.target.value }))}
                    />
                    <Input
                      type="password"
                      placeholder="Initial Password"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateAdmin(false)}>Cancel</Button>
                    <Button onClick={handleCreateAdmin}>Create Admin</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{metrics.dailySignups} today
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.dailyLogins} logins today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalProducts}</div>
              <p className="text-xs text-muted-foreground">In inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locked Accounts</CardTitle>
              <Lock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lockedAccounts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <History className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentActivity}</div>
              <p className="text-xs text-muted-foreground">Last 24h</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="audit">
              <History className="h-4 w-4 mr-2" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="sessions">
              <Activity className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search users by username or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Join Date</SelectItem>
                        <SelectItem value="username">Username</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="last_login">Last Login</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.username}</TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            profile.role === 'super_admin' ? 'default' : 
                            profile.role === 'admin' ? 'secondary' : 
                            'outline'
                          }>
                            {profile.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {profile.account_locked ? (
                            <Badge variant="destructive">Locked</Badge>
                          ) : (
                            <Badge variant="default">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {profile.last_login ? format(new Date(profile.last_login), 'PP') : 'Never'}
                        </TableCell>
                        <TableCell>{format(new Date(profile.created_at), 'PP')}</TableCell>
                        <TableCell className="text-right">
                          {profile.role !== 'super_admin' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {profile.role === 'user' && (
                                  <DropdownMenuItem
                                    onClick={() => handleRoleUpdate(profile.id, 'admin')}
                                    className="text-purple-600"
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Make Admin
                                  </DropdownMenuItem>
                                )}
                                {profile.role === 'admin' && (
                                  <DropdownMenuItem
                                    onClick={() => handleRoleUpdate(profile.id, 'user')}
                                    className="text-orange-600"
                                  >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Remove Admin
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {profile.account_locked && (
                                  <DropdownMenuItem
                                    onClick={() => handleUnlockAccount(profile.id)}
                                    className="text-green-600"
                                  >
                                    <Lock className="mr-2 h-4 w-4" />
                                    Unlock Account
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleRevokeSessions(profile.id)}
                                  className="text-blue-600"
                                >
                                  <LogOut className="mr-2 h-4 w-4" />
                                  Revoke Sessions
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(profile);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{format(new Date(log.created_at), 'PP p')}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {profiles.find(p => p.id === log.user_id)?.username || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {JSON.stringify(log.details)}
                          </code>
                        </TableCell>
                        <TableCell>{log.ip_address || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Active User Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>User Agent</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {profiles.find(p => p.id === session.user_id)?.username || 'Unknown'}
                        </TableCell>
                        <TableCell>{session.ip_address || 'N/A'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {session.user_agent || 'N/A'}
                        </TableCell>
                        <TableCell>{format(new Date(session.created_at), 'PP p')}</TableCell>
                        <TableCell>{format(new Date(session.expires_at), 'PP p')}</TableCell>
                        <TableCell>
                          <Badge variant={session.revoked ? 'destructive' : 'default'}>
                            {session.revoked ? 'Revoked' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!session.revoked && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeSessions(session.user_id)}
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Products Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>₱{product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock < 10 ? 'destructive' : 'default'}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(product.created_at), 'PP')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.username}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteUser}>Delete User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
