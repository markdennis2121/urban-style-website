
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Package, MessageSquare, Heart } from 'lucide-react';

interface StatsCardsProps {
  usersCount: number;
  productsCount: number;
  messagesCount: number;
  wishlistsCount: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  usersCount,
  productsCount,
  messagesCount,
  wishlistsCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-xl shadow-lg border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-2 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">{usersCount}</div>
          <p className="text-blue-100">Total Users</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-xl shadow-lg border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-2 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30">Inventory</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">{productsCount}</div>
          <p className="text-purple-100">Products</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-xl shadow-lg border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-2 rounded-lg">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30">Support</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">{messagesCount}</div>
          <p className="text-green-100">Messages</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 text-white rounded-xl shadow-lg border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-2 rounded-lg">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30">Engagement</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">{wishlistsCount}</div>
          <p className="text-pink-100">Wishlist Items</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
