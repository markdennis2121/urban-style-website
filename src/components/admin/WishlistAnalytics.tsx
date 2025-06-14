
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Heart, TrendingUp, Package } from 'lucide-react';
import { WishlistItem } from '@/hooks/useAdminData';

interface WishlistAnalyticsProps {
  wishlists: WishlistItem[];
  onRefresh: () => void;
}

interface ProductWishlistCount {
  product_id: string;
  product_name: string;
  product_image: string;
  product_price: number;
  wishlist_count: number;
  percentage: number;
}

const WishlistAnalytics: React.FC<WishlistAnalyticsProps> = ({
  wishlists,
  onRefresh
}) => {
  // Group wishlists by product and count
  const productCounts = React.useMemo(() => {
    const counts = new Map<string, ProductWishlistCount>();
    
    wishlists.forEach((wishlist) => {
      const existing = counts.get(wishlist.product_id);
      if (existing) {
        existing.wishlist_count += 1;
      } else {
        counts.set(wishlist.product_id, {
          product_id: wishlist.product_id,
          product_name: wishlist.product_name,
          product_image: wishlist.product_image,
          product_price: wishlist.product_price,
          wishlist_count: 1,
          percentage: 0
        });
      }
    });

    // Calculate percentages
    const totalWishlists = wishlists.length;
    const result = Array.from(counts.values());
    
    result.forEach(item => {
      item.percentage = totalWishlists > 0 ? (item.wishlist_count / totalWishlists) * 100 : 0;
    });

    // Sort by count descending
    return result.sort((a, b) => b.wishlist_count - a.wishlist_count);
  }, [wishlists]);

  const topProduct = productCounts[0];

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
          <div className="bg-pink-500 p-2 rounded-lg">
            <Heart className="h-5 w-5 text-white" />
          </div>
          Wishlist Analytics ({wishlists.length} total items)
        </CardTitle>
        <CardDescription className="text-gray-600">
          Product popularity based on wishlist additions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            className="mb-4"
          >
            Refresh Analytics
          </Button>

          {topProduct && (
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-pink-700 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Most Wanted Product</span>
              </div>
              <div className="flex items-center gap-3">
                <img 
                  src={topProduct.product_image || '/placeholder.svg'} 
                  alt={topProduct.product_name}
                  className="w-12 h-12 object-cover rounded border"
                />
                <div>
                  <p className="font-semibold text-gray-900">{topProduct.product_name}</p>
                  <p className="text-sm text-pink-600">
                    {topProduct.wishlist_count} users want this ({topProduct.percentage.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {productCounts.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Wishlist Count</TableHead>
                  <TableHead>Popularity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productCounts.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={product.product_image || '/placeholder.svg'} 
                          alt={product.product_name}
                          className="w-10 h-10 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div>
                          <p className="font-medium">{product.product_name}</p>
                          <p className="text-sm text-gray-500">ID: {product.product_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₱{product.product_price}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="font-semibold">{product.wishlist_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(product.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {product.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No wishlist data available</p>
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

export default WishlistAnalytics;
