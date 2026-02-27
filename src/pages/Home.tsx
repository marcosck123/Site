import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, Clock, ShoppingBag, Heart, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LocalDB } from '../services/localDB';
import { Product } from '../types';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);

  React.useEffect(() => {
    setFeaturedProducts(LocalDB.getProducts().slice(0, 4));
    setCategories(LocalDB.getCategories().slice(0, 4));
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[500px] md:h-[600px] flex items-center overflow-hidden rounded-b-[40px]">
        <div className="absolute inset-0">
          <img 
            src="https://picsum.photos/seed/bakery/1920/1080?blur=2" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-brand-secondary"
          >
            <div className="inline-flex items-center gap-2 bg-brand-primary/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold mb-6 border border-brand-secondary/30">
              <Sparkles size={16} className="text-brand-secondary" />
              <span>OS MELHORES DOCES DA CIDADE</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black leading-tight mb-6 text-brand-secondary">
              A Felicidade em <br />
              <span className="text-white">Cada Mordida.</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-secondary/80 mb-10 max-w-lg">
              Descubra um mundo de sabores artesanais, feitos com amor e entregues na sua porta em minutos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/produtos" 
                className="bg-brand-primary text-brand-secondary px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform flex items-center gap-2"
              >
                Ver Cardápio
                <ArrowRight size={20} />
              </Link>
              <button className="bg-white/10 backdrop-blur-md border border-brand-secondary/30 text-brand-secondary px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                Nossa História
              </button>
            </div>
          </motion.div>
        </div>
      </section>

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

      {/* Featured Products */}
      <section className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-stone-900">Destaques da Semana</h2>
          <p className="text-stone-500 mt-2">Os mais pedidos pelos nossos clientes</p>
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
                <button className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-full text-stone-400 hover:text-brand-primary transition-colors">
                  <Heart size={20} />
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
          <div className="flex-1 relative">
            <img 
              src="https://picsum.photos/seed/gift/600/400" 
              alt="Promo" 
              className="rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
