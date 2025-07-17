
import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CartState, CartAction } from '../types/cart';
import { getInitialState, cartReducer } from '../hooks/useCartLogic';
import { loadFromStorage } from '../utils/cartStorage';
import { loadFromDatabase, saveToDatabase } from '../utils/cartDatabase';

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
      try {
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
      } catch (error: any) {
        console.error('Error initializing cart:', error);
        dispatch({ type: 'SET_LOADED' });
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
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Syncing cart to database for user:', profile.id);
        await saveToDatabase(profile.id, state.items);
      } catch (error: any) {
        console.error('Error syncing cart to database:', error);
      }
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

// Re-export types for convenience
export type { CartItem, CartState, CartAction } from '../types/cart';
