
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
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

      // Check if wishlist table exists by trying to query it
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Wishlist table not found or accessible:', error.message);
        // Fallback to local storage for now
        const localWishlist = localStorage.getItem(`wishlist_${user.id}`);
        if (localWishlist) {
          dispatch({ type: 'SET_ITEMS', payload: JSON.parse(localWishlist) });
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
        id: crypto.randomUUID(),
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image,
        created_at: new Date().toISOString(),
      };

      // Try to insert into database first
      const { data, error } = await supabase
        .from('wishlists')
        .insert([{
          user_id: user.id,
          ...wishlistItem,
        }])
        .select()
        .single();

      if (error) {
        console.log('Database insert failed, using local storage:', error.message);
        // Fallback to local storage
        const existingWishlist = localStorage.getItem(`wishlist_${user.id}`);
        const wishlist = existingWishlist ? JSON.parse(existingWishlist) : [];
        wishlist.push(wishlistItem);
        localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishlist));
        dispatch({ type: 'ADD_ITEM', payload: wishlistItem });
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

      // Try to delete from database first
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.log('Database delete failed, using local storage:', error.message);
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
