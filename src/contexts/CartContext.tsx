
import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoaded: boolean;
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_FROM_STORAGE'; payload: CartState }
  | { type: 'LOAD_FROM_DATABASE'; payload: CartItem[] }
  | { type: 'SET_LOADED' };

const CART_STORAGE_KEY = 'lovable_cart';

const getInitialState = (): CartState => {
  return {
    items: [],
    total: 0,
    itemCount: 0,
    isLoaded: false,
  };
};

const loadFromStorage = (): CartState | null => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart && Array.isArray(parsedCart.items)) {
        return {
          ...parsedCart,
          isLoaded: true,
        };
      }
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  
  return null;
};

const saveToStorage = (state: CartState) => {
  try {
    if (state.isLoaded) {
      const stateToSave = {
        items: state.items,
        total: state.total,
        itemCount: state.itemCount,
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const saveToDatabase = async (userId: string, items: CartItem[]) => {
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

const loadFromDatabase = async (userId: string): Promise<CartItem[]> => {
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

const calculateTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState;

  switch (action.type) {
    case 'LOAD_FROM_STORAGE':
      console.log('Loading cart from storage:', action.payload);
      return action.payload;

    case 'LOAD_FROM_DATABASE': {
      const { total, itemCount } = calculateTotals(action.payload);
      newState = {
        items: action.payload,
        total,
        itemCount,
        isLoaded: true,
      };
      break;
    }

    case 'SET_LOADED':
      return {
        ...state,
        isLoaded: true,
      };

    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => 
        item.id === action.payload.id && 
        item.size === action.payload.size && 
        item.color === action.payload.color
      );
      let newItems;
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id && 
          item.size === action.payload.size && 
          item.color === action.payload.color
            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }];
      }
      
      const { total, itemCount } = calculateTotals(newItems);
      newState = { items: newItems, total, itemCount, isLoaded: state.isLoaded };
      break;
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const { total, itemCount } = calculateTotals(newItems);
      newState = { items: newItems, total, itemCount, isLoaded: state.isLoaded };
      break;
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      
      const { total, itemCount } = calculateTotals(newItems);
      newState = { items: newItems, total, itemCount, isLoaded: state.isLoaded };
      break;
    }
    
    case 'CLEAR_CART':
      newState = { items: [], total: 0, itemCount: 0, isLoaded: state.isLoaded };
      break;
    
    default:
      return state;
  }

  saveToStorage(newState);
  return newState;
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, getInitialState());
  const { profile, isAuthenticated, initialized } = useAuth();
  const loadedRef = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Load cart data on mount
  useEffect(() => {
    if (loadedRef.current || !initialized) return;
    
    loadedRef.current = true;
    console.log('Initializing cart...');

    const initializeCart = async () => {
      if (isAuthenticated && profile?.id) {
        // Load from database for authenticated users
        console.log('Loading cart from database for user:', profile.id);
        const dbItems = await loadFromDatabase(profile.id);
        dispatch({ type: 'LOAD_FROM_DATABASE', payload: dbItems });
      } else {
        // Load from localStorage for guest users
        const savedCart = loadFromStorage();
        if (savedCart) {
          console.log('Found saved cart in localStorage:', savedCart);
          dispatch({ type: 'LOAD_FROM_STORAGE', payload: savedCart });
        } else {
          console.log('No saved cart found, setting as loaded');
          dispatch({ type: 'SET_LOADED' });
        }
      }
    };

    initializeCart();

    return () => {
      loadedRef.current = false;
    };
  }, [isAuthenticated, profile?.id, initialized]);

  // Sync cart to database when user is authenticated and cart changes
  useEffect(() => {
    if (!isAuthenticated || !profile?.id || !state.isLoaded) return;

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce database sync
    syncTimeoutRef.current = setTimeout(() => {
      console.log('Syncing cart to database for user:', profile.id);
      saveToDatabase(profile.id, state.items);
    }, 1000);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [isAuthenticated, profile?.id, state.items, state.isLoaded]);
  
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
