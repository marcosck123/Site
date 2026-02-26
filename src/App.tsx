import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  X, 
  ChevronRight,
  LogOut,
  Home as HomeIcon,
  Package,
  User as UserIcon,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Product, CartItem, User } from './types';
import AuthModal from './components/AuthModal';
import { LocalDB } from './services/localDB';
import Admin from './pages/Admin';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';

function AppContent() {
  const location = useLocation();
  const [cart, setCart] = useState<CartItem[]>(LocalDB.getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(LocalDB.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    LocalDB.saveCart(cart);
  }, [cart]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    LocalDB.setCurrentUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    LocalDB.setCurrentUser(null);
    setIsUserMenuOpen(false);
  };

  const addToCart = (product: Product) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
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

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    
    const newOrder = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      items: cart,
      total: cartTotal,
      status: 'Pendente' as const,
      createdAt: new Date().toISOString(),
      address: user.address || 'Endereço não informado',
      phone: user.phone || 'Telefone não informado'
    };

    LocalDB.addOrder(newOrder);
    setOrderPlaced(true);
    setCart([]);
    setTimeout(() => {
      setOrderPlaced(false);
      setIsCartOpen(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-secondary shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
              <ShoppingBag size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-stone-900">DOCE<span className="text-brand-primary">ENTREGA</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={`font-bold hover:text-brand-primary transition-colors ${location.pathname === '/' ? 'text-brand-primary' : 'text-stone-600'}`}>Início</Link>
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
                      <button className="w-full px-4 py-3 text-left text-sm font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-2">
                        <UserIcon size={18} /> Perfil
                      </button>
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
        </Routes>
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

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-stone-100 px-6 py-4 flex justify-around items-center md:hidden z-50">
        <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-brand-primary' : 'text-stone-400'}`}>
          <HomeIcon size={24} />
          <span className="text-[10px] font-bold">Início</span>
        </Link>
        <Link to="/produtos" className={`flex flex-col items-center gap-1 ${location.pathname === '/produtos' ? 'text-brand-primary' : 'text-stone-400'}`}>
          <Package size={24} />
          <span className="text-[10px] font-bold">Produtos</span>
        </Link>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-stone-400"
        >
          <ShoppingBag size={24} />
          <span className="text-[10px] font-bold">Carrinho</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
              {cartCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => user ? setIsUserMenuOpen(true) : setIsAuthModalOpen(true)}
          className={`flex flex-col items-center gap-1 ${user ? 'text-brand-primary' : 'text-stone-400'}`}
        >
          {user ? (
            <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full border border-brand-primary" />
          ) : (
            <UserIcon size={24} />
          )}
          <span className="text-[10px] font-bold">{user ? 'Perfil' : 'Entrar'}</span>
        </button>
      </nav>

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
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-secondary rounded-xl flex items-center justify-center text-brand-primary">
                    <ShoppingBag size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-stone-900">Seu Carrinho</h2>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag size={32} className="text-stone-300" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900">Carrinho Vazio</h3>
                    <p className="text-stone-500 mt-2 max-w-[200px]">
                      Você ainda não adicionou nenhuma delícia ao seu carrinho.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div 
                      layout
                      key={item.id} 
                      className="flex gap-4 group"
                    >
                      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-stone-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-stone-900">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <p className="text-stone-500 text-xs mb-4">R$ {item.price.toFixed(2)} / un</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-stone-50 rounded-xl p-1 border border-stone-100">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-white hover:shadow-sm transition-all"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:bg-white hover:shadow-sm transition-all"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <span className="font-bold text-stone-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-stone-50 border-t border-stone-100 space-y-4">
                  <div className="flex justify-between items-center text-stone-500 text-sm">
                    <span>Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-500 text-sm">
                    <span>Entrega</span>
                    <span className="text-emerald-500 font-bold">Grátis</span>
                  </div>
                  <div className="pt-4 border-t border-stone-200 flex justify-between items-center mb-6">
                    <span className="text-lg font-bold text-stone-900">Total</span>
                    <span className="text-2xl font-black text-brand-primary">R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <button 
                    onClick={handleCheckout}
                    disabled={orderPlaced}
                    className="w-full bg-brand-primary text-brand-secondary py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {orderPlaced ? (
                      <>Pedido Realizado! 🎉</>
                    ) : (
                      <>
                        Finalizar Pedido
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
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
