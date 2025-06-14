import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase, getCurrentProfile } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  created_at: string;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
}

type WishlistAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: WishlistItem[] }
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string };

const initialState: WishlistState = {
  items: [],
  loading: false,
};

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.product_id !== action.payload) };
    default:
      return state;
  }
};

interface WishlistContextType {
  state: WishlistState;
  addToWishlist: (product: any) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loadWishlist: () => Promise<void>;
  loadAllWishlists: () => Promise<WishlistItem[]>; // New function for admins
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { toast } = useToast();

  const loadWishlist = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        dispatch({ type: 'SET_ITEMS', payload: [] });
        return;
      }

      // Check if user is admin or superadmin to load all wishlists
      const profile = await getCurrentProfile();
      const isAdmin = profile && ['admin', 'super_admin'].includes(profile.role);

      let query = supabase.from('wishlists').select('*');
      
      if (!isAdmin) {
        // Regular users only see their own wishlists
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading wishlist from database:', error);
        // Fallback to local storage for regular users only
        if (!isAdmin) {
          const localWishlist = localStorage.getItem(`wishlist_${user.id}`);
          if (localWishlist) {
            dispatch({ type: 'SET_ITEMS', payload: JSON.parse(localWishlist) });
          } else {
            dispatch({ type: 'SET_ITEMS', payload: [] });
          }
        } else {
          dispatch({ type: 'SET_ITEMS', payload: [] });
        }
        return;
      }

      dispatch({ type: 'SET_ITEMS', payload: data || [] });
    } catch (err) {
      console.error('Error loading wishlist:', err);
      dispatch({ type: 'SET_ITEMS', payload: [] });
    }
  };

  // New function specifically for admin dashboards
  const loadAllWishlists = async (): Promise<WishlistItem[]> => {
    try {
      console.log('Loading all wishlists for admin dashboard...');
      
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading all wishlists:', error);
        return [];
      }

      console.log('All wishlists loaded:', data);
      return data || [];
    } catch (err) {
      console.error('Error in loadAllWishlists:', err);
      return [];
    }
  };

  const addToWishlist = async (product: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Please login",
          description: "You need to login to add items to wishlist.",
          variant: "destructive",
        });
        return;
      }

      // Check if already in wishlist
      if (isInWishlist(product.id)) {
        toast({
          title: "Already in wishlist",
          description: `${product.name} is already in your wishlist.`,
        });
        return;
      }

      const wishlistItem = {
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image || '/placeholder.svg',
      };

      const { data, error } = await supabase
        .from('wishlists')
        .insert([wishlistItem])
        .select()
        .single();

      if (error) {
        console.error('Database insert failed:', error);
        // Fallback to local storage
        const localItem = {
          id: crypto.randomUUID(),
          ...wishlistItem,
          created_at: new Date().toISOString(),
        };
        const existingWishlist = localStorage.getItem(`wishlist_${user.id}`);
        const wishlist = existingWishlist ? JSON.parse(existingWishlist) : [];
        wishlist.push(localItem);
        localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishlist));
        dispatch({ type: 'ADD_ITEM', payload: localItem });
      } else {
        dispatch({ type: 'ADD_ITEM', payload: data });
      }

      toast({
        title: "Added to wishlist!",
        description: `${product.name} has been added to your wishlist.`,
      });
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist.",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Database delete failed:', error);
        // Fallback to local storage
        const existingWishlist = localStorage.getItem(`wishlist_${user.id}`);
        if (existingWishlist) {
          const wishlist = JSON.parse(existingWishlist);
          const updatedWishlist = wishlist.filter((item: WishlistItem) => item.product_id !== productId);
          localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updatedWishlist));
        }
      }

      dispatch({ type: 'REMOVE_ITEM', payload: productId });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      });
    }
  };

  const isInWishlist = (productId: string) => {
    return state.items.some(item => item.product_id === productId);
  };

  useEffect(() => {
    loadWishlist();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadWishlist();
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SET_ITEMS', payload: [] });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <WishlistContext.Provider value={{
      state,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      loadWishlist,
      loadAllWishlists,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
