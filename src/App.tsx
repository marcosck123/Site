import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Star, 
  Clock, 
  Plus, 
  Minus, 
  X, 
  ChevronRight,
  Heart,
  MapPin,
  ArrowLeft,
  Bell,
  BellOff,
  Sparkles,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS, CATEGORIES } from './constants';
import { Product, CartItem, Category, User } from './types';
import { NotificationService } from './services/notificationService';
import AuthModal from './components/AuthModal';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(NotificationService.getPermissionStatus());
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    // Firebase Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuário',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`
        });
      } else {
        setUser(null);
      }
    });

    // Show prompt after 3 seconds if permission is still default
    if (notificationPermission === 'default') {
      const timer = setTimeout(() => setShowNotificationPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => unsubscribe();
  }, [notificationPermission]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const handleRequestPermission = async () => {
    const permission = await NotificationService.requestPermission();
    setNotificationPermission(permission);
    setShowNotificationPrompt(false);
    
    if (permission === 'granted') {
      NotificationService.sendNotification('Bem-vindo ao Doce Entrega! 🍭', {
        body: 'Você agora receberá nossas melhores promoções em primeira mão.',
      });
    }
  };

  const simulatePromotion = () => {
    if (notificationPermission === 'granted') {
      NotificationService.sendNotification('PROMOÇÃO RELÂMPAGO! ⚡', {
        body: 'Toda a categoria de Brigadeiros com 30% de desconto nos próximos 15 minutos!',
        tag: 'promo-brigadeiro'
      });
    } else {
      handleRequestPermission();
    }
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setCart([]);
    setIsCartOpen(false);
    setTimeout(() => setOrderPlaced(false), 5000);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-100 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
              <ShoppingBag size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">
              Doce<span className="text-brand-primary">Entrega</span>
            </h1>
          </div>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar doces, bolos, tortas..."
              className="w-full bg-stone-100 border-none rounded-full py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={simulatePromotion}
              className={`p-2 rounded-full transition-all ${
                notificationPermission === 'granted' 
                  ? 'text-brand-primary hover:bg-brand-secondary' 
                  : 'text-stone-400 hover:bg-stone-100'
              }`}
              title={notificationPermission === 'granted' ? "Simular Promoção" : "Ativar Notificações"}
            >
              {notificationPermission === 'granted' ? <Bell size={22} /> : <BellOff size={22} />}
            </button>

            <div className="relative">
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 pr-3 hover:bg-stone-100 rounded-full transition-colors"
                  >
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border-2 border-brand-primary/20" />
                    <span className="text-sm font-bold text-stone-900 hidden sm:block">{user.name.split(' ')[0]}</span>
                  </button>
                  
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-20"
                        >
                          <div className="px-4 py-2 border-b border-stone-50 mb-1">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Minha Conta</p>
                          </div>
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                            <UserIcon size={16} />
                            Perfil
                          </button>
                          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                            <ShoppingBag size={16} />
                            Meus Pedidos
                          </button>
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={16} />
                            Sair
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-brand-primary transition-all shadow-lg shadow-stone-200"
                >
                  <UserIcon size={18} />
                  <span className="hidden sm:inline">Entrar</span>
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 text-sm text-stone-500">
              <MapPin size={16} className="text-brand-primary" />
              <span>Entregar em: <span className="font-semibold text-stone-900">Rua das Flores, 123</span></span>
            </div>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:px-8">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Categorias</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as Category)}
                className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-brand-primary text-white shadow-md shadow-pink-100' 
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-primary/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden mb-10 bg-brand-secondary">
          <img 
            src="https://picsum.photos/seed/dessert-hero/1200/400" 
            alt="Promoção" 
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-secondary via-transparent to-transparent flex flex-col justify-center px-8 md:px-12">
            <span className="bg-white/90 backdrop-blur-sm text-brand-primary text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
              OFERTA DO DIA
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-2">
              Doces que abraçam <br /> o coração.
            </h2>
            <p className="text-stone-600 text-sm md:text-base max-w-xs">
              Peça agora e receba em até 30 minutos com frete grátis.
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div 
              layout
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-stone-400 hover:text-brand-primary transition-colors">
                  <Heart size={18} />
                </button>
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                    <Clock size={10} className="text-brand-primary" />
                    {product.deliveryTime}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star size={12} fill="currentColor" />
                    {product.rating}
                  </div>
                </div>
                <h3 className="font-bold text-stone-900 mb-1 group-hover:text-brand-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2 mb-4 h-8">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-stone-900">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-stone-900 text-white p-2 rounded-xl hover:bg-brand-primary transition-colors shadow-lg shadow-stone-200"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-stone-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-stone-300" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Nenhum doce encontrado</h3>
            <p className="text-stone-500">Tente buscar por outro termo ou categoria.</p>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-xl font-bold">Seu Carrinho</h2>
                </div>
                <span className="text-sm font-medium text-stone-500">{cartCount} itens</span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag size={40} className="text-stone-200" />
                    </div>
                    <h3 className="font-bold text-lg">Carrinho vazio</h3>
                    <p className="text-stone-500 text-sm max-w-[200px]">
                      Você ainda não adicionou nenhum doce delicioso.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h4 className="font-bold text-stone-900">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-stone-500 mb-3">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-stone-100 rounded-lg px-2 py-1">
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 hover:text-brand-primary transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)}
                              className="p-1 hover:text-brand-primary transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-bold text-stone-900">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-stone-50 border-t border-stone-100 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-stone-500">
                      <span>Subtotal</span>
                      <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-500">
                      <span>Taxa de entrega</span>
                      <span className="text-emerald-600 font-medium">Grátis</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-stone-900 pt-2">
                      <span>Total</span>
                      <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handlePlaceOrder}
                    className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-pink-200 hover:bg-brand-accent transition-all flex items-center justify-center gap-2"
                  >
                    Finalizar Pedido
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notification Permission Prompt */}
      <AnimatePresence>
        {showNotificationPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 p-5 z-50"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-brand-secondary rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                <Sparkles size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-stone-900">Não perca nada! 🍭</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Deseja receber notificações sobre promoções exclusivas e novos doces?
                </p>
              </div>
              <button 
                onClick={() => setShowNotificationPrompt(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowNotificationPrompt(false)}
                className="flex-1 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors"
              >
                Agora não
              </button>
              <button 
                onClick={handleRequestPermission}
                className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-accent transition-all shadow-lg shadow-pink-100"
              >
                Ativar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {orderPlaced && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px]"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <Plus size={24} className="rotate-45" />
            </div>
            <div>
              <h4 className="font-bold">Pedido realizado!</h4>
              <p className="text-xs text-stone-400">Seu doce já está sendo preparado.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-6 py-3 flex items-center justify-between md:hidden z-40">
        <button className="flex flex-col items-center gap-1 text-brand-primary">
          <ShoppingBag size={20} />
          <span className="text-[10px] font-bold">Início</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-stone-400">
          <Search size={20} />
          <span className="text-[10px] font-bold">Busca</span>
        </button>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 text-stone-400 relative"
        >
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-primary text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-bold">Carrinho</span>
        </button>
        <button 
          onClick={() => user ? setIsUserMenuOpen(true) : setIsAuthModalOpen(true)}
          className={`flex flex-col items-center gap-1 ${user ? 'text-brand-primary' : 'text-stone-400'}`}
        >
          {user ? (
            <img src={user.avatar} className="w-5 h-5 rounded-full border border-brand-primary" />
          ) : (
            <UserIcon size={20} />
          )}
          <span className="text-[10px] font-bold">{user ? 'Perfil' : 'Entrar'}</span>
        </button>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin} 
      />
    </div>
  );
}
