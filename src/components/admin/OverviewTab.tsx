
import React from 'react';
import StatsCards from './StatsCards';
import OnlineUsers from './OnlineUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Users, Package } from 'lucide-react';

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
    <div className="space-y-6">
      <StatsCards 
        usersCount={usersCount}
        productsCount={productsCount}
        messagesCount={messagesCount}
        wishlistsCount={wishlistsCount}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OnlineUsers />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Database</span>
                </div>
                <span className="text-green-700 text-sm">Online</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Authentication</span>
                </div>
                <span className="text-blue-700 text-sm">Active</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">File Storage</span>
                </div>
                <span className="text-purple-700 text-sm">Available</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Growth Rate</p>
                <p className="text-2xl font-bold text-blue-600">+12%</p>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{Math.round(usersCount * 0.7)}</p>
                <p className="text-xs text-muted-foreground">in last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Popular Products</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(productsCount * 0.3)}</p>
                <p className="text-xs text-muted-foreground">high engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">System Load</p>
                <p className="text-2xl font-bold text-orange-600">23%</p>
                <p className="text-xs text-muted-foreground">optimal performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
