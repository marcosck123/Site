import { Product, User, CartItem, Order, OrderStatus, Coupon, Review, Driver, AppSettings, Ingredient, Notification, SavedAddress, Mission, AppBanner, FavoriteFolder, WalletTransaction } from '../types';

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
  BANNERS: 'doce_entrega_banners',
  FAVORITE_FOLDERS: 'doce_entrega_favorite_folders',
};

// Initial data if empty
const INITIAL_CATEGORIES = ['Brigadeiros', 'Bolos', 'Tortas', 'Cookies', 'Gelados', 'Bebidas'];
const INITIAL_COUPONS: Coupon[] = [
  {
    id: '1',
    code: 'DOCE20',
    discountType: 'percentage',
    discountValue: 20,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: '2',
    code: 'BEMVINDO',
    discountType: 'fixed',
    discountValue: 10,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  }
];
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Brigadeiro Gourmet Belga',
    description: 'Feito com o melhor chocolate belga Callebaut e granulado artesanal de chocolate amargo.',
    price: 4.50,
    image: 'https://picsum.photos/seed/brigadeiro/400/400',
    category: 'Brigadeiros',
    rating: 4.9,
    deliveryTime: '20-30 min',
    stock: 100,
    tags: ['mais-vendido', 'chocolate']
  },
  {
    id: '2',
    name: 'Bolo de Cenoura com Brigadeiro',
    description: 'Massa fofinha de cenoura com uma camada generosa de brigadeiro artesanal cremoso.',
    price: 15.00,
    image: 'https://picsum.photos/seed/cake/400/400',
    category: 'Bolos',
    rating: 4.8,
    deliveryTime: '30-40 min',
    stock: 20,
    tags: ['classico']
  },
  {
    id: '3',
    name: 'Torta de Limão Siciliano',
    description: 'Base crocante de biscoito, creme de limão siciliano aveludado e merengue suíço maçaricado.',
    price: 18.00,
    image: 'https://picsum.photos/seed/lemon/400/400',
    category: 'Tortas',
    rating: 4.7,
    deliveryTime: '25-35 min',
    stock: 15,
    tags: ['refrescante']
  },
  {
    id: '4',
    name: 'Cookie Double Chocolate',
    description: 'Cookie americano autêntico com gotas de chocolate ao leite e meio amargo, crocante por fora e macio por dentro.',
    price: 8.50,
    image: 'https://picsum.photos/seed/cookie/400/400',
    category: 'Cookies',
    rating: 4.9,
    deliveryTime: '15-25 min',
    stock: 50,
    tags: ['vegano']
  }
];

