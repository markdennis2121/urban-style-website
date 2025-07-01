
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Users, Shield, User, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useUserSessions } from '@/hooks/useUserSessions';
import { User as UserType } from '@/hooks/useAdminData';
import { AlertTriangle, Edit, Trash2 } from 'lucide-react';
import UserEditDialog from './UserEditDialog';
import { useAuth } from '@/hooks/useAuth';
// ✨ FIX: Import from ui/dialog instead of @radix-ui/react-dialog
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';

interface UserManagementProps {
  users?: UserType[];
  onUserUpdate?: (userId: string, updates: Partial<UserType>) => Promise<void>;
  onUserDelete?: (userId: string) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users: propUsers,
  onUserUpdate,
  onUserDelete
}) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { activeSessions, loadActiveSessions } = useUserSessions();
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: UserType | null }>({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: UserType | null }>({ open: false, user: null });
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'superadmin';

  useEffect(() => {
    if (propUsers) {
      setUsers(propUsers);
      setLoading(false);
    } else {
      loadUsers();
    }
    loadActiveSessions();
  }, [propUsers, loadActiveSessions]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUserOnline = (userId: string) => {
    return activeSessions.some(session => session.user_id === userId);
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onlineUsers = users.filter(user => isUserOnline(user.id));

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Online Now</p>
                <p className="text-2xl font-bold text-green-600">{onlineUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Admins</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'admin' || u.role === 'superadmin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Regular Users</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'user' || !u.role).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>User Management</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isUserOnline(user.id) ? (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.full_name || 'No name'}</h3>
                      {isUserOnline(user.id) ? (
                        <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                          <Wifi className="w-3 h-3 mr-1" />
                          Online
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 border-gray-200">
                          <WifiOff className="w-3 h-3 mr-1" />
                          Offline
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline"
                    className={
                      user.role === 'superadmin' 
                        ? 'border-red-200 text-red-700 bg-red-50'
                        : user.role === 'admin'
                        ? 'border-blue-200 text-blue-700 bg-blue-50'
                        : 'border-gray-200 text-gray-700'
                    }
                  >
                    {user.role || 'user'}
                  </Badge>
                  {isSuperAdmin && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Edit User"
                        className="hover:bg-blue-50"
                        onClick={() => setEditDialog({ open: true, user })}
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete User"
                        className="hover:bg-red-50"
                        onClick={() => setDeleteDialog({ open: true, user })}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No users found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editDialog.user && onUserUpdate && (
        <UserEditDialog
          user={editDialog.user}
          open={editDialog.open}
          onClose={() => setEditDialog({ open: false, user: null })}
          onSubmit={async updates => {
            await onUserUpdate(editDialog.user!.id, updates);
          }}
        />
      )}
      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={open => !open && setDeleteDialog({ open: false, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user account? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-medium">{deleteDialog.user?.full_name || deleteDialog.user?.email}</span>
          </div>
          <DialogFooter>
            <Button variant="destructive"
              disabled={!onUserDelete}
              onClick={async () => {
                if (deleteDialog.user && onUserDelete) {
                  await onUserDelete(deleteDialog.user.id);
                  setDeleteDialog({ open: false, user: null });
                }
              }}
            >
              Delete
            </Button>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setDeleteDialog({ open: false, user: null })}>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
