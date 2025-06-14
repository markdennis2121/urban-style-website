
import { supabase } from './client';

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price_per_unit: number;
  size?: string;
  color?: string;
}

export const createOrder = async (orderData: {
  user_id: string;
  total_amount: number;
  shipping_address: Order['shipping_address'];
  items: Omit<OrderItem, 'id' | 'order_id'>[];
}): Promise<{ data: Order | null; error: any }> => {
  try {
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: orderData.user_id,
        status: 'pending',
        total_amount: orderData.total_amount,
        shipping_address: orderData.shipping_address,
        payment_status: 'pending'
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = orderData.items.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) throw itemsError;

    // Update product stock
    for (const item of orderData.items) {
      await supabase.rpc('decrement_stock', {
        product_id: item.product_id,
        quantity: item.quantity
      });
    }

    return { data: { ...order, order_items: items }, error: null };
  } catch (error) {
    console.error('Error creating order:', error);
    return { data: null, error };
  }
};

export const getUserOrders = async (userId: string): Promise<{ data: Order[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return { data: null, error };
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<{ data: Order | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { data: null, error };
  }
};
