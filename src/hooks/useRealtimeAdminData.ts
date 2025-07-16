
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
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
  const { profile, isAdmin } = useAuth();

  const loadUsers = useCallback(async () => {
    if (!isAdmin) {
      console.log('Not admin, skipping users load');
      return;
    }
    
    try {
      console.log('Loading users as admin...');
      // Optimize query to only get needed fields
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, full_name, role, created_at, updated_at, avatar_url')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to prevent excessive data loading

      if (error) {
        console.error('Error loading users:', error.message);
        return;
      }
      
      console.log('Users loaded successfully:', data?.length);
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err instanceof Error ? err.message : 'Unknown error');
    }
  }, [isAdmin]);

  const loadProducts = useCallback(async () => {
    try {
      console.log('Loading products...');
      // Optimize query to only get needed fields
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image, category, brand, stock, is_featured, description, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(200); // Limit to prevent excessive data loading

      if (error) throw error;
      console.log('Products loaded successfully:', data?.length);
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      console.log('Loading messages...');
      const { data, error } = await supabase
        .from('contact_messages')
        .select('id, name, email, subject, message, created_at')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to prevent excessive data loading

      if (error) {
        console.log('Messages table not accessible, using empty array');
        setMessages([]);
        return;
      }
      console.log('Messages loaded successfully:', data?.length);
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err instanceof Error ? err.message : 'Unknown error');
      setMessages([]);
    }
  }, []);

  const loadWishlistsData = useCallback(async () => {
    if (!isAdmin) {
      console.log('Not admin, skipping wishlists load');
      return;
    }
    
    try {
      console.log('Loading wishlists as admin...');
      const { data: wishlistsData, error } = await supabase
        .from('wishlists')
        .select('id, user_id, product_id, product_name, product_price, product_image, created_at')
        .order('created_at', { ascending: false })
        .limit(200); // Limit to prevent excessive data loading

      if (error) {
        console.log('Wishlists table not accessible:', error.message);
        setWishlists([]);
        return;
      }

      if (!wishlistsData || wishlistsData.length === 0) {
        console.log('No wishlist data found');
        setWishlists([]);
        return;
      }

      console.log('Raw wishlist data:', wishlistsData.length, 'items');

      const userIds = [...new Set(wishlistsData.map(w => w.user_id))];
      console.log('Fetching profiles for users:', userIds);

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

      console.log('Wishlists loaded and enriched successfully:', enrichedWishlists.length);
      setWishlists(enrichedWishlists);

    } catch (err) {
      console.error('Error in loadWishlists:', err instanceof Error ? err.message : 'Unknown error');
      setWishlists([]);
    }
  }, [isAdmin]);

  const loadReviews = useCallback(async () => {
    try {
      console.log('Loading reviews...');
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
      console.log('Reviews loaded successfully:', data?.length);
      setReviews(data || []);
    } catch (err) {
      console.error('Error loading reviews:', err instanceof Error ? err.message : 'Unknown error');
      setReviews([]);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    if (!profile) {
      console.log('No profile available, skipping data load');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Loading all dashboard data for profile:', profile.email, 'role:', profile.role);
      
      // Load data concurrently for better performance
      const promises = [
        loadProducts(),
        loadMessages(),
        loadReviews()
      ];
      
      // Only load admin-specific data if user is admin
      if (isAdmin) {
        promises.push(loadUsers(), loadWishlistsData());
      }
      
      await Promise.all(promises);
      
      console.log('All dashboard data loaded successfully');
    } catch (err) {
      console.error('Error loading dashboard data:', err instanceof Error ? err.message : 'Unknown error');
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [profile, isAdmin, loadUsers, loadProducts, loadMessages, loadWishlistsData, loadReviews]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!profile) {
      console.log('No profile, skipping data load and subscriptions');
      return;
    }

    console.log('Setting up real-time subscriptions and loading data for:', profile.email);
    loadAllData();

    // Subscribe to products changes
    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Products real-time update:', payload);
          loadProducts();
          
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

    // Subscribe to profiles/users changes (admin only)
    let usersSubscription: any = null;
    if (isAdmin) {
      usersSubscription = supabase
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
    }

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

    // Subscribe to wishlist changes (admin only)
    let wishlistsSubscription: any = null;
    if (isAdmin) {
      wishlistsSubscription = supabase
        .channel('wishlists-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'wishlists' },
          (payload) => {
            console.log('Wishlists real-time update:', payload);
            loadWishlistsData();
          }
        )
        .subscribe();
    }

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

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(productsSubscription);
      if (usersSubscription) supabase.removeChannel(usersSubscription);
      supabase.removeChannel(messagesSubscription);
      if (wishlistsSubscription) supabase.removeChannel(wishlistsSubscription);
      supabase.removeChannel(reviewsSubscription);
    };
  }, [profile, isAdmin, loadAllData, loadProducts, loadUsers, loadMessages, loadWishlistsData, loadReviews, toast]);

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
