
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User, Calendar } from 'lucide-react';
import { User as UserType } from '@/hooks/useAdminData';

interface UserManagementProps {
  users: UserType[];
}

const UserManagement: React.FC<UserManagementProps> = ({ users }) => {
  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Users className="h-5 w-5 text-white" />
          </div>
          User Management
        </CardTitle>
        <CardDescription className="text-gray-600">View and manage customer accounts</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
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
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
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
