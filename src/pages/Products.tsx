import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, Star, Clock, Heart, X } from 'lucide-react';
import { Product } from '../types';
import { LocalDB } from '../services/localDB';

interface ProductsPageProps {
  onAddToCart: (product: Product) => void;
}

export default function Products({ onAddToCart }: ProductsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    setProducts(LocalDB.getProducts());
    setCategories(['Todos', ...LocalDB.getCategories()]);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-stone-900">Nosso Cardápio</h1>
          <p className="text-stone-500 mt-2">Explore nossas delícias artesanais</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="O que você está procurando?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Categories Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-8 no-scrollbar -mx-6 px-6">
        {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-brand-primary text-brand-secondary shadow-lg shadow-brand-primary/20 scale-105'
                  : 'bg-white text-stone-600 border border-stone-100 hover:bg-stone-50'
              }`}
            >
            {category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-stone-100 group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-56">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-stone-400 hover:text-brand-primary transition-colors">
                  <Heart size={18} />
                </button>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-stone-800">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  {product.rating}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-stone-900 group-hover:text-brand-primary transition-colors">{product.name}</h3>
                  <div className="text-right">
                    {product.promoPrice ? (
                      <div className="flex flex-col items-end">
                        <span className="text-brand-primary font-black">R$ {product.promoPrice.toFixed(2)}</span>
                        <span className="text-[10px] text-stone-400 line-through">R$ {product.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-brand-primary font-black">R$ {product.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <p className="text-stone-500 text-xs mb-6 line-clamp-2 leading-relaxed">{product.description}</p>
                
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-medium">
                    <Clock size={14} />
                    {product.deliveryTime}
                  </div>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="bg-brand-secondary text-brand-primary p-3 rounded-xl hover:bg-brand-primary hover:text-brand-secondary transition-all active:scale-95"
                  >
                    <ShoppingBag size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-stone-400" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">Nenhum produto encontrado</h3>
          <p className="text-stone-500 mt-2">Tente buscar por outro termo ou categoria.</p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedCategory('Todos');}}
            className="mt-6 text-brand-primary font-bold hover:underline"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
}
