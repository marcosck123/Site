import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, Clock, ShoppingBag, Heart, Sparkles, ChevronRight, Gift, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LocalDB } from '../services/localDB';
import { Product, User } from '../types';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [missions, setMissions] = useState<any[]>([]);

  const [banners, setBanners] = useState<any[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const settings = LocalDB.getSettings();
    setBanners(settings.banners.filter(b => b.isActive));
    setFeaturedProducts(LocalDB.getPopularProducts(4));
    setFlashSaleProducts(LocalDB.getFlashSales().slice(0, 4));
    setCategories(LocalDB.getCategories().slice(0, 4));
    setMissions(LocalDB.getMissions());
    
    // AI Recommendations (Simulated: based on user favorites or random popular)
    const allProducts = LocalDB.getProducts();
    const currentUser = LocalDB.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser) {
      setUserFavorites(currentUser.favorites || []);
      // Simple AI: products in the same category as favorites
      const favCats = allProducts.filter(p => currentUser.favorites?.includes(p.id)).map(p => p.category);
      const recs = allProducts.filter(p => favCats.includes(p.category) && !currentUser.favorites?.includes(p.id));
      setRecommendedProducts(recs.length > 0 ? recs.slice(0, 4) : allProducts.sort(() => 0.5 - Math.random()).slice(0, 4));
    } else {
      setRecommendedProducts(allProducts.sort(() => 0.5 - Math.random()).slice(0, 4));
    }
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  const handleToggleFavorite = (productId: string) => {
    LocalDB.toggleFavorite(productId);
    const updatedUser = LocalDB.getCurrentUser();
    if (updatedUser) {
      setUser(updatedUser);
      setUserFavorites(updatedUser.favorites || []);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section / Banner Carousel */}
      <section className="relative min-h-[500px] md:h-[600px] flex items-center overflow-hidden rounded-b-[40px]">
        <AnimatePresence mode="wait">
          {banners.length > 0 ? (
            <motion.div 
              key={banners[currentBanner].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <img 
                src={banners[currentBanner].image} 
                alt={banners[currentBanner].title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/80 to-transparent" />
              
              <div className="container mx-auto px-6 h-full flex items-center relative z-10">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-2xl text-brand-secondary"
                >
                  <div className="inline-flex items-center gap-2 bg-brand-primary/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold mb-6 border border-brand-secondary/30">
                    <Sparkles size={16} className="text-brand-secondary" />
                    <span>OFERTA ESPECIAL</span>
                  </div>
                  <h1 className="text-4xl md:text-7xl font-display font-black leading-tight mb-6 text-brand-secondary">
                    {banners[currentBanner].title}
                  </h1>
                  <p className="text-lg md:text-xl text-brand-secondary/80 mb-10 max-w-lg">
                    {banners[currentBanner].subtitle}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link 
                      to="/produtos" 
                      className="bg-brand-primary text-brand-secondary px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      Ver Cardápio
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-brand-primary flex items-center justify-center">
              <ShoppingBag size={64} className="text-brand-secondary opacity-20 animate-pulse" />
            </div>
          )}
        </AnimatePresence>
        
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`w-2 h-2 rounded-full transition-all ${currentBanner === i ? 'w-8 bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Flash Sale Section */}
      {flashSaleProducts.length > 0 && (
        <section className="container mx-auto px-6">
          <div className="bg-brand-accent/5 border border-brand-accent/20 rounded-[40px] p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-brand-accent text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 animate-pulse">
                  <TrendingUp size={14} /> Oferta Relâmpago
                </div>
                <h2 className="text-4xl font-black text-stone-900">Preços Doces por Tempo Limitado!</h2>
                <p className="text-stone-500 mt-2">Corra antes que acabe o estoque!</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm text-center min-w-[80px]">
                  <p className="text-2xl font-black text-brand-accent">02</p>
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Horas</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm text-center min-w-[80px]">
                  <p className="text-2xl font-black text-brand-accent">45</p>
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Minutos</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSaleProducts.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm group">
                  <div className="relative h-40 rounded-2xl overflow-hidden mb-4">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute top-2 right-2 bg-brand-accent text-white text-[10px] font-black px-2 py-1 rounded-lg">
                      -{Math.round((1 - (product.flashSalePrice || 0) / product.price) * 100)}%
                    </div>
                  </div>
                  <h4 className="font-bold text-stone-900 mb-1">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-brand-accent font-black">R$ {product.flashSalePrice?.toFixed(2)}</span>
                      <span className="text-xs text-stone-400 line-through">R$ {product.price.toFixed(2)}</span>
                    </div>
                    {product.stock !== undefined && product.stock < 10 && (
                      <span className="text-[10px] font-black text-red-500 uppercase">Apenas {product.stock}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-stone-900">Nossas Categorias</h2>
            <p className="text-stone-500 mt-2">Escolha o seu tipo favorito de doçura</p>
          </div>
          <Link to="/produtos" className="text-brand-primary font-bold flex items-center gap-1 hover:underline">
            Ver todas <ChevronRight size={18} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-stone-100 p-8 rounded-[32px] text-center cursor-pointer hover:scale-105 transition-transform group`}
            >
              <span className="text-5xl mb-4 block group-hover:scale-110 transition-transform">✨</span>
              <h3 className="font-bold text-stone-800">{cat}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sweet Club & Missions - Bento Grid */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sweet Club Card (Large) */}
          <motion.div 
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="md:col-span-2 bg-brand-primary rounded-[40px] p-10 text-brand-secondary relative overflow-hidden group shadow-2xl shadow-brand-primary/20"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles size={160} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                  <Gift size={14} /> Sweet Club
                </div>
                <h3 className="text-3xl md:text-5xl font-display font-black mb-6 leading-tight">
                  Sua Dose Mensal <br /> de Felicidade.
                </h3>
                <p className="text-brand-secondary/80 mb-8 max-w-md text-lg">
                  Assine e receba uma caixa surpresa com nossos melhores doces toda semana.
                </p>
              </div>
              <button className="w-fit bg-brand-secondary text-brand-primary px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-xl">
                Assinar Agora
              </button>
            </div>
          </motion.div>

          {/* Missions Card (Tall) */}
          <div className="bg-stone-900 rounded-[40px] p-8 text-white flex flex-col justify-between shadow-2xl shadow-stone-900/20">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-black">Missões</h3>
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">4h restantes</span>
              </div>
              <div className="space-y-4">
                {missions.map(mission => (
                  <div key={mission.id} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-primary/20 text-brand-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">{mission.title}</h4>
                        <p className="text-[10px] text-stone-400">{mission.description}</p>
                      </div>
                    </div>
                    <span className="text-brand-primary font-black text-[10px]">+{mission.rewardPoints}p</span>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/produtos" className="mt-8 text-brand-primary text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
              Ver Cardápio <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles size={14} /> Recomendado para Você
          </div>
          <h2 className="text-4xl font-display font-black text-stone-900">Baseado no seu Gosto</h2>
          <p className="text-stone-500 mt-2">Nossa inteligência doce selecionou estes para você</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {recommendedProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[32px] overflow-hidden shadow-lg border border-stone-100 group"
            >
              <div className="relative h-64">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => handleToggleFavorite(product.id)}
                  className={`absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-full transition-colors ${userFavorites.includes(product.id) ? 'text-red-500' : 'text-stone-400 hover:text-brand-primary'}`}
                >
                  <Heart size={20} fill={userFavorites.includes(product.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-stone-900 mb-1">{product.name}</h3>
                <p className="text-brand-primary font-black mb-4">R$ {product.price.toFixed(2)}</p>
                <Link 
                  to="/produtos"
                  className="w-full bg-stone-50 text-stone-800 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-brand-secondary transition-all"
                >
                  <ShoppingBag size={18} />
                  Ver Detalhes
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-stone-900">Mais Populares</h2>
          <p className="text-stone-500 mt-2">Os favoritos da nossa comunidade</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[32px] overflow-hidden shadow-lg border border-stone-100 group"
            >
              <div className="relative h-64">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => handleToggleFavorite(product.id)}
                  className={`absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-full transition-colors ${userFavorites.includes(product.id) ? 'text-red-500' : 'text-stone-400 hover:text-brand-primary'}`}
                >
                  <Heart size={20} fill={userFavorites.includes(product.id) ? "currentColor" : "none"} />
                </button>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-stone-800">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  {product.rating}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-stone-900">{product.name}</h3>
                  <span className="text-brand-primary font-black">R$ {product.price.toFixed(2)}</span>
                </div>
                <p className="text-stone-500 text-sm mb-6 line-clamp-2">{product.description}</p>
                <Link 
                  to="/produtos"
                  className="w-full bg-stone-50 text-stone-800 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-brand-secondary transition-all"
                >
                  <ShoppingBag size={18} />
                  Adicionar
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Banner Section */}
      <section className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-brand-primary rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="flex-1 text-brand-secondary relative z-10 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black mb-6">Ganhe 20% de desconto na sua primeira compra!</h2>
              <p className="text-brand-secondary/80 text-lg mb-8">Use o cupom <span className="bg-white/20 px-3 py-1 rounded-lg font-mono font-bold">DOCE20</span> no checkout.</p>
              <Link 
                to="/produtos"
                className="bg-brand-secondary text-brand-primary px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform inline-block"
              >
                Aproveitar Agora
              </Link>
            </div>
          </div>

          <div className="bg-stone-900 rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/20 rounded-full -ml-32 -mb-32 blur-3xl" />
            <div className="flex-1 text-white relative z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <Users size={14} /> Indique e Ganhe
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-6">Compartilhe Doçura com Amigos!</h2>
              <p className="text-white/60 text-lg mb-8">Indique um amigo e ambos ganham <span className="text-brand-secondary font-bold">R$ 10,00</span> em créditos na carteira!</p>
              <button 
                onClick={() => {
                  if (user) {
                    navigator.clipboard.writeText(user.referralCode || '');
                    alert('Código copiado: ' + user.referralCode);
                  } else {
                    alert('Faça login para ver seu código!');
                  }
                }}
                className="bg-white text-stone-900 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform inline-block"
              >
                Copiar Meu Código
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
