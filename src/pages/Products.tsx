import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, Star, Clock, Heart, X, Plus, Minus } from 'lucide-react';
import { Product, Review } from '../types';

interface ProductsPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function Products({ products, onAddToCart }: ProductsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [userFavorites, setUserFavorites] = useState<string[]>([]); // This will be updated from a user prop later
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const categories = useMemo(() => 
    ['Todos', ...Array.from(new Set(products.map(p => p.category)))], 
  [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, products]);

  const handleToggleFavorite = (productId: string) => {
    // This will be handled by the main app state and Firebase
    console.log("Toggling favorite for", productId);
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleAddToCartWithQuantity = (product: Product) => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    setSelectedProduct(null);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-stone-900">Nosso Cardápio</h1>
          <p className="text-stone-500 mt-2">Explore nossas delícias artesanais</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            placeholder="O que você está procurando?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="sticky top-[73px] z-40 bg-stone-50/80 backdrop-blur-md -mx-6 px-6 py-4 mb-12 border-b border-stone-100">
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((category) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-brand-primary text-brand-secondary shadow-lg shadow-brand-primary/20'
                    : 'bg-white text-stone-600 border border-stone-100 hover:bg-stone-50'
                }`}
              >
                {category}
              </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
              <button 
                onClick={() => handleToggleFavorite(product.id)}
                className={`absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full transition-colors ${userFavorites.includes(product.id) ? 'text-red-500' : 'text-stone-400 hover:text-brand-primary'}`}
              >
                <Heart size={18} fill={userFavorites.includes(product.id) ? "currentColor" : "none"} />
              </button>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-stone-800">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                {product.rating}
              </div>
            </div>
            <div className="p-6">
                <h3 
                  onClick={() => openProductDetail(product)}
                  className="font-bold text-stone-900 group-hover:text-brand-primary transition-colors cursor-pointer"
                >
                  {product.name}
                </h3>
              <p className="text-stone-500 text-xs mt-1 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
              <div className="flex items-center justify-between">
                  <span className="text-brand-primary font-black">R$ {product.price.toFixed(2)}</span>
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
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[40px] shadow-2xl z-[110] p-8"
            >
              <h2 className="font-bold text-2xl mb-4">{selectedProduct.name}</h2>
              <p className="text-stone-600 mb-6">{selectedProduct.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-stone-100 rounded-full"><Minus size={18}/></button>
                  <span className="font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 bg-stone-100 rounded-full"><Plus size={18}/></button>
                </div>
                <button 
                  onClick={() => handleAddToCartWithQuantity(selectedProduct)}
                  className="bg-brand-primary text-white font-bold py-3 px-6 rounded-xl"
                >
                  Adicionar (R$ {(selectedProduct.price * quantity).toFixed(2)})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
