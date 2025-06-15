
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  quantity: number;
  size?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

interface UserCart {
  user_id: string;
  username: string;
  email: string;
  items: CartItem[];
  total_items: number;
  total_value: number;
  last_updated: string;
}

export const useRealtimeCartData = () => {
  const [userCarts, setUserCarts] = useState<UserCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const loadUserCarts = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: cartData, error: cartError } = await supabase
        .from('user_carts')
        .select(`
          *,
          profiles:user_id (
            username,
            email
          )
        `)
        .order('updated_at', { ascending: false });

      if (cartError) throw cartError;

      const userCartsMap = new Map<string, UserCart>();
      
      cartData?.forEach((item: any) => {
        const userId = item.user_id;
        
        if (!userCartsMap.has(userId)) {
          userCartsMap.set(userId, {
            user_id: userId,
            username: item.profiles?.username || 'Unknown User',
            email: item.profiles?.email || 'No email',
            items: [],
            total_items: 0,
            total_value: 0,
            last_updated: item.updated_at,
          });
        }

        const userCart = userCartsMap.get(userId)!;
        userCart.items.push(item);
        userCart.total_items += item.quantity;
        userCart.total_value += item.product_price * item.quantity;
        
        if (new Date(item.updated_at) > new Date(userCart.last_updated)) {
          userCart.last_updated = item.updated_at;
        }
      });

      setUserCarts(Array.from(userCartsMap.values()));
    } catch (error) {
      console.error('Error loading user carts:', error);
      setError('Failed to load user carts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserCarts();

    const cartsSubscription = supabase
      .channel('carts-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_carts' },
        (payload) => {
          console.log('Cart real-time update:', payload);
          loadUserCarts();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Cart Updated",
              description: "A user added an item to their cart.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cartsSubscription);
    };
  }, [loadUserCarts, toast]);

  return {
    userCarts,
    loading,
    error,
    loadUserCarts,
  };
};
