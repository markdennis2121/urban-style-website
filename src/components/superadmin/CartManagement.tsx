
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import { ShoppingCart, Trash2, User, Package, Eye } from 'lucide-react';
import { useRealtimeCartData } from '@/hooks/useRealtimeCartData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const CartManagement: React.FC = () => {
  const { toast } = useToast();
  const { userCarts, loading, loadUserCarts } = useRealtimeCartData();

  const clearUserCart = async (userId: string) => {
    if (!confirm('Are you sure you want to clear this user\'s cart?')) return;

    try {
      const { error } = await supabase
        .from('user_carts')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "User cart cleared successfully.",
      });

      loadUserCarts();
    } catch (error) {
      console.error('Error clearing user cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear user cart.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const CartDetailsDialog = ({ cart }: { cart: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cart Details - {cart.username}</DialogTitle>
          <DialogDescription>
            {cart.email} • {cart.total_items} items • ₱{cart.total_value.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {cart.items.map((item: any) => (
            <div key={`${item.product_id}-${item.size}-${item.color}`} className="flex gap-4 p-4 border rounded-lg">
              <img 
                src={item.product_image} 
                alt={item.product_name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium">{item.product_name}</h4>
                <div className="text-sm text-gray-600">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.size && item.color && <span> • </span>}
                  {item.color && <span>Color: {item.color}</span>}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm">Quantity: {item.quantity}</span>
                  <span className="font-medium">₱{(item.product_price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading carts...</span>
      </div>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
          <div className="bg-blue-500 p-2 rounded-lg">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          User Carts ({userCarts.length})
          <div className="bg-green-500/20 px-2 py-1 rounded-full border border-green-300">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Real-time</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {userCarts.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No user carts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userCarts.map((cart) => (
                  <TableRow key={cart.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{cart.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {cart.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Package className="h-3 w-3 mr-1" />
                        {cart.total_items}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₱{cart.total_value.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(cart.last_updated)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <CartDetailsDialog cart={cart} />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => clearUserCart(cart.user_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CartManagement;
