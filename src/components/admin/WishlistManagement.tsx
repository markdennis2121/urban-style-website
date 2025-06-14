
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Heart, Trash2 } from 'lucide-react';
import { WishlistItem } from '@/hooks/useAdminData';

interface WishlistManagementProps {
  wishlists: WishlistItem[];
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

const WishlistManagement: React.FC<WishlistManagementProps> = ({
  wishlists,
  onRefresh,
  onDelete
}) => {
  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
          <div className="bg-pink-500 p-2 rounded-lg">
            <Heart className="h-5 w-5 text-white" />
          </div>
          User Wishlists ({wishlists.length} items)
        </CardTitle>
        <CardDescription className="text-gray-600">Monitor user wishlist items and preferences</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4">
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            className="mb-4"
          >
            Refresh Wishlists
          </Button>
        </div>
        
        {wishlists.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Added Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishlists.map((wishlist) => (
                  <TableRow key={wishlist.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {wishlist.profiles?.username || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {wishlist.profiles?.email || wishlist.user_id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={wishlist.product_image || '/placeholder.svg'} 
                          alt={wishlist.product_name || 'Product'}
                          className="w-10 h-10 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div>
                          <p className="font-medium">{wishlist.product_name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-500">ID: {wishlist.product_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₱{wishlist.product_price || 0}
                    </TableCell>
                    <TableCell>
                      {new Date(wishlist.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(wishlist.id)}
                        className="rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No wishlist items found</p>
            <p className="text-sm text-gray-400 mt-2">
              Users haven't added any items to their wishlists yet
            </p>
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              className="mt-4"
            >
              Refresh Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WishlistManagement;
