
import { CartItem, CartState } from '../types/cart';

const CART_STORAGE_KEY = 'lovable_cart';

export const loadFromStorage = (): CartState | null => {
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

export const saveToStorage = (state: CartState) => {
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
