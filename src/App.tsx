import { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  X, 
  Ticket,
  ChevronRight,
  LogOut,
  Home as HomeIcon,
  Package,
  User as UserIcon,
  CreditCard,
  Banknote,
  QrCode,
  LayoutDashboard,
  Truck,
  Star,
  Clock,
  CheckCircle,
  Bell,
  Smartphone,
  Gift,
  Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Product, CartItem, User, Coupon, Order } from './types';
import AuthModal from './components/AuthModal';
import { FirebaseService } from './services/firebaseService';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import confetti from 'canvas-confetti';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // To be migrated
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix' | 'cash' | 'apple'>('pix');

  // Seed and subscribe to products
  useEffect(() => {
    FirebaseService.seedInitialData();
    const unsubscribe = FirebaseService.subscribeToProducts(setProducts);
    return () => unsubscribe();
  }, []);

  // Auth, User and Cart subscriptions
  useEffect(() => {
    let unsubscribeFromUser: (() => void) | null = null;
    let unsubscribeFromCart: (() => void) | null = null;

    const unsubscribeFromAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeFromUser) unsubscribeFromUser();
      if (unsubscribeFromCart) unsubscribeFromCart();

      if (firebaseUser) {
        unsubscribeFromUser = FirebaseService.subscribeToUser(firebaseUser.uid, setUser);
        unsubscribeFromCart = FirebaseService.subscribeToCart(firebaseUser.uid, setCartItems);
      } else {
        setUser(null);
        setCartItems([]);
      }
    });

    return () => {
      unsubscribeFromAuth();
      if (unsubscribeFromUser) unsubscribeFromUser();
      if (unsubscribeFromCart) unsubscribeFromCart();
    };
  }, []);

  const handleLogout = async () => {
    await FirebaseService.logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    await FirebaseService.addToCart(user.id, product);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (productId: string) => {
    if (!user) return;
    FirebaseService.removeFromCart(user.id, productId);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    if (!user) return;
    const item = cartItems.find(i => i.id === productId);
    if (item) {
      FirebaseService.updateCartItemQuantity(user.id, productId, item.quantity + delta);
    }
  };

  const handleReorder = async (order: Order) => {
    if (!user) return;
    for (const item of cartItems) {
      await FirebaseService.removeFromCart(user.id, item.id);
    }
    for (const item of order.items) {
      const productDoc: Product = { ...item, stock: undefined, rating: undefined };
      await FirebaseService.addToCart(user.id, productDoc);
    }
    setIsCartOpen(true);
  };
  
  const handleCheckout = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const newOrder = {
      userId: user.id,
      userName: user.name,
      items: cartItems,
      total: cartTotal,
      status: 'Pendente' as const,
      address: user.address || 'Endereço não informado',
      phone: user.phone || 'Telefone não informado',
      paymentMethod,
    };

    await FirebaseService.addDocument('orders', newOrder);
    
    for (const item of cartItems) {
      await FirebaseService.removeFromCart(user.id, item.id);
    }
    
    setOrderPlaced(true);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      setOrderPlaced(false);
      setIsCartOpen(false);
    }, 3000);
  };

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  return (
    <div className="min-h-screen font-sans text-stone-900 bg-[#F9F5F0]">
       <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-secondary shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
              <ShoppingBag size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-stone-900">DOCE<span className="text-brand-primary">ENTREGA</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={`font-bold hover:text-brand-primary transition-colors ${location.pathname === '/' ? 'text-brand-primary' : 'text-stone-600'}`}>Página Inicial</Link>
            <Link to="/produtos" className={`font-bold hover:text-brand-primary transition-colors ${location.pathname === '/produtos' ? 'text-brand-primary' : 'text-stone-600'}`}>Produtos</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-brand-secondary text-brand-primary rounded-2xl hover:bg-brand-primary hover:text-brand-secondary transition-all group"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-brand-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-3 bg-stone-100 rounded-full hover:bg-stone-200 transition-all border border-stone-200"
                >
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                  <span className="text-xs font-bold text-stone-700 hidden sm:inline">{user.name.split(' ')[0]}</span>
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-stone-100 py-2 z-50"
                    >
                      {user.isAdmin && (
                        <Link 
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full px-4 py-3 text-left text-sm font-bold text-brand-primary hover:bg-stone-50 flex items-center gap-2"
                        >
                          <LayoutDashboard size={18} /> Painel Admin
                        </Link>
                      )}
                      <Link 
                        to="/perfil"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full px-4 py-3 text-left text-sm font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <UserIcon size={18} /> Perfil
                      </Link>
                      <div className="h-px bg-stone-100 my-1 mx-4" />
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut size={18} /> Sair
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-brand-primary text-brand-secondary px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:bg-brand-accent transition-all"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home products={products} />} />
          <Route path="/produtos" element={<Products products={products} onAddToCart={handleAddToCart} />} />
          <Route path="/admin" element={user?.isAdmin ? <Admin /> : <Home products={products} />} />
          <Route path="/perfil" element={user ? <Profile user={user} onReorder={handleReorder} /> : <Home products={products} />} />
        </Routes>
      </main>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
        )}
        {isCartOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-6 md:p-8 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Seu Carrinho</h2>
              <button onClick={() => setIsCartOpen(false)}><X /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4">
              {cartItems.length === 0 ? (
                <p>Seu carrinho está vazio.</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p>R$ {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleUpdateQuantity(item.id, -1)}><Minus size={16} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, 1)}><Plus size={16} /></button>
                      <button onClick={() => handleRemoveFromCart(item.id)}><X size={16} className="text-red-500" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 md:p-8 border-t border-stone-100 space-y-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>R$ {cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold">Finalizar Pedido</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
