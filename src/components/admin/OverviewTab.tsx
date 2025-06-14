
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Package, MessageSquare, Heart } from 'lucide-react';

interface OverviewTabProps {
  usersCount: number;
  productsCount: number;
  messagesCount: number;
  wishlistsCount: number;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  usersCount,
  productsCount,
  messagesCount,
  wishlistsCount
}) => {
  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
          <div className="bg-blue-500 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          Overview
        </CardTitle>
        <CardDescription className="text-gray-600">Key performance indicators and analytics</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Total Users</p>
                <p className="text-sm text-gray-600">{usersCount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Total Products</p>
                <p className="text-sm text-green-600">{productsCount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Total Messages</p>
                <p className="text-sm text-orange-600">{messagesCount}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Heart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Total Wishlists</p>
                <p className="text-sm text-purple-600">{wishlistsCount}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewTab;
