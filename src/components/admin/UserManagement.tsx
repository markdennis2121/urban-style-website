
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, User, Calendar, Edit, Trash2, Shield } from 'lucide-react';
import { User as UserType } from '@/hooks/useAdminData';
import { useAuth } from '@/hooks/useAuth';

interface UserManagementProps {
  users: UserType[];
  onUserUpdate?: (userId: string, updates: Partial<UserType>) => void;
  onUserDelete?: (userId: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  onUserUpdate, 
  onUserDelete 
}) => {
  const { profile } = useAuth();
  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Users className="h-5 w-5 text-white" />
          </div>
          User Management
          {!isSuperAdmin && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              View Only
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {isSuperAdmin 
            ? "View and manage customer accounts" 
            : "View customer accounts (editing restricted to super admins)"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {!isSuperAdmin && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Admin Access Level</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              User management operations are restricted to super administrators only.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          {users.length > 0 ? users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.username || 'No username'}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                    {user.role}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
                {isSuperAdmin && onUserUpdate && onUserDelete && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUserUpdate(user.id, {})}
                      className="rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onUserDelete(user.id)}
                      className="rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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
  );
};

export default UserManagement;
