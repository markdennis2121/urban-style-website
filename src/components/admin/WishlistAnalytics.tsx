
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, User, Package, RefreshCw } from 'lucide-react';
import { WishlistItem } from '@/hooks/useAdminData';
import CollapsibleTable from '@/components/ui/collapsible-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface WishlistAnalyticsProps {
  wishlists: WishlistItem[];
  onRefresh: () => void;
}

const WishlistAnalytics: React.FC<WishlistAnalyticsProps> = ({
  wishlists,
  onRefresh
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  // Calculate analytics
  const totalWishlists = wishlists.length;
  const uniqueUsers = new Set(wishlists.map(w => w.user_id)).size;
  const totalValue = wishlists.reduce((sum, item) => sum + (item.product_price || 0), 0);
  const popularProducts = wishlists.reduce((acc, item) => {
    acc[item.product_name] = (acc[item.product_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(popularProducts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <div>
              <p className="text-sm opacity-90">Total Wishlists</p>
              <p className="text-2xl font-bold">{totalWishlists}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <div>
              <p className="text-sm opacity-90">Unique Users</p>
              <p className="text-2xl font-bold">{uniqueUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <div>
              <p className="text-sm opacity-90">Total Value</p>
              <p className="text-2xl font-bold">{formatPrice(totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <div>
              <p className="text-sm opacity-90">Avg per User</p>
              <p className="text-2xl font-bold">
                {uniqueUsers > 0 ? Math.round(totalWishlists / uniqueUsers) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <CollapsibleTable
          title="Most Wishlisted Products"
          icon={<Package className="h-5 w-5 text-white" />}
          itemCount={topProducts.length}
          defaultExpanded={false}
        >
          <div className="space-y-2">
            {topProducts.map(([productName, count], index) => (
              <div key={productName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-pink-100 text-pink-600 rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium">{productName}</span>
                </div>
                <Badge variant="secondary">{count} wishlists</Badge>
              </div>
            ))}
          </div>
        </CollapsibleTable>
      )}

      {/* Wishlist Items */}
      <CollapsibleTable
        title="All Wishlist Items"
        icon={<Heart className="h-5 w-5 text-white" />}
        itemCount={wishlists.length}
        defaultExpanded={false}
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {wishlists.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No wishlist items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Added Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wishlists.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {item.profiles?.username || 'Unknown User'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.profiles?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <span className="font-medium">{item.product_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(item.product_price || 0)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(item.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CollapsibleTable>
    </div>
  );
};

export default WishlistAnalytics;
