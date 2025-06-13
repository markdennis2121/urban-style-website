import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  TableCaption,
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
  UserCog, 
  ClipboardList,
  Lock,
  History,
  Users,
  Settings,
  LogOut
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

interface PasswordPolicy {
  id: string;
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  password_history_count: number;
  max_age_days: number;
  updated_at: string;
}

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const { toast } = useToast();

  const stats = useMemo(() => ({
    totalUsers: profiles.length,
    admins: profiles.filter(p => p.role === 'admin').length,
    regularUsers: profiles.filter(p => p.role === 'user').length,
    superAdmins: profiles.filter(p => p.role === 'super_admin').length,
    lockedAccounts: profiles.filter(p => p.account_locked).length
  }), [profiles]);

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

  const fetchPasswordPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from('password_policies')
        .select('*')
        .single();

      if (error) throw error;
      if (data) setPasswordPolicy(data);
    } catch (err) {
      console.error('Error fetching password policy:', err);
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

  const handleUpdatePasswordPolicy = async (updatedPolicy: Partial<PasswordPolicy>) => {
    try {
      const { error } = await supabase
        .from('password_policies')
        .update(updatedPolicy)
        .eq('id', passwordPolicy?.id);

      if (error) throw error;

      toast({
        title: "Policy Updated",
        description: "Password policy has been updated successfully.",
      });

      fetchPasswordPolicy();
    } catch (err) {
      console.error('Error updating password policy:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update password policy.",
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
        fetchAuditLogs(),
        fetchSessions(),
        fetchPasswordPolicy()
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
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
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

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <h3 className="font-semibold text-lg text-gray-600">Total Users</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <h3 className="font-semibold text-lg text-gray-600">Admins</h3>
          <p className="text-2xl font-bold">{stats.admins}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <h3 className="font-semibold text-lg text-gray-600">Regular Users</h3>
          <p className="text-2xl font-bold">{stats.regularUsers}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <h3 className="font-semibold text-lg text-gray-600">Super Admins</h3>
          <p className="text-2xl font-bold">{stats.superAdmins}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <h3 className="font-semibold text-lg text-gray-600">Locked Accounts</h3>
          <p className="text-2xl font-bold">{stats.lockedAccounts}</p>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="audit">
            <ClipboardList className="h-4 w-4 mr-2" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <History className="h-4 w-4 mr-2" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Search className="text-gray-500" />
                  <Input
                    placeholder="Search users by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
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
            </div>

            <Table>
              <TableCaption>List of all users in the system</TableCaption>
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
                    <TableCell>{profile.username}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${profile.role === 'super_admin' ? 'bg-yellow-100 text-yellow-800' : 
                          profile.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {profile.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {profile.account_locked ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
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
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <Table>
              <TableCaption>Recent system activities</TableCaption>
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
                      <span className="capitalize">{log.action.replace(/_/g, ' ')}</span>
                    </TableCell>
                    <TableCell>
                      {profiles.find(p => p.id === log.user_id)?.username || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm">
                        {JSON.stringify(log.details, null, 2)}
                      </code>
                    </TableCell>
                    <TableCell>{log.ip_address || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <Table>
              <TableCaption>Active user sessions</TableCaption>
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${session.revoked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {session.revoked ? 'Revoked' : 'Active'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {!session.revoked && (
                        <Button
                          variant="ghost"
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
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Password Policy</h2>
            {passwordPolicy && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium">Minimum Length</label>
                    <Input
                      type="number"
                      value={passwordPolicy.min_length}
                      onChange={(e) => handleUpdatePasswordPolicy({
                        min_length: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password History</label>
                    <Input
                      type="number"
                      value={passwordPolicy.password_history_count}
                      onChange={(e) => handleUpdatePasswordPolicy({
                        password_history_count: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Maximum Age (days)</label>
                    <Input
                      type="number"
                      value={passwordPolicy.max_age_days}
                      onChange={(e) => handleUpdatePasswordPolicy({
                        max_age_days: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={passwordPolicy.require_uppercase}
                      onChange={(e) => handleUpdatePasswordPolicy({
                        require_uppercase: e.target.checked
                      })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label>Require Uppercase Letters</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={passwordPolicy.require_lowercase}
                      onChange={(e) => handleUpdatePasswordPolicy({
                        require_lowercase: e.target.checked
                      })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label>Require Lowercase Letters</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={passwordPolicy.require_numbers}
                      onChange={(e) => handleUpdatePasswordPolicy({
                        require_numbers: e.target.checked
                      })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label>Require Numbers</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={passwordPolicy.require_special_chars}
                      onChange={(e) => handleUpdatePasswordPolicy({
                        require_special_chars: e.target.checked
                      })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label>Require Special Characters</label>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mt-4">
                  Last updated: {format(new Date(passwordPolicy.updated_at), 'PP p')}
                </div>
              </div>
            )}
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
  );
};

export default SuperAdminDashboard;