export const LocalDB = {
  // Helper for localStorage
  _get: <T>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  _save: <T>(key: string, data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Products
  getProducts: (): Product[] => LocalDB._get(DB_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProducts: (products: Product[]) => LocalDB._save(DB_KEYS.PRODUCTS, products),
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
    LocalDB.saveProducts(products.filter(p => p.id !== id));
  },

  // Ingredients
  getIngredients: (): Ingredient[] => LocalDB._get(DB_KEYS.INGREDIENTS, []),
  saveIngredients: (ingredients: Ingredient[]) => LocalDB._save(DB_KEYS.INGREDIENTS, ingredients),
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
    LocalDB.saveIngredients(ingredients.filter(i => i.id !== id));
  },

  // User Auth
  getUsers: (): User[] => LocalDB._get(DB_KEYS.USERS, []),
  saveUsers: (users: User[]) => LocalDB._save(DB_KEYS.USERS, users),
  registerUser: (user: User) => {
    const users = LocalDB.getUsers();
    users.push(user);
    LocalDB.saveUsers(users);
  },
  getCurrentUser: (): User | null => LocalDB._get(DB_KEYS.CURRENT_USER, null),
  setCurrentUser: (user: User | null) => {
    if (user) {
      LocalDB._save(DB_KEYS.CURRENT_USER, user);
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
    if (index === -1) favorites.push(productId);
    else favorites.splice(index, 1);
    LocalDB.setCurrentUser({ ...user, favorites });
  },

  // Cart
  getCart: (): CartItem[] => LocalDB._get(DB_KEYS.CART, []),
  saveCart: (cart: CartItem[]) => LocalDB._save(DB_KEYS.CART, cart),

  // Orders
  getOrders: (): Order[] => LocalDB._get(DB_KEYS.ORDERS, []),
  saveOrders: (orders: Order[]) => LocalDB._save(DB_KEYS.ORDERS, orders),
  addOrder: (order: Order) => {
    const orders = LocalDB.getOrders();
    const isGoldenTicket = Math.random() < 0.05;
    const orderWithGoldenTicket = { ...order, isGoldenTicket, goldenTicketClaimed: false };
    orders.push(orderWithGoldenTicket);
    LocalDB.saveOrders(orders);

    // Wallet Payment
    if (order.paymentMethod === 'wallet') {
      const users = LocalDB.getUsers();
      const uIdx = users.findIndex(u => u.id === order.userId);
      if (uIdx !== -1) {
        users[uIdx].walletBalance = (users[uIdx].walletBalance || 0) - order.total;
        
        // Add transaction to history
        const transactions = LocalDB.getWalletTransactions();
        transactions.push({
          id: Math.random().toString(36).substr(2, 9),
          userId: order.userId,
          userName: order.userName,
          amount: order.total,
          type: 'debit',
          description: `Pagamento de Pedido #${order.id.slice(-6)}`,
          status: 'approved',
          createdAt: new Date().toISOString()
        });
        LocalDB.saveWalletTransactions(transactions);
        LocalDB.saveUsers(users);
        
        const current = LocalDB.getCurrentUser();
        if (current?.id === order.userId) LocalDB.setCurrentUser(users[uIdx]);
      }
    }

    const settings = LocalDB.getSettings();
    if (settings.inventoryControl) {
      const products = LocalDB.getProducts();
      order.items.forEach(item => {
        const p = products.find(p => p.id === item.id);
        if (p && p.stock !== undefined) p.stock = Math.max(0, p.stock - item.quantity);
      });
      LocalDB.saveProducts(products);
    }

    if (settings.loyaltyProgram) {
      const users = LocalDB.getUsers();
      const uIdx = users.findIndex(u => u.id === order.userId);
      if (uIdx !== -1) {
        let points = Math.floor(order.total);
        if (new Date().getHours() < 14) {
          points += 10;
          LocalDB.addNotification(order.userId, {
            id: Math.random().toString(36).substr(2, 9),
            title: '🎯 Missão Cumprida!',
            message: 'Você pediu antes das 14h e ganhou 10 pontos extras!',
            type: 'order',
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
        users[uIdx].points = (users[uIdx].points || 0) + points;
        LocalDB.saveUsers(users);
        LocalDB.updateLoyaltyTier(order.userId);
        const current = LocalDB.getCurrentUser();
        if (current?.id === order.userId) LocalDB.setCurrentUser(users[uIdx]);
      }
    }
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const orders = LocalDB.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      LocalDB.saveOrders(orders);
      LocalDB.addNotification(orders[idx].userId, {
        id: Math.random().toString(36).substr(2, 9),
        title: 'Status do Pedido Atualizado',
        message: `Seu pedido #${orderId.slice(-6)} agora está: ${status}`,
        type: 'order',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  },

  // Categories
  getCategories: (): string[] => LocalDB._get(DB_KEYS.CATEGORIES, INITIAL_CATEGORIES),
  saveCategories: (categories: string[]) => LocalDB._save(DB_KEYS.CATEGORIES, categories),

  // Coupons
  getCoupons: (): Coupon[] => {
    const coupons = LocalDB._get(DB_KEYS.COUPONS, INITIAL_COUPONS);
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
  saveCoupons: (coupons: Coupon[]) => LocalDB._save(DB_KEYS.COUPONS, coupons),
  addCoupon: (coupon: Coupon) => {
    const coupons = LocalDB.getCoupons();
    coupons.push(coupon);
    LocalDB.saveCoupons(coupons);
  },
  deleteCoupon: (id: string) => LocalDB.saveCoupons(LocalDB.getCoupons().filter(c => c.id !== id)),
  validateCoupon: (code: string): Coupon | null => {
    const coupon = LocalDB.getCoupons().find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    return (coupon && new Date(coupon.expiresAt) >= new Date()) ? coupon : null;
  },

  // Reviews
  getReviews: (productId?: string): Review[] => {
    const reviews = LocalDB._get(DB_KEYS.REVIEWS, []);
    return productId ? reviews.filter(r => r.productId === productId) : reviews;
  },
  addReview: (review: Review) => {
    const reviews = LocalDB.getReviews();
    reviews.push(review);
    LocalDB._save(DB_KEYS.REVIEWS, reviews);
  },

  // Drivers
  getDrivers: (): Driver[] => LocalDB._get(DB_KEYS.DRIVERS, []),
  saveDrivers: (drivers: Driver[]) => LocalDB._save(DB_KEYS.DRIVERS, drivers),

  // Settings
  getSettings: (): AppSettings => LocalDB._get(DB_KEYS.SETTINGS, {
    darkMode: false,
    inventoryControl: true,
    loyaltyProgram: true,
    isStoreOpen: true,
    pixKey: '12.345.678/0001-90',
    pixName: 'Doce Entrega LTDA',
    banners: [
      {
        id: '1',
        image: 'https://picsum.photos/seed/promo1/1200/400',
        title: 'Festival de Brigadeiros',
        subtitle: 'Leve 3, Pague 2 em todos os brigadeiros gourmet.',
        isActive: true
      }
    ]
  }),
  saveSettings: (settings: AppSettings) => LocalDB._save(DB_KEYS.SETTINGS, settings),

  // Wallet
  updateWalletBalance: (userId: string, amount: number) => {
    const users = LocalDB.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].walletBalance = (users[idx].walletBalance || 0) + amount;
      LocalDB.saveUsers(users);
      const current = LocalDB.getCurrentUser();
      if (current?.id === userId) LocalDB.setCurrentUser(users[idx]);
    }
  },

  // Banners
  getBanners: (): AppBanner[] => LocalDB.getSettings().banners || [],
  saveBanners: (banners: AppBanner[]) => {
    const settings = LocalDB.getSettings();
    settings.banners = banners;
    LocalDB.saveSettings(settings);
  },

  // Favorite Folders
  getFavoriteFolders: (userId?: string): FavoriteFolder[] => {
    if (!userId) return LocalDB._get(DB_KEYS.FAVORITE_FOLDERS, []);
    const users = LocalDB.getUsers();
    return users.find(u => u.id === userId)?.favoriteFolders || [];
  },
  saveFavoriteFolders: (folders: FavoriteFolder[], userId?: string) => {
    if (!userId) {
      LocalDB._save(DB_KEYS.FAVORITE_FOLDERS, folders);
      return;
    }
    const users = LocalDB.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].favoriteFolders = folders;
      LocalDB.saveUsers(users);
      const current = LocalDB.getCurrentUser();
      if (current?.id === userId) LocalDB.setCurrentUser(users[idx]);
    }
  },

  // Admin Reports
  getAbandonedCarts: () => {
    const users = LocalDB.getUsers();
    const orders = LocalDB.getOrders();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return users.filter(u => {
      const hasRecentOrder = orders.some(o => o.userId === u.id && new Date(o.createdAt) > oneDayAgo);
      return !hasRecentOrder; // Simplified
    });
  },

  getDeliveryHeatmap: () => {
    const heatmap: Record<string, number> = {};
    LocalDB.getOrders().forEach(o => {
      const neighborhood = o.address.split(',')[1]?.trim() || 'Outros';
      heatmap[neighborhood] = (heatmap[neighborhood] || 0) + 1;
    });
    return Object.entries(heatmap).map(([name, value]) => ({ name, value }));
  },

  getFinancialReport: () => {
    const orders = LocalDB.getOrders().filter(o => o.status === 'Entregue');
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const cost = orders.reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + (item.costPrice || item.price * 0.4) * item.quantity, 0), 0);
    return { revenue, cost, profit: revenue - cost, margin: revenue ? ((revenue - cost) / revenue) * 100 : 0 };
  },

  // Referral
  generateReferralCode: (userName: string): string => `${userName.slice(0, 3).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
  applyReferral: (code: string) => {
    const users = LocalDB.getUsers();
    const referrer = users.find(u => u.referralCode === code);
    if (referrer) {
      referrer.points = (referrer.points || 0) + 50;
      LocalDB.saveUsers(users);
      return true;
    }
    return false;
  },

  redeemPoints: (userId: string, points: number): boolean => {
    const users = LocalDB.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1 && (users[idx].points || 0) >= points) {
      users[idx].points = (users[idx].points || 0) - points;
      LocalDB.saveUsers(users);
      const current = LocalDB.getCurrentUser();
      if (current?.id === userId) LocalDB.setCurrentUser({ ...current, points: users[idx].points });
      return true;
    }
    return false;
  },

  // Popular Products
  getPopularProducts: (limit: number = 4): Product[] => {
    const counts: Record<string, number> = {};
    LocalDB.getOrders().forEach(o => o.items.forEach(i => counts[i.id] = (counts[i.id] || 0) + i.quantity));
    return LocalDB.getProducts()
      .map(p => ({ ...p, sales: counts[p.id] || 0 }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  },

  // Addresses
  addAddress: (userId: string, address: SavedAddress) => {
    const users = LocalDB.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      if (!users[idx].savedAddresses) users[idx].savedAddresses = [];
      users[idx].savedAddresses!.push(address);
      LocalDB.saveUsers(users);
      const current = LocalDB.getCurrentUser();
      if (current?.id === userId) LocalDB.setCurrentUser({ ...current, savedAddresses: users[idx].savedAddresses });
    }
  },
  deleteAddress: (userId: string, addressId: string) => {
    const users = LocalDB.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1 && users[idx].savedAddresses) {
      users[idx].savedAddresses = users[idx].savedAddresses!.filter(a => a.id !== addressId);
      LocalDB.saveUsers(users);
      const current = LocalDB.getCurrentUser();
      if (current?.id === userId) LocalDB.setCurrentUser({ ...current, savedAddresses: users[idx].savedAddresses });
    }
  },

  // Notifications
  addNotification: (userId: string, notification: Notification) => {
    const users = LocalDB.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      if (!users[idx].notifications) users[idx].notifications = [];
      users[idx].notifications!.unshift(notification);
      LocalDB.saveUsers(users);
      const current = LocalDB.getCurrentUser();
      if (current?.id === userId) LocalDB.setCurrentUser({ ...current, notifications: users[idx].notifications });
    }
  },
  markNotificationAsRead: (userId: string, notificationId: string) => {
    const users = LocalDB.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1 && users[idx].notifications) {
      const nIdx = users[idx].notifications!.findIndex(n => n.id === notificationId);
      if (nIdx !== -1) {
        users[idx].notifications![nIdx].isRead = true;
        LocalDB.saveUsers(users);
        const current = LocalDB.getCurrentUser();
        if (current?.id === userId) LocalDB.setCurrentUser({ ...current, notifications: users[idx].notifications });
      }
    }
  },

  // Flash Sales
  getFlashSales: (): Product[] => LocalDB.getProducts().filter(p => p.flashSalePrice && p.flashSaleEnd && new Date(p.flashSaleEnd) > new Date()),

  // Missions
  getMissions: (): Mission[] => {
    const now = new Date();
    return [
      { id: 'early-bird', title: 'Pássaro Madrugador', description: 'Peça um doce antes das 14:00 para ganhar pontos extras!', rewardPoints: 10, isCompleted: false, expiresAt: new Date(now.setHours(14, 0, 0, 0)).toISOString() },
      { id: 'sweet-tooth', title: 'Formiguinha', description: 'Faça 3 pedidos em uma semana.', rewardPoints: 50, isCompleted: false, expiresAt: new Date(now.setDate(now.getDate() + 7)).toISOString() }
    ];
  },

  // Subscription
  subscribeToSweetClub: (userId: string, plan: 'Mensal' | 'Anual') => {
    const users = LocalDB.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      const next = new Date();
      next.setDate(next.getDate() + 7);
      users[idx].subscription = { plan, status: 'Ativo', nextBoxDate: next.toISOString() };
      LocalDB.saveUsers(users);
      const current = LocalDB.getCurrentUser();
      if (current?.id === userId) LocalDB.setCurrentUser(users[idx]);
    }
  },

  // Loyalty Tiers
  updateLoyaltyTier: (userId: string) => {
    const users = LocalDB.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      const pts = users[idx].points || 0;
      users[idx].loyaltyTier = pts >= 1000 ? 'Ouro' : pts >= 500 ? 'Prata' : 'Bronze';
      LocalDB.saveUsers(users);
      const current = LocalDB.getCurrentUser();
      if (current?.id === userId) LocalDB.setCurrentUser(users[idx]);
    }
  },

  // Birthday Coupon
  checkBirthdayCoupon: (userId: string) => {
    const user = LocalDB.getCurrentUser();
    if (!user || !user.birthday) return;
    const today = new Date();
    const bday = new Date(user.birthday);
    if (today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate()) {
      const code = `BDAY-${user.id.slice(0, 4)}`;
      if (!LocalDB.getCoupons().some(c => c.code === code)) {
        const coupon: Coupon = { id: `bday-${user.id}`, code, discountValue: 100, discountType: 'fixed', isActive: true, expiresAt: new Date(today.setDate(today.getDate() + 7)).toISOString() };
        LocalDB.addCoupon(coupon);
        LocalDB.addNotification(user.id, { id: Math.random().toString(36).substr(2, 9), title: '🎁 Feliz Aniversário!', message: `Parabéns! Você ganhou um cupom de R$ 100: ${code}`, type: 'order', isRead: false, createdAt: new Date().toISOString() });
      }
    }
  },

  // Golden Ticket
  claimGoldenTicket: (orderId: string) => {
    const orders = LocalDB.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].goldenTicketClaimed = true;
      LocalDB.saveOrders(orders);
    }
  },

  updateUserPoints: (userId: string, points: number) => {
    const users = LocalDB.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, points } : u);
    LocalDB._save(DB_KEYS.USERS, updated);
    
    const currentUser = LocalDB.getCurrentUser();
    if (currentUser?.id === userId) {
      LocalDB.setCurrentUser({ ...currentUser, points });
    }
  },

  getStats: () => {
    const orders = LocalDB.getOrders();
    const products = LocalDB.getProducts();
    const users = LocalDB.getUsers();
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = orders.length;
    const totalLoyaltyPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);
    const totalInventoryStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    return {
      totalRevenue,
      orderCount,
      totalLoyaltyPoints,
      totalInventoryStock
    };
  },

  // Wallet
  getWalletTransactions: (userId?: string): WalletTransaction[] => {
    const allTransactions = LocalDB._get<WalletTransaction[]>('doce_entrega_wallet_tx', []);
    return userId ? allTransactions.filter(tx => tx.userId === userId) : allTransactions;
  },
  saveWalletTransactions: (transactions: WalletTransaction[]) => {
    LocalDB._save('doce_entrega_wallet_tx', transactions);
  },
  requestCredits: (userId: string, userName: string, amount: number, proofImage: string) => {
    const transactions = LocalDB.getWalletTransactions();
    const newTx: WalletTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      amount,
      type: 'credit',
      description: 'Recarga de Carteira',
      status: 'pending',
      proofImage,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTx);
    LocalDB.saveWalletTransactions(transactions);
  },
  approveCreditRequest: (txId: string) => {
    const transactions = LocalDB.getWalletTransactions();
    const idx = transactions.findIndex(tx => tx.id === txId);
    if (idx !== -1 && transactions[idx].status === 'pending') {
      transactions[idx].status = 'approved';
      LocalDB.saveWalletTransactions(transactions);
      
      const users = LocalDB.getUsers();
      const uIdx = users.findIndex(u => u.id === transactions[idx].userId);
      if (uIdx !== -1) {
        users[uIdx].walletBalance = (users[uIdx].walletBalance || 0) + transactions[idx].amount;
        LocalDB.saveUsers(users);
        
        LocalDB.addNotification(transactions[idx].userId, {
          id: Math.random().toString(36).substr(2, 9),
          title: '💰 Créditos Adicionados!',
          message: `Sua recarga de R$ ${transactions[idx].amount.toFixed(2)} foi aprovada!`,
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString()
        });
        
        const current = LocalDB.getCurrentUser();
        if (current?.id === transactions[idx].userId) LocalDB.setCurrentUser(users[uIdx]);
      }
    }
  },
  rejectCreditRequest: (txId: string) => {
    const transactions = LocalDB.getWalletTransactions();
    const idx = transactions.findIndex(tx => tx.id === txId);
    if (idx !== -1 && transactions[idx].status === 'pending') {
      transactions[idx].status = 'rejected';
      LocalDB.saveWalletTransactions(transactions);
      
      LocalDB.addNotification(transactions[idx].userId, {
        id: Math.random().toString(36).substr(2, 9),
        title: '❌ Recarga Recusada',
        message: `Sua solicitação de recarga foi recusada. Verifique o comprovante enviado.`,
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  },
};
