import { Product, User, CartItem } from '../types';

const DB_KEYS = {
  PRODUCTS: 'doce_entrega_products',
  USERS: 'doce_entrega_users',
  CART: 'doce_entrega_cart',
  CURRENT_USER: 'doce_entrega_current_user',
};

export const LocalDB = {
  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(DB_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  
  saveProducts: (products: Product[]) => {
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // User Auth
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(DB_KEYS.CURRENT_USER);
    }
  },

  // Cart
  getCart: (): CartItem[] => {
    const data = localStorage.getItem(DB_KEYS.CART);
    return data ? JSON.parse(data) : [];
  },

  saveCart: (cart: CartItem[]) => {
    localStorage.setItem(DB_KEYS.CART, JSON.stringify(cart));
  },
};
