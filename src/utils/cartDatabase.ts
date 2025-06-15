
import { supabase } from '@/lib/supabase/client';
import { CartItem } from '../types/cart';

export const saveToDatabase = async (userId: string, items: CartItem[]) => {
  try {
    // Delete existing cart items for this user
    await supabase
      .from('user_carts')
      .delete()
      .eq('user_id', userId);

    // Insert new cart items
    if (items.length > 0) {
      const cartItems = items.map(item => ({
        user_id: userId,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        product_image: item.image,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      }));

      const { error } = await supabase
        .from('user_carts')
        .insert(cartItems);

      if (error) throw error;
      console.log('Cart saved to database');
    }
  } catch (error) {
    console.error('Error saving cart to database:', error);
  }
};

export const loadFromDatabase = async (userId: string): Promise<CartItem[]> => {
  try {
    const { data, error } = await supabase
      .from('user_carts')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.product_id,
      name: item.product_name,
      price: item.product_price,
      image: item.product_image,
      quantity: item.quantity,
      size: item.size || undefined,
      color: item.color || undefined,
    }));
  } catch (error) {
    console.error('Error loading cart from database:', error);
    return [];
  }
};
