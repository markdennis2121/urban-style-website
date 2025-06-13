
import { useState, useEffect, useMemo } from 'react';
import { supabase, getCurrentProfile } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useToast } from "@/hooks/use-toast";
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
  Activity,
  Eye,
  Crown
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [currentUser, setCurrentUser] = useState(null);
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/superadmin/login');
    } catch (err) {
      console.error('Logout error:', err);
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
      const profile = await getCurrentProfile();
      setCurrentUser(profile);
      
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Crown className="h-8 w-8 text-yellow-400" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Super Admin Dashboard
                </h1>
                <p className="text-gray-300">Complete system administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-purple-500/30 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-purple-300">Create New Admin Account</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Create a new administrator account. They will receive an email to verify their account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Email"
                      value={newAdminData.email}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                    <Input
                      placeholder="Username"
                      value={newAdminData.username}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, username: e.target.value }))}
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                    <Input
                      type="password"
                      placeholder="Initial Password"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateAdmin(false)} className="border-purple-500/30 text-purple-300">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAdmin} className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Create Admin
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 ring-2 ring-yellow-400/50">
                  <AvatarImage src={currentUser?.avatar_url} />
                  <AvatarFallback className="bg-yellow-600 text-black">
                    {currentUser?.username?.charAt(0)?.toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-white">
                  {currentUser?.username}
                </span>
                <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30">
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
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.totalUsers}</div>
              <p className="text-xs text-gray-400">
                +{metrics.dailySignups} today
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.activeUsers}</div>
              <p className="text-xs text-gray-400">
                {metrics.dailyLogins} logins today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metrics.totalProducts}</div>
              <p className="text-xs text-gray-400">In inventory</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">System Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">99.9%</div>
              <p className="text-xs text-gray-400">Uptime</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Admins</CardTitle>
              <Shield className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.admins}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Locked Accounts</CardTitle>
              <Lock className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.lockedAccounts}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeSessions}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Recent Activity</CardTitle>
              <History className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.recentActivity}</div>
              <p className="text-xs text-gray-400">Last 24h</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/40 border-purple-500/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-300">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-300">
              <History className="h-4 w-4 mr-2" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-300">
              <Activity className="h-4 w-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-purple-600/30 data-[state=active]:text-purple-300">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search users by username or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-800 border-purple-500/30 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px] bg-slate-800 border-purple-500/30 text-white">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-purple-500/30">
                        <SelectItem value="created_at">Join Date</SelectItem>
                        <SelectItem value="username">Username</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="last_login">Last Login</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-purple-500/20 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-purple-500/20 hover:bg-purple-900/20">
                        <TableHead className="text-purple-300">Username</TableHead>
                        <TableHead className="text-purple-300">Email</TableHead>
                        <TableHead className="text-purple-300">Role</TableHead>
                        <TableHead className="text-purple-300">Status</TableHead>
                        <TableHead className="text-purple-300">Last Login</TableHead>
                        <TableHead className="text-purple-300">Joined</TableHead>
                        <TableHead className="text-right text-purple-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.map((profile) => (
                        <TableRow key={profile.id} className="border-purple-500/20 hover:bg-purple-900/10">
                          <TableCell className="font-medium text-white">{profile.username}</TableCell>
                          <TableCell className="text-gray-300">{profile.email}</TableCell>
                          <TableCell>
                            <Badge className={
                              profile.role === 'super_admin' ? 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30' : 
                              profile.role === 'admin' ? 'bg-purple-600/20 text-purple-300 border-purple-500/30' : 
                              'bg-blue-600/20 text-blue-300 border-blue-500/30'
                            }>
                              {profile.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {profile.account_locked ? (
                              <Badge className="bg-red-600/20 text-red-300 border-red-500/30">Locked</Badge>
                            ) : (
                              <Badge className="bg-green-600/20 text-green-300 border-green-500/30">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {profile.last_login ? format(new Date(profile.last_login), 'PP') : 'Never'}
                          </TableCell>
                          <TableCell className="text-gray-300">{format(new Date(profile.created_at), 'PP')}</TableCell>
                          <TableCell className="text-right">
                            {profile.role !== 'super_admin' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 text-gray-300 hover:bg-purple-600/20">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-800 border-purple-500/30">
                                  {profile.role === 'user' && (
                                    <DropdownMenuItem
                                      onClick={() => handleRoleUpdate(profile.id, 'admin')}
                                      className="text-purple-300 hover:bg-purple-600/20"
                                    >
                                      <Shield className="mr-2 h-4 w-4" />
                                      Make Admin
                                    </DropdownMenuItem>
                                  )}
                                  {profile.role === 'admin' && (
                                    <DropdownMenuItem
                                      onClick={() => handleRoleUpdate(profile.id, 'user')}
                                      className="text-orange-400 hover:bg-orange-600/20"
                                    >
                                      <UserX className="mr-2 h-4 w-4" />
                                      Remove Admin
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator className="bg-purple-500/20" />
                                  {profile.account_locked && (
                                    <DropdownMenuItem
                                      onClick={() => handleUnlockAccount(profile.id)}
                                      className="text-green-400 hover:bg-green-600/20"
                                    >
                                      <Lock className="mr-2 h-4 w-4" />
                                      Unlock Account
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleRevokeSessions(profile.id)}
                                    className="text-blue-400 hover:bg-blue-600/20"
                                  >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Revoke Sessions
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-purple-500/20" />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(profile);
                                      setShowDeleteConfirm(true);
                                    }}
                                    className="text-red-400 hover:bg-red-600/20"
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">System Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-purple-500/20 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-purple-500/20 hover:bg-purple-900/20">
                        <TableHead className="text-purple-300">Time</TableHead>
                        <TableHead className="text-purple-300">Action</TableHead>
                        <TableHead className="text-purple-300">User</TableHead>
                        <TableHead className="text-purple-300">Details</TableHead>
                        <TableHead className="text-purple-300">IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id} className="border-purple-500/20 hover:bg-purple-900/10">
                          <TableCell className="text-gray-300">{format(new Date(log.created_at), 'PP p')}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                              {log.action.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {profiles.find(p => p.id === log.user_id)?.username || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-slate-800 text-purple-300 px-2 py-1 rounded">
                              {JSON.stringify(log.details)}
                            </code>
                          </TableCell>
                          <TableCell className="text-gray-300">{log.ip_address || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Active User Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-purple-500/20 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-purple-500/20 hover:bg-purple-900/20">
                        <TableHead className="text-purple-300">User</TableHead>
                        <TableHead className="text-purple-300">IP Address</TableHead>
                        <TableHead className="text-purple-300">User Agent</TableHead>
                        <TableHead className="text-purple-300">Created</TableHead>
                        <TableHead className="text-purple-300">Expires</TableHead>
                        <TableHead className="text-purple-300">Status</TableHead>
                        <TableHead className="text-right text-purple-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id} className="border-purple-500/20 hover:bg-purple-900/10">
                          <TableCell className="text-white">
                            {profiles.find(p => p.id === session.user_id)?.username || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-gray-300">{session.ip_address || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate text-gray-300">
                            {session.user_agent || 'N/A'}
                          </TableCell>
                          <TableCell className="text-gray-300">{format(new Date(session.created_at), 'PP p')}</TableCell>
                          <TableCell className="text-gray-300">{format(new Date(session.expires_at), 'PP p')}</TableCell>
                          <TableCell>
                            <Badge className={session.revoked ? 'bg-red-600/20 text-red-300 border-red-500/30' : 'bg-green-600/20 text-green-300 border-green-500/30'}>
                              {session.revoked ? 'Revoked' : 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {!session.revoked && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeSessions(session.user_id)}
                                className="border-red-500/30 text-red-300 hover:bg-red-600/20"
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="bg-black/40 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Products Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-purple-500/20 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-purple-500/20 hover:bg-purple-900/20">
                        <TableHead className="text-purple-300">Image</TableHead>
                        <TableHead className="text-purple-300">Name</TableHead>
                        <TableHead className="text-purple-300">Category</TableHead>
                        <TableHead className="text-purple-300">Price</TableHead>
                        <TableHead className="text-purple-300">Stock</TableHead>
                        <TableHead className="text-purple-300">Created</TableHead>
                        <TableHead className="text-right text-purple-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id} className="border-purple-500/20 hover:bg-purple-900/10">
                          <TableCell>
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-white">{product.name}</TableCell>
                          <TableCell>
                            <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">{product.category}</Badge>
                          </TableCell>
                          <TableCell className="text-white">₱{product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={product.stock < 10 ? "bg-red-600/20 text-red-300 border-red-500/30" : "bg-green-600/20 text-green-300 border-green-500/30"}>
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{format(new Date(product.created_at), 'PP')}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-300 hover:bg-blue-600/20">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="bg-slate-900 border-purple-500/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-300">Confirm Delete User</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to delete {selectedUser?.username}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-purple-500/30 text-purple-300">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
