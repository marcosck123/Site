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
import { LocalDB } from './services/localDB';
import { FirebaseService } from './services/firebaseService';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import confetti from 'canvas-confetti';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>(LocalDB.getCart());
  const products = LocalDB.getProducts();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(LocalDB.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'pix' | 'cash' | 'apple'>('pix');
  const [changeFor, setChangeFor] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [timeTheme, setTimeTheme] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  useEffect(() => {
    const syncSettings = async () => {
      try {
        const remoteSettings = await FirebaseService.getSettings();
        if (remoteSettings) {
          localStorage.setItem('doce_entrega_settings', JSON.stringify(remoteSettings));
        }
      } catch (error) {
        console.error('Error syncing settings:', error);
      }
    };
    syncSettings();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUser(userData);
            LocalDB.setCurrentUser(userData);
          } else {
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuário',
              email: firebaseUser.email || '',
              isAdmin: false, // Default new users to not be admin
              avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`,
            };
            await FirebaseService.saveDocument('users', newUser.id, newUser);
            setUser(newUser);
            LocalDB.setCurrentUser(newUser);
          }
        } else {
          setUser(null);
          LocalDB.setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error in onAuthStateChanged, forcing logout:', error);
        await FirebaseService.logout();
        setUser(null);
        LocalDB.setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeTheme('morning');
    else if (hour >= 12 && hour < 18) setTimeTheme('afternoon');
    else setTimeTheme('evening');
  }, []);

  useEffect(() => {
    if (user) {
      const orders = LocalDB.getOrders().filter(o => o.userId === user.id && o.status !== 'Entregue' && o.status !== 'Recusado');
      setActiveOrders(orders);
      LocalDB.checkBirthdayCoupon(user.id);
    } else {
      setActiveOrders([]);
    }
  }, [user]);

  useEffect(() => {
    LocalDB.saveCart(cart);
  }, [cart]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    LocalDB.setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    navigate('/');
  };

  const handleLogout = async () => {
    await FirebaseService.logout();
    setUser(null);
    LocalDB.setCurrentUser(null);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const addToCart = (product: Product) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const settings = LocalDB.getSettings();
    if (settings.inventoryControl && product.stock !== undefined) {
      const inCart = cart.find(item => item.id === product.id)?.quantity || 0;
      if (inCart + 1 > product.stock) {
        alert(`Desculpe, temos apenas ${product.stock} unidades em estoque.`);
        return;
      }
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const reorder = (order: Order) => {
    const newCart: CartItem[] = order.items.map(item => ({
      ...item,
      quantity: item.quantity
    }));
    setCart(newCart);
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    const settings = LocalDB.getSettings();
    
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        
        if (delta > 0 && settings.inventoryControl && product && product.stock !== undefined) {
          if (newQty > product.stock) {
            alert(`Desculpe, temos apenas ${product.stock} unidades em estoque.`);
            return item;
          }
        }
        
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  useEffect(() => {
    if (usePoints && user && user.points) {
      const maxPointsDiscount = Math.floor(user.points / 100) * 10;
      setPointsDiscount(Math.min(maxPointsDiscount, cartTotal));
    } else {
      setPointsDiscount(0);
    }
  }, [usePoints, user, cartTotal]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return cartTotal * (appliedCoupon.discountValue / 100);
    }
    return Math.min(appliedCoupon.discountValue, cartTotal);
  }, [appliedCoupon, cartTotal]);

  const finalTotal = Math.max(0, cartTotal - discountAmount - pointsDiscount);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const freeDeliveryThreshold = 50;
  const deliveryProgress = Math.min(100, (cartTotal / freeDeliveryThreshold) * 100);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartTotal);

  const handleApplyCoupon = () => {
    setCouponError('');
    const coupon = LocalDB.validateCoupon(couponCode);
    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponCode('');
    } else {
      setCouponError('Cupom inválido ou expirado');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleCheckout = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (paymentMethod === 'wallet' && (user.walletBalance || 0) < finalTotal) {
      alert('Saldo insuficiente na carteira! Recarregue no seu perfil.');
      return;
    }

    if (usePoints && pointsDiscount > 0) {
      const pointsToRedeem = (pointsDiscount / 10) * 100;
      LocalDB.redeemPoints(user.id, pointsToRedeem);
      setUser(LocalDB.getCurrentUser());
    }
    
    const newOrder = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      items: cart,
      total: finalTotal,
      status: 'Pendente' as const,
      createdAt: new Date().toISOString(),
      address: user.address || 'Endereço não informado',
      phone: user.phone || 'Telefone não informado',
      paymentMethod,
      changeFor: paymentMethod === 'cash' && changeFor ? parseFloat(changeFor) : undefined,
      couponCode: appliedCoupon?.code,
      isGift,
      giftMessage: isGift ? giftMessage : undefined,
      scheduledFor: scheduledFor || undefined
    };

    LocalDB.addOrder(newOrder);
    setOrderPlaced(true);
    setCart([]);
    setChangeFor('');
    setAppliedCoupon(null);
    setIsGift(false);
    setGiftMessage('');
    setScheduledFor('');
    setUsePoints(false);
    setPointsDiscount(0);
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B6B', '#FFE66D', '#4ECDC4']
    });

    if (user) {
      setActiveOrders(prev => [...prev, newOrder]);
    }
    setTimeout(() => {
      setOrderPlaced(false);
      setIsCartOpen(false);
    }, 3000);
  };

  return (
    <div className={`min-h-screen font-sans text-stone-900 transition-colors duration-1000 ${
      timeTheme === 'morning' ? 'bg-[#F9F5F0]' : 
      timeTheme === 'afternoon' ? 'bg-[#FFF9F0]' : 
      'bg-[#F5F2ED]'
    }`}>
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
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-3 bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 transition-all relative group"
                >
                  <Bell size={24} />
                  {user.notifications?.some(n => !n.isRead) && (
                    <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                  )}
                </button>
                
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-stone-100 py-4 z-50 overflow-hidden"
                    >
                      <div className="px-6 pb-4 border-b border-stone-50 flex justify-between items-center">
                        <h3 className="font-black text-stone-900">Notificações</h3>
                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Recentes</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {user.notifications && user.notifications.length > 0 ? (
                          user.notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => {
                                LocalDB.markNotificationAsRead(user.id, notification.id);
                                setUser(LocalDB.getCurrentUser());
                              }}
                              className={`w-full px-6 py-4 text-left hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0 flex gap-4 ${!notification.isRead ? 'bg-brand-primary/5' : ''}`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                notification.type === 'order' ? 'bg-blue-50 text-blue-500' :
                                notification.type === 'coupon' ? 'bg-emerald-50 text-emerald-500' :
                                'bg-stone-50 text-stone-500'
                              }`}>
                                {notification.type === 'order' ? <Package size={18} /> :
                                 notification.type === 'coupon' ? <Ticket size={18} /> :
                                 <Bell size={18} />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-stone-900">{notification.title}</p>
                                <p className="text-xs text-stone-500 line-clamp-2">{notification.message}</p>
                                <p className="text-[10px] text-stone-400 mt-1 font-medium">{new Date(notification.createdAt).toLocaleDateString()}</p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-brand-primary rounded-full mt-2" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="p-12 text-center">
                            <Bell size={32} className="mx-auto text-stone-200 mb-2" />
                            <p className="text-sm text-stone-400 font-medium">Nenhuma notificação por aqui.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

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
                      <button className="w-full px-4 py-3 text-left text-sm font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-2">
                        <Package size={18} /> Meus Pedidos
                      </button>
                      <div className="h-px bg-stone-100 my-1 mx-4" />
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut size={18} /> Sair
                      </button>
                      <div className="px-4 py-2 bg-stone-50 m-2 rounded-xl">
                        <p className="text-[10px] font-black text-stone-400 uppercase">Seu Código de Indicação</p>
                        <p className="text-sm font-black text-brand-primary">{user.referralCode || 'GERANDO...'}</p>
                      </div>
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
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Products onAddToCart={addToCart} />} />
          <Route path="/admin" element={user?.isAdmin ? <Admin /> : <Home />} />
          <Route path="/perfil" element={user ? <Profile user={user} onUpdate={setUser} onReorder={reorder} /> : <Home />} />
        </Routes>

        <AnimatePresence>
          {activeOrders.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 right-8 w-80 bg-white rounded-3xl shadow-2xl z-50 p-6 border border-stone-100"
            >
              <h3 className="font-bold mb-2">Status do Pedido</h3>
              <p>Seu pedido está a caminho!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-stone-100 py-12 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-stone-500">© 2024 Doce Entrega. Todos os direitos reservados.</p>
        </div>
      </footer>

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
              {cart.length === 0 ? (
                <p>Seu carrinho está vazio.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p>R$ {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
                      <button onClick={() => removeFromCart(item.id)}><X size={16} className="text-red-500" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 md:p-8 border-t border-stone-100 space-y-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>R$ {finalTotal.toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold">Finalizar Pedido</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin}
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
