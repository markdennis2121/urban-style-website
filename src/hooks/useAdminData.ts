
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  image: string;
  created_at: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  created_at: string;
  profiles?: {
    id: string;
    username: string;
    email: string;
  } | null;
}

export interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: {
    username: string;
    email: string;
  };
}

export const useAdminData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { loadAllWishlists } = useWishlist();

  const loadUsers = async () => {
    try {
      console.log('Admin loading all users...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        return;
      }
      
      console.log('Admin loaded users:', data);
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Messages table not accessible, using empty array');
        setMessages([]);
        return;
      }
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    }
  };

  const loadWishlistsData = async () => {
    try {
      console.log('Admin loading all wishlists...');
      
      const wishlistsData = await loadAllWishlists();
      
      if (!wishlistsData || wishlistsData.length === 0) {
        console.log('No wishlist data found');
        setWishlists([]);
        return;
      }

      console.log('Raw wishlist data:', wishlistsData);

      const userIds = [...new Set(wishlistsData.map(w => w.user_id))];
      console.log('User IDs from wishlists:', userIds);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        setWishlists(wishlistsData);
        return;
      }

      console.log('Profiles data:', profilesData);

      const enrichedWishlists = wishlistsData.map(wishlist => {
        const userProfile = profilesData?.find(p => p.id === wishlist.user_id);
        return {
          ...wishlist,
          profiles: userProfile ? {
            id: userProfile.id,
            username: userProfile.username,
            email: userProfile.email
          } : null
        };
      });

      console.log('Enriched wishlists:', enrichedWishlists);
      setWishlists(enrichedWishlists);

    } catch (err) {
      console.error('Error in loadWishlists:', err);
      setWishlists([]);
    }
  };

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (username, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Reviews table not accessible, using empty array');
        setReviews([]);
        return;
      }
      setReviews(data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setReviews([]);
    }
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUsers(),
        loadProducts(),
        loadMessages(),
        loadWishlistsData(),
        loadReviews()
      ]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Product deleted successfully.",
      });

      loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const deleteWishlistItem = async (wishlistId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Wishlist item deleted successfully.",
      });

      loadWishlistsData();
    } catch (err) {
      console.error('Error deleting wishlist item:', err);
      toast({
        title: "Error",
        description: "Failed to delete wishlist item.",
        variant: "destructive",
      });
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "User updated successfully.",
      });

      loadUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // First delete related wishlist items
      await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', userId);

      // Then delete the user profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "User deleted successfully.",
      });

      loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return {
    users,
    products,
    messages,
    wishlists,
    reviews,
    loading,
    error,
    loadUsers,
    loadProducts,
    loadMessages,
    loadWishlistsData,
    loadReviews,
    loadAllData,
    deleteProduct,
    deleteWishlistItem,
    updateUser,
    deleteUser
  };
};
