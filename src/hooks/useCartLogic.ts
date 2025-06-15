
import { CartState, CartAction, CartItem } from '../types/cart';
import { saveToStorage } from '../utils/cartStorage';

export const getInitialState = (): CartState => {
  return {
    items: [],
    total: 0,
    itemCount: 0,
    isLoaded: false,
  };
};

export const calculateTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

export const cartReducer = (state: CartState, action: CartAction): CartState => {
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
