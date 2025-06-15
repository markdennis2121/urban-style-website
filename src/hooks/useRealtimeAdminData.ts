
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Product, Message, WishlistItem, Review } from '@/hooks/useAdminData';

export const useRealtimeAdminData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error.message);
        return;
      }
      
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const loadMessages = useCallback(async () => {
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
      console.error('Error loading messages:', err instanceof Error ? err.message : 'Unknown error');
      setMessages([]);
    }
  }, []);

  const loadWishlistsData = useCallback(async () => {
    try {
      const { data: wishlistsData, error } = await supabase
        .from('wishlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Wishlists table not accessible, using empty array');
        setWishlists([]);
        return;
      }

      if (!wishlistsData || wishlistsData.length === 0) {
        setWishlists([]);
        return;
      }

      const userIds = [...new Set(wishlistsData.map(w => w.user_id))];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError.message);
        setWishlists(wishlistsData);
        return;
      }

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

      setWishlists(enrichedWishlists);

    } catch (err) {
      console.error('Error in loadWishlists:', err instanceof Error ? err.message : 'Unknown error');
      setWishlists([]);
    }
  }, []);

  const loadReviews = useCallback(async () => {
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
      console.error('Error loading reviews:', err instanceof Error ? err.message : 'Unknown error');
      setReviews([]);
    }
  }, []);

  const loadAllData = useCallback(async () => {
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
      console.error('Error loading dashboard data:', err instanceof Error ? err.message : 'Unknown error');
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [loadUsers, loadProducts, loadMessages, loadWishlistsData, loadReviews]);

  // Set up real-time subscriptions
  useEffect(() => {
    loadAllData();

    // Subscribe to products changes
    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Products real-time update:', payload);
          loadProducts();
          
          // Show toast notification for real-time updates
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Product Added",
              description: "A new product has been added to the catalog.",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Product Updated",
              description: "A product has been updated.",
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: "Product Deleted",
              description: "A product has been removed from the catalog.",
            });
          }
        }
      )
      .subscribe();

    // Subscribe to profiles/users changes
    const usersSubscription = supabase
      .channel('profiles-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Users real-time update:', payload);
          loadUsers();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New User Registered",
              description: "A new user has joined the platform.",
            });
          }
        }
      )
      .subscribe();

    // Subscribe to contact messages changes
    const messagesSubscription = supabase
      .channel('messages-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'contact_messages' },
        (payload) => {
          console.log('Messages real-time update:', payload);
          loadMessages();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Message",
              description: "A new contact message has been received.",
            });
          }
        }
      )
      .subscribe();

    // Subscribe to wishlist changes
    const wishlistsSubscription = supabase
      .channel('wishlists-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'wishlists' },
        (payload) => {
          console.log('Wishlists real-time update:', payload);
          loadWishlistsData();
        }
      )
      .subscribe();

    // Subscribe to reviews changes
    const reviewsSubscription = supabase
      .channel('reviews-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        (payload) => {
          console.log('Reviews real-time update:', payload);
          loadReviews();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Review",
              description: "A new product review has been submitted.",
            });
          }
        }
      )
      .subscribe();

    // Subscribe to user_carts changes (for cart management)
    const cartsSubscription = supabase
      .channel('carts-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_carts' },
        (payload) => {
          console.log('Carts real-time update:', payload);
          // This will be handled by CartManagement component separately
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(productsSubscription);
      supabase.removeChannel(usersSubscription);
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(wishlistsSubscription);
      supabase.removeChannel(reviewsSubscription);
      supabase.removeChannel(cartsSubscription);
    };
  }, [loadAllData, loadProducts, loadUsers, loadMessages, loadWishlistsData, loadReviews, toast]);

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
  };
};
