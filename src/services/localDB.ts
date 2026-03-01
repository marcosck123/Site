import { Product, User, CartItem, Order, OrderStatus, Coupon, Review, Driver, AppSettings, Ingredient } from '../types';

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
  INGREDIENTS: 'doce_entrega_ingredients',
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

  // Ingredients
  getIngredients: (): Ingredient[] => {
    const data = localStorage.getItem(DB_KEYS.INGREDIENTS);
    return data ? JSON.parse(data) : [];
  },

  saveIngredients: (ingredients: Ingredient[]) => {
    localStorage.setItem(DB_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  },

  addIngredient: (ingredient: Ingredient) => {
    const ingredients = LocalDB.getIngredients();
    ingredients.push(ingredient);
    LocalDB.saveIngredients(ingredients);
  },

  updateIngredient: (updatedIngredient: Ingredient) => {
    const ingredients = LocalDB.getIngredients();
    const index = ingredients.findIndex(i => i.id === updatedIngredient.id);
    if (index !== -1) {
      ingredients[index] = updatedIngredient;
      LocalDB.saveIngredients(ingredients);
    }
  },

  deleteIngredient: (id: string) => {
    const ingredients = LocalDB.getIngredients();
    const filtered = ingredients.filter(i => i.id !== id);
    LocalDB.saveIngredients(filtered);
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

  toggleFavorite: (productId: string) => {
    const user = LocalDB.getCurrentUser();
    if (!user) return;
    
    const favorites = user.favorites || [];
    const index = favorites.indexOf(productId);
    
    if (index === -1) {
      favorites.push(productId);
    } else {
      favorites.splice(index, 1);
    }
    
    LocalDB.setCurrentUser({ ...user, favorites });
  },

  isFavorite: (productId: string): boolean => {
    const user = LocalDB.getCurrentUser();
    if (!user || !user.favorites) return false;
    return user.favorites.includes(productId);
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

    // Handle Inventory and Loyalty if enabled
    const settings = LocalDB.getSettings();
    
    if (settings.inventoryControl) {
      const products = LocalDB.getProducts();
      order.items.forEach(item => {
        const productIndex = products.findIndex(p => p.id === item.id);
        if (productIndex !== -1 && products[productIndex].stock !== undefined) {
          products[productIndex].stock = Math.max(0, products[productIndex].stock! - item.quantity);
        }
      });
      LocalDB.saveProducts(products);
    }

    if (settings.loyaltyProgram) {
      const users = LocalDB.getUsers();
      const userIndex = users.findIndex(u => u.id === order.userId);
      if (userIndex !== -1) {
        const pointsEarned = Math.floor(order.total); // 1 point per R$ 1
        users[userIndex].points = (users[userIndex].points || 0) + pointsEarned;
        LocalDB.saveUsers(users);
        
        // If current user is the one who ordered, update current user too
        const currentUser = LocalDB.getCurrentUser();
        if (currentUser && currentUser.id === order.userId) {
          LocalDB.setCurrentUser({ ...currentUser, points: users[userIndex].points });
        }
      }
    }
  },

  updateUserPoints: (userId: string, points: number) => {
    const users = LocalDB.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].points = points;
      LocalDB.saveUsers(users);
      
      const currentUser = LocalDB.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        LocalDB.setCurrentUser({ ...currentUser, points });
      }
    }
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
    const users = LocalDB.getUsers();
    const products = LocalDB.getProducts();
    
    return {
      totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
      orderCount: orders.length,
      totalLoyaltyPoints: users.reduce((sum, u) => sum + (u.points || 0), 0),
      totalInventoryStock: products.reduce((sum, p) => sum + (p.stock || 0), 0),
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
  getReviews: (productId?: string): Review[] => {
    const data = localStorage.getItem(DB_KEYS.REVIEWS);
    const reviews: Review[] = data ? JSON.parse(data) : [
      {
        id: 'r1',
        productId: '1',
        userId: 'u1',
        userName: 'Ana Silva',
        rating: 5,
        comment: 'Melhor brigadeiro que já comi! Super cremoso.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'r2',
        productId: '1',
        userId: 'u2',
        userName: 'João Santos',
        rating: 4,
        comment: 'Muito bom, mas achei um pouco pequeno.',
        createdAt: new Date().toISOString()
      }
    ];
    if (productId) {
      return reviews.filter(r => r.productId === productId);
    }
    return reviews;
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

  // Referral
  generateReferralCode: (userName: string): string => {
    const prefix = userName.slice(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random}`;
  },

  applyReferral: (code: string) => {
    const users = LocalDB.getUsers();
    const referrer = users.find(u => u.referralCode === code);
    if (referrer) {
      // Give points to referrer
      referrer.points = (referrer.points || 0) + 50;
      LocalDB.saveUsers(users);
      return true;
    }
    return false;
  },

  redeemPoints: (userId: string, pointsToRedeem: number): boolean => {
    const users = LocalDB.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1 && (users[userIndex].points || 0) >= pointsToRedeem) {
      users[userIndex].points = (users[userIndex].points || 0) - pointsToRedeem;
      LocalDB.saveUsers(users);
      
      const currentUser = LocalDB.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        LocalDB.setCurrentUser({ ...currentUser, points: users[userIndex].points });
      }
      return true;
    }
    return false;
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
