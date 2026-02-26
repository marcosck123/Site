import { Product, User, CartItem, Order, OrderStatus } from '../types';

const DB_KEYS = {
  PRODUCTS: 'doce_entrega_products',
  USERS: 'doce_entrega_users',
  CART: 'doce_entrega_cart',
  CURRENT_USER: 'doce_entrega_current_user',
  ORDERS: 'doce_entrega_orders',
};

// Initial data if empty
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
  }
};
