
import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';

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
      console.log('Cart saved to localStorage:', stateToSave);
    }
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState;

  switch (action.type) {
    case 'LOAD_FROM_STORAGE':
      console.log('Loading cart from storage:', action.payload);
      return action.payload;

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
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      newState = { items: newItems, total, itemCount, isLoaded: state.isLoaded };
      break;
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      newState = { items: newItems, total, itemCount, isLoaded: state.isLoaded };
      break;
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
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
  const loadedRef = useRef(false);
  
  useEffect(() => {
    // Prevent multiple loads with stronger guard
    if (loadedRef.current) {
      console.log('Cart already loaded, skipping');
      return;
    }
    
    loadedRef.current = true;
    console.log('Initializing cart...');

    const savedCart = loadFromStorage();
    if (savedCart) {
      console.log('Found saved cart:', savedCart);
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: savedCart });
    } else {
      console.log('No saved cart found, setting as loaded');
      dispatch({ type: 'SET_LOADED' });
    }

    return () => {
      loadedRef.current = false;
    };
  }, []);
  
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
