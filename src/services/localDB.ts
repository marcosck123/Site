import { Product, User, CartItem, Order, OrderStatus, Coupon, Review, Driver, AppSettings } from '../types';

const DB_KEYS = {
  PRODUCTS: 'doce_entrega_products',
  USERS: 'doce_entrega_users',
  CART: 'doce_entrega_cart',
  CURRENT_USER: 'doce_entrega_current_user',
  ORDERS: 'doce_entrega_orders',
  CATEGORIES: 'doce_entrega_categories',
  COUPONS: 'doce_entrega_coupons',
  REVIEWS: 'doce_entrega_reviews',
  DRIVERS: 'doce_entrega_drivers',
  SETTINGS: 'doce_entrega_settings',
};

// Initial data if empty
const INITIAL_CATEGORIES = ['Brigadeiros', 'Bolos', 'Tortas', 'Cookies', 'Gelados'];
const INITIAL_COUPONS: Coupon[] = [
  {
    id: '1',
    code: 'DOCE20',
    discountType: 'percentage',
    discountValue: 20,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  }
];
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Brigadeiro Gourmet',
    description: 'Feito com o melhor chocolate belga e granulado artesanal.',
    price: 4.50,
    image: 'https://picsum.photos/seed/brigadeiro/400/400',
    category: 'Brigadeiros',
    rating: 4.9,
    deliveryTime: '20-30 min'
  },
  {
    id: '2',
    name: 'Bolo de Cenoura',
    description: 'Com cobertura de chocolate cremosa e massa fofinha.',
    price: 12.00,
    image: 'https://picsum.photos/seed/cake/400/400',
    category: 'Bolos',
    rating: 4.8,
    deliveryTime: '30-40 min'
  }
];

export const LocalDB = {
  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(DB_KEYS.PRODUCTS);
    if (!data) {
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(data);
  },
  
  saveProducts: (products: Product[]) => {
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
  },

  addProduct: (product: Product) => {
    const products = LocalDB.getProducts();
    products.push(product);
    LocalDB.saveProducts(products);
  },

  updateProduct: (updatedProduct: Product) => {
    const products = LocalDB.getProducts();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products[index] = updatedProduct;
      LocalDB.saveProducts(products);
    }
  },

  deleteProduct: (id: string) => {
    const products = LocalDB.getProducts();
    const filtered = products.filter(p => p.id !== id);
    LocalDB.saveProducts(filtered);
  },

  // User Auth
  getUsers: (): User[] => {
    const data = localStorage.getItem(DB_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUsers: (users: User[]) => {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  },

  registerUser: (user: User) => {
    const users = LocalDB.getUsers();
    users.push(user);
    LocalDB.saveUsers(users);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
      // Also update in users list
      const users = LocalDB.getUsers();
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users[index] = user;
        LocalDB.saveUsers(users);
      }
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

  // Orders
  getOrders: (): Order[] => {
    const data = localStorage.getItem(DB_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },

  saveOrders: (orders: Order[]) => {
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
  },

  addOrder: (order: Order) => {
    const orders = LocalDB.getOrders();
    orders.push(order);
    LocalDB.saveOrders(orders);
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const orders = LocalDB.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      LocalDB.saveOrders(orders);
    }
  },

  // Stats
  getStats: () => {
    const orders = LocalDB.getOrders().filter(o => o.status === 'Entregue');
    // Simple stats calculation
    return {
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      orderCount: orders.length,
      // More complex stats would go here
    };
  },

  // Categories
  getCategories: (): string[] => {
    const data = localStorage.getItem(DB_KEYS.CATEGORIES);
    if (!data) {
      localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(data);
  },

  saveCategories: (categories: string[]) => {
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  // Coupons
  getCoupons: (): Coupon[] => {
    const data = localStorage.getItem(DB_KEYS.COUPONS);
    if (!data) {
      localStorage.setItem(DB_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    const coupons: Coupon[] = JSON.parse(data);
    // Auto-deactivate expired coupons
    const now = new Date();
    let changed = false;
    const updated = coupons.map(c => {
      if (c.isActive && new Date(c.expiresAt) < now) {
        changed = true;
        return { ...c, isActive: false };
      }
      return c;
    });
    if (changed) LocalDB.saveCoupons(updated);
    return updated;
  },

  saveCoupons: (coupons: Coupon[]) => {
    localStorage.setItem(DB_KEYS.COUPONS, JSON.stringify(coupons));
  },

  addCoupon: (coupon: Coupon) => {
    const coupons = LocalDB.getCoupons();
    coupons.push(coupon);
    LocalDB.saveCoupons(coupons);
  },

  deleteCoupon: (id: string) => {
    const coupons = LocalDB.getCoupons();
    const filtered = coupons.filter(c => c.id !== id);
    LocalDB.saveCoupons(filtered);
  },

  validateCoupon: (code: string): Coupon | null => {
    const coupons = LocalDB.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (!coupon) return null;
    if (new Date(coupon.expiresAt) < new Date()) return null;
    return coupon;
  },

  // Reviews
  getReviews: (): Review[] => {
    const data = localStorage.getItem(DB_KEYS.REVIEWS);
    return data ? JSON.parse(data) : [];
  },

  addReview: (review: Review) => {
    const reviews = LocalDB.getReviews();
    reviews.push(review);
    localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(reviews));
  },

  // Drivers
  getDrivers: (): Driver[] => {
    const data = localStorage.getItem(DB_KEYS.DRIVERS);
    return data ? JSON.parse(data) : [];
  },

  saveDrivers: (drivers: Driver[]) => {
    localStorage.setItem(DB_KEYS.DRIVERS, JSON.stringify(drivers));
  },

  // Settings
  getSettings: (): AppSettings => {
    const data = localStorage.getItem(DB_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      darkMode: false,
      inventoryControl: true,
      loyaltyProgram: true
    };
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Popular Products (Simulated based on orders)
  getPopularProducts: (limit: number = 4): Product[] => {
    const orders = LocalDB.getOrders();
    const productCounts: Record<string, number> = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        productCounts[item.id] = (productCounts[item.id] || 0) + item.quantity;
      });
    });

    const products = LocalDB.getProducts();
    const sorted = products
      .map(p => ({ ...p, sales: productCounts[p.id] || 0 }))
      .sort((a, b) => b.sales - a.sales);

    return sorted.slice(0, limit);
  }
};
