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
          const localSettings = LocalDB.getSettings();
          // Apenas salva se houver diferença para evitar loops
          if (JSON.stringify(remoteSettings) !== JSON.stringify(localSettings)) {
            localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(remoteSettings));
          }
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
            // Fallback para caso o doc não exista (raro, mas seguro)
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuário',
              email: firebaseUser.email || '',
              isAdmin: firebaseUser.email === 'marcoseduardock@gmail.com',
              avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`,
            };
            setUser(newUser);
            LocalDB.setCurrentUser(newUser);
            // Tenta salvar no firestore se não existir
            await FirebaseService.saveDocument('users', newUser.id, newUser);
          }
        } else {
          setUser(null);
          LocalDB.setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error in onAuthStateChanged:', error);
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
    }
  }, [user]);

  useEffect(() => {
    LocalDB.saveCart(cart);
  }, [cart]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    LocalDB.setCurrentUser(newUser);
    setIsAuthModalOpen(false); // Fecha o modal
    navigate('/'); // Redireciona para a página inicial
  };

  const handleLogout = async () => {
    await FirebaseService.logout();
    setUser(null);
    LocalDB.setCurrentUser(null);
    setIsUserMenuOpen(false);
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
      // 100 points = R$ 10 discount
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

    // Update active orders
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
      {/* Header */}
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

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Products onAddToCart={addToCart} />} />
          <Route path="/admin" element={user?.isAdmin ? <Admin /> : <Home />} />
          <Route path="/perfil" element={user ? <Profile user={user} onUpdate={setUser} onReorder={reorder} /> : <Home />} />
        </Routes>

        {/* Active Order Tracking Widget */}
        <AnimatePresence>
          {activeOrders.length > 0 && (
            <>
              {/* Floating Toggle Button */}
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => setIsOrderTrackingOpen(!isOrderTrackingOpen)}
                className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-brand-primary text-brand-secondary rounded-full shadow-2xl z-50 flex items-center justify-center hover:scale-110 transition-all border-4 border-white"
              >
                {isOrderTrackingOpen ? <X size={24} /> : <Truck size={24} />}
                {!isOrderTrackingOpen && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    1
                  </span>
                )}
              </motion.button>

              {/* Tracking Modal/Pop-up */}
              <AnimatePresence>
                {isOrderTrackingOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsOrderTrackingOpen(false)}
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[51]"
                    />
                    <motion.div 
                      initial={{ y: 100, opacity: 0, scale: 0.9 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: 100, opacity: 0, scale: 0.9 }}
                      className="fixed bottom-40 md:bottom-24 right-6 w-[calc(100vw-3rem)] md:w-96 bg-white rounded-[40px] shadow-2xl border border-stone-100 z-[52] overflow-hidden"
                    >
                      <div className="bg-brand-primary p-6 text-brand-secondary flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Truck size={20} />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70 block">Status do Pedido</span>
                            <span className="text-sm font-black">#{activeOrders[0].id.slice(-6)}</span>
                          </div>
                        </div>
                        <button onClick={() => setIsOrderTrackingOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <X size={20} />
                        </button>
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-black text-stone-900">{activeOrders[0].status}</span>
                          <span className="text-[10px] text-stone-400 font-black uppercase tracking-wider">Tempo Real</span>
                        </div>
                        
                        <div className="relative h-3 bg-stone-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ 
                              width: activeOrders[0].status === 'Pendente' ? '25%' : 
                                     activeOrders[0].status === 'Aceito' ? '50%' : 
                                     activeOrders[0].status === 'Em Trânsito' ? '75%' : '100%' 
                            }}
                            className="absolute top-0 left-0 h-full bg-brand-primary shadow-[0_0_15px_rgba(255,107,107,0.4)]"
                          />
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Pendente', icon: Clock },
                            { label: 'Aceito', icon: CheckCircle },
                            { label: 'Em Trânsito', icon: Truck },
                            { label: 'Entregue', icon: Star }
                          ].map((step, idx) => {
                            const statuses = ['Pendente', 'Aceito', 'Em Trânsito', 'Entregue'];
                            const currentIdx = statuses.indexOf(activeOrders[0].status);
                            const isActive = idx <= currentIdx;
                            
                            return (
                              <div key={step.label} className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-brand-primary text-brand-secondary shadow-lg shadow-brand-primary/20' : 'bg-stone-100 text-stone-300'}`}>
                                  <step.icon size={14} />
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'text-brand-primary' : 'text-stone-300'}`}>{step.label}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                          <p className="text-xs text-stone-600 text-center font-medium leading-relaxed">
                            {activeOrders[0].status === 'Pendente' && 'Seu pedido foi recebido e está aguardando confirmação da nossa equipe.'}
                            {activeOrders[0].status === 'Aceito' && 'Oba! Seu doce já está sendo preparado com todo carinho e higiene.'}
                            {activeOrders[0].status === 'Em Trânsito' && 'Prepare o coração! O entregador já saiu com a sua doçura.'}
                            {activeOrders[0].status === 'Entregue' && 'Pedido entregue! Esperamos que você aproveite cada pedaço.'}
                          </p>
                        </div>

                        {activeOrders[0].status === 'Em Trânsito' && (
                          <div className="relative h-32 bg-stone-100 rounded-3xl overflow-hidden border border-stone-200">
                            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-46.6333,-23.5505,13/400x200?access_token=pk.eyJ1IjoiYWlzdHVkaW8iLCJhIjoiY2x0eGZ6eGZ6MGZ6eTJxbXp6eTJxbXp6ZSJ9')] bg-cover bg-center opacity-50" />
                            <motion.div 
                              animate={{ 
                                x: [0, 100, 50, 150],
                                y: [0, -20, 10, -30]
                              }}
                              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary"
                            >
                              <Truck size={24} className="drop-shadow-lg" />
                            </motion.div>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-stone-100 shadow-sm">
                              <span className="text-[9px] font-black text-stone-900 uppercase tracking-widest">Entregador a caminho</span>
                            </div>
                          </div>
                        )}

                        <button 
                          onClick={() => {
                            setIsOrderTrackingOpen(false);
                            window.location.href = '/perfil';
                          }}
                          className="w-full py-4 rounded-2xl border-2 border-stone-100 text-stone-500 font-bold text-xs hover:bg-stone-50 transition-all uppercase tracking-widest"
                        >
                          Ver Detalhes no Perfil
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 pt-16 pb-32 md:pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-secondary">
                  <ShoppingBag size={24} />
                </div>
                <span className="text-xl font-black tracking-tighter">DOCE<span className="text-brand-primary">ENTREGA</span></span>
              </Link>
              <p className="text-stone-500 max-w-sm mb-8">
                Levando a doçura que você merece diretamente para o seu lar. Qualidade artesanal com entrega rápida e segura.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-stone-900 mb-6">Links Rápidos</h4>
              <ul className="space-y-4 text-stone-500">
                <li><Link to="/" className="hover:text-brand-primary transition-colors">Início</Link></li>
                <li><Link to="/produtos" className="hover:text-brand-primary transition-colors">Produtos</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-6">Suporte</h4>
              <ul className="space-y-4 text-stone-500">
                <li><button className="hover:text-brand-primary transition-colors">Contato</button></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-400">
            <p>© 2024 Doce Entrega. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <span>Feito com ❤️ por Marcos CK</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full md:max-w-md bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-stone-900">Seu Carrinho</h2>
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-3 hover:bg-stone-100 rounded-2xl text-stone-400 transition-all active:scale-90"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                {user && LocalDB.getSettings().loyaltyProgram && (user.points || 0) >= 100 && (
                  <div className="bg-brand-primary/5 border border-brand-primary/10 p-5 rounded-[32px] space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-brand-primary" />
                        <span className="text-sm font-bold text-stone-900">Programa de Fidelidade</span>
                      </div>
                      <button 
                        onClick={() => setUsePoints(!usePoints)}
                        className={`w-10 h-5 rounded-full transition-all relative ${usePoints ? 'bg-brand-primary' : 'bg-stone-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${usePoints ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <p className="text-xs text-stone-500">
                      Você tem <span className="font-bold text-brand-primary">{user.points} pontos</span>. 
                      Use 100 pontos para ganhar R$ 10,00 de desconto!
                    </p>
                    {usePoints && pointsDiscount > 0 && (
                      <p className="text-[10px] font-black text-emerald-500 uppercase mt-2">
                        Desconto de R$ {pointsDiscount.toFixed(2)} aplicado!
                      </p>
                    )}
                  </div>
                )}

                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <div className="w-24 h-24 bg-stone-50 rounded-[32px] flex items-center justify-center mb-6 border border-stone-100">
                      <ShoppingBag size={40} className="text-stone-200" />
                    </div>
                    <h3 className="text-xl font-black text-stone-900">Carrinho Vazio</h3>
                    <p className="text-stone-400 mt-2 max-w-[240px] text-sm leading-relaxed">
                      Sua sacola está esperando por algumas doçuras artesanais.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <motion.div 
                        layout
                        key={item.id} 
                        className="flex gap-4 group bg-white p-2 rounded-[32px] hover:bg-stone-50 transition-all border border-transparent hover:border-stone-100"
                      >
                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-stone-100 shadow-sm">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 py-1 pr-2">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{item.name}</h4>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-stone-400 text-[10px] font-bold uppercase mb-4 tracking-wider">R$ {item.price.toFixed(2)} / un</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 bg-white rounded-xl p-1 border border-stone-100 shadow-sm">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-all active:scale-90"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-black text-sm w-6 text-center text-stone-900">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-all active:scale-90"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="font-black text-stone-900 text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {cart.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-stone-100">
                    <h4 className="text-sm font-black text-stone-900 mb-4 uppercase tracking-wider">Que tal acompanhar?</h4>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {LocalDB.getPopularProducts(3).filter(p => !cart.find(c => c.id === p.id)).map(product => (
                        <button 
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="flex-shrink-0 w-32 text-left group"
                        >
                          <div className="w-32 h-32 rounded-2xl overflow-hidden mb-2 border border-stone-100">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                          <p className="text-xs font-bold text-stone-900 truncate">{product.name}</p>
                          <p className="text-[10px] font-black text-brand-primary">R$ {product.price.toFixed(2)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 md:p-8 bg-stone-50 border-t border-stone-100 space-y-6">
                  {/* Free Delivery Progress */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Progresso Frete Grátis</span>
                      <span className="text-[10px] font-black text-brand-primary">
                        {remainingForFreeDelivery > 0 
                          ? `Faltam R$ ${remainingForFreeDelivery.toFixed(2)}` 
                          : 'Frete Grátis Liberado! 🎉'}
                      </span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${deliveryProgress}%` }}
                        className="h-full bg-brand-primary shadow-[0_0_10px_rgba(255,107,107,0.3)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-stone-500 text-xs font-bold uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-stone-900">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-stone-500 text-xs font-bold uppercase tracking-widest">
                      <span>Entrega</span>
                      <span className="text-emerald-500">Grátis</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-emerald-500 text-xs font-black uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                          <span>Desconto ({appliedCoupon.code})</span>
                          <button onClick={handleRemoveCoupon} className="p-1 hover:bg-emerald-100 rounded-lg transition-all">
                            <X size={12} />
                          </button>
                        </div>
                        <span>- R$ {discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {usePoints && pointsDiscount > 0 && (
                      <div className="flex justify-between items-center text-emerald-500 text-xs font-black uppercase tracking-widest">
                        <span>Desconto Fidelidade</span>
                        <span>- R$ {pointsDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
                      <span className="text-sm font-black text-stone-900 uppercase tracking-widest">Total Final</span>
                      <span className="text-2xl font-black text-brand-primary">R$ {finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input 
                          type="text" 
                          placeholder="Cupom"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full bg-white border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 outline-none text-xs font-bold uppercase"
                        />
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleApplyCoupon}
                        className="bg-brand-secondary text-brand-primary px-6 rounded-2xl font-black hover:bg-brand-primary hover:text-brand-secondary transition-all text-xs uppercase tracking-widest"
                      >
                        Ok
                      </motion.button>
                    </div>
                    {couponError && <p className="text-[10px] text-red-500 font-bold ml-1">{couponError}</p>}

                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'pix', icon: QrCode, label: 'Pix' },
                        { id: 'credit', icon: CreditCard, label: 'Cartão' },
                        { id: 'cash', icon: Banknote, label: 'Dinheiro' },
                        { id: 'wallet', icon: Wallet, label: 'Carteira' }
                      ].map(method => (
                        <button 
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${paymentMethod === method.id ? 'bg-brand-primary/5 border-brand-primary text-brand-primary shadow-sm' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'}`}
                        >
                          <method.icon size={18} />
                          <span className="text-[8px] font-black uppercase tracking-widest">{method.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-2xl border border-stone-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-stone-400" />
                            <span className="text-xs font-black text-stone-900 uppercase tracking-widest">Entrega</span>
                          </div>
                          <select 
                            className="text-xs font-bold text-brand-primary bg-transparent outline-none"
                            onChange={(e) => setScheduledFor(e.target.value)}
                          >
                            <option value="">O mais rápido possível</option>
                            <option value="today-18">Hoje, 18:00 - 19:00</option>
                            <option value="today-19">Hoje, 19:00 - 20:00</option>
                            <option value="tomorrow-10">Amanhã, 10:00 - 11:00</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {paymentMethod === 'cash' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <input 
                          type="number" 
                          placeholder="Troco para quanto?"
                          value={changeFor}
                          onChange={(e) => setChangeFor(e.target.value)}
                          className="w-full bg-white border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none text-xs font-bold"
                        />
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
                            <ShoppingBag size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-stone-900">Modo Presente</p>
                            <p className="text-[10px] text-stone-400">Embalagem especial e cartão</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsGift(!isGift)}
                          className={`w-12 h-6 rounded-full transition-all relative ${isGift ? 'bg-pink-500' : 'bg-stone-200'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isGift ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>

                      {isGift && (
                        <textarea 
                          placeholder="Escreva sua mensagem personalizada aqui..."
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          className="w-full bg-white border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm h-20 resize-none"
                        />
                      )}
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCheckout}
                      disabled={orderPlaced}
                      className="w-full bg-brand-primary text-brand-secondary py-5 rounded-[32px] font-black text-lg shadow-xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {orderPlaced ? 'Pedido Realizado! 🎉' : 'Finalizar Pedido'}
                      {!orderPlaced && <ChevronRight size={20} />}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Order Tracking Toggle */}
      {activeOrders.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOrderTrackingOpen(true)}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-brand-primary text-brand-secondary rounded-full shadow-2xl flex items-center justify-center z-[40] group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Clock size={28} className="relative z-10" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
        </motion.button>
      )}

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
