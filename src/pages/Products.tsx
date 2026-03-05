import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, Star, Clock, Heart, X, Share2, MessageSquare, Camera, Plus, Minus, Package, Sparkles } from 'lucide-react';
import { Product, Review } from '../types';
import { LocalDB } from '../services/localDB';

interface ProductsPageProps {
  onAddToCart: (product: Product) => void;
}

export default function Products({ onAddToCart }: ProductsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [isComboBuilderOpen, setIsComboBuilderOpen] = useState(false);
  const [comboSelection, setComboSelection] = useState<Product[]>([]);

  const dietaryOptions = [
    { id: 'vegano', label: 'Vegano', icon: '🌿' },
    { id: 'sem-acucar', label: 'Sem Açúcar', icon: '🍎' },
    { id: 'sem-gluten', label: 'Sem Glúten', icon: '🌾' },
    { id: 'zero-lactose', label: 'Zero Lactose', icon: '🥛' },
  ];

  useEffect(() => {
    setProducts(LocalDB.getProducts());
    setCategories(['Todos', ...LocalDB.getCategories()]);
    const user = LocalDB.getCurrentUser();
    if (user) setUserFavorites(user.favorites || []);
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesTag = !selectedTag || product.tags?.includes(selectedTag);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDietary = selectedDietary.length === 0 || 
                            selectedDietary.every(d => product.tags?.includes(d));
      return matchesCategory && matchesSearch && matchesTag && matchesDietary;
    });
  }, [selectedCategory, searchQuery, products, selectedTag, selectedDietary]);

  const handleToggleFavorite = (productId: string) => {
    LocalDB.toggleFavorite(productId);
    const user = LocalDB.getCurrentUser();
    if (user) setUserFavorites(user.favorites || []);
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setProductReviews(LocalDB.getReviews(product.id));
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

      {/* Categories Scroll - Sticky */}
      <div className="sticky top-[73px] z-40 bg-stone-50/80 backdrop-blur-md -mx-6 px-6 py-4 mb-12 border-b border-stone-100">
        <div className="flex flex-col gap-4">
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
          
          {allTags.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    !selectedTag ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  Todos os Filtros
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedTag === tag ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {dietaryOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedDietary(prev => 
                        prev.includes(option.id) ? prev.filter(d => d !== option.id) : [...prev, option.id]
                      );
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                      selectedDietary.includes(option.id) 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-white text-stone-500 border border-stone-100'
                    }`}
                  >
                    <span>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Build your Combo Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 bg-gradient-to-r from-brand-primary to-pink-500 rounded-[40px] p-8 md:p-12 text-brand-secondary relative overflow-hidden group cursor-pointer"
        onClick={() => setIsComboBuilderOpen(true)}
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
          <Sparkles size={160} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-display font-black mb-4">Monte seu Combo! 🎨</h2>
            <p className="text-brand-secondary/80 text-lg max-w-md">
              Escolha 4 itens e ganhe <span className="text-white font-black">15% de desconto</span> automático.
            </p>
          </div>
          <button className="bg-brand-secondary text-brand-primary px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-xl">
            Começar Agora
          </button>
        </div>
      </motion.div>

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
                <button 
                  onClick={() => handleToggleFavorite(product.id)}
                  className={`absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full transition-colors ${userFavorites.includes(product.id) ? 'text-red-500' : 'text-stone-400 hover:text-brand-primary'}`}
                >
                  <Heart size={18} fill={userFavorites.includes(product.id) ? "currentColor" : "none"} />
                </button>
                {product.flashSalePrice && (
                  <div className="absolute top-4 left-4 bg-brand-accent text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                    Oferta Relâmpago
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-stone-800">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  {product.rating}
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 
                    onClick={() => openProductDetail(product)}
                    className="font-bold text-stone-900 group-hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <div className="text-right">
                    {product.flashSalePrice ? (
                      <div className="flex flex-col items-end">
                        <span className="text-brand-accent font-black">R$ {product.flashSalePrice.toFixed(2)}</span>
                        <span className="text-[10px] text-stone-400 line-through">R$ {product.price.toFixed(2)}</span>
                      </div>
                    ) : product.promoPrice ? (
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
                  {product.stock !== undefined && product.stock < 10 && (
                    <div className="text-[10px] font-black text-red-500 uppercase">
                      Apenas {product.stock} restam!
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openProductDetail(product)}
                      className="bg-stone-50 text-stone-400 p-3 rounded-xl hover:bg-stone-100 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                    <button
                      onClick={() => onAddToCart(product)}
                      className="bg-brand-secondary text-brand-primary p-3 rounded-xl hover:bg-brand-primary hover:text-brand-secondary transition-all active:scale-95"
                    >
                      <ShoppingBag size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && !isLoading && (
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
      {/* Combo Builder Modal */}
      <AnimatePresence>
        {isComboBuilderOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComboBuilderOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120]"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-x-0 bottom-0 md:inset-10 bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl z-[130] overflow-hidden flex flex-col"
            >
              <header className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <div>
                  <h2 className="text-3xl font-black text-stone-900">Monte seu Combo</h2>
                  <p className="text-stone-500">Selecione 4 itens para ganhar o desconto</p>
                </div>
                <button onClick={() => setIsComboBuilderOpen(false)} className="p-2 bg-white rounded-full text-stone-400">
                  <X size={24} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {products.filter(p => !p.isCombo).map(product => (
                    <div 
                      key={product.id}
                      onClick={() => {
                        if (comboSelection.find(p => p.id === product.id)) {
                          setComboSelection(prev => prev.filter(p => p.id !== product.id));
                        } else if (comboSelection.length < 4) {
                          setComboSelection(prev => [...prev, product]);
                        }
                      }}
                      className={`p-3 rounded-3xl border-2 transition-all cursor-pointer relative ${
                        comboSelection.find(p => p.id === product.id) 
                          ? 'border-brand-primary bg-brand-primary/5' 
                          : 'border-stone-100 hover:border-brand-primary/30'
                      }`}
                    >
                      <img src={product.image} alt={product.name} className="w-full h-24 object-cover rounded-2xl mb-2" />
                      <p className="text-[10px] font-bold text-stone-900 line-clamp-1">{product.name}</p>
                      {comboSelection.find(p => p.id === product.id) && (
                        <div className="absolute -top-2 -right-2 bg-brand-primary text-brand-secondary w-6 h-6 rounded-full flex items-center justify-center font-black text-xs">
                          {comboSelection.findIndex(p => p.id === product.id) + 1}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <footer className="p-8 bg-stone-50 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex -space-x-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center overflow-hidden ${comboSelection[i] ? 'bg-brand-primary' : 'bg-stone-200'}`}>
                      {comboSelection[i] ? (
                        <img src={comboSelection[i].image} className="w-full h-full object-cover" />
                      ) : (
                        <Plus size={20} className="text-stone-400" />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs font-black text-stone-400 uppercase">Total do Combo</p>
                    <p className="text-2xl font-black text-stone-900">
                      R$ {(comboSelection.reduce((acc, p) => acc + p.price, 0) * 0.85).toFixed(2)}
                      <span className="ml-2 text-xs text-stone-400 line-through">R$ {comboSelection.reduce((acc, p) => acc + p.price, 0).toFixed(2)}</span>
                    </p>
                  </div>
                  <button 
                    disabled={comboSelection.length < 4}
                    onClick={() => {
                      const comboProduct: Product = {
                        id: 'combo-' + Date.now(),
                        name: 'Combo Personalizado',
                        description: 'Um combo delicioso montado por você!',
                        price: comboSelection.reduce((acc, p) => acc + p.price, 0) * 0.85,
                        category: 'Combos',
                        image: comboSelection[0].image,
                        rating: 5,
                        deliveryTime: '30-45 min',
                        isCombo: true,
                        comboItems: comboSelection.map(p => p.name)
                      };
                      onAddToCart(comboProduct);
                      setIsComboBuilderOpen(false);
                      setComboSelection([]);
                    }}
                    className="bg-brand-primary text-brand-secondary px-10 py-4 rounded-2xl font-black shadow-xl shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Adicionar ao Carrinho
                  </button>
                </div>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-0 right-0 bottom-0 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-4xl bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl z-[110] overflow-hidden max-h-[90vh] flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-md rounded-full text-stone-400 hover:text-stone-600 z-10"
              >
                <X size={24} />
              </button>

              <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex gap-2 mb-2">
                      {selectedProduct.tags?.map(tag => (
                        <span key={tag} className="bg-stone-100 text-stone-500 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-3xl font-black text-stone-900">{selectedProduct.name}</h2>
                  </div>
                  <button 
                    onClick={() => handleToggleFavorite(selectedProduct.id)}
                    className={`p-3 rounded-2xl border ${userFavorites.includes(selectedProduct.id) ? 'bg-red-50 border-red-100 text-red-500' : 'bg-stone-50 border-stone-100 text-stone-400'}`}
                  >
                    <Heart size={20} fill={userFavorites.includes(selectedProduct.id) ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="flex items-center gap-6 mb-8 text-sm">
                  <div className="flex items-center gap-1 text-stone-800 font-bold">
                    <Star size={18} className="text-yellow-400 fill-yellow-400" />
                    {selectedProduct.rating}
                    <span className="text-stone-400 font-medium ml-1">({productReviews.length} avaliações)</span>
                  </div>
                  <div className="flex items-center gap-1 text-stone-400 font-medium">
                    <Clock size={18} />
                    {selectedProduct.deliveryTime}
                  </div>
                  {selectedProduct.stock !== undefined && (
                    <div className={`flex items-center gap-1 font-bold ${selectedProduct.stock < 10 ? 'text-red-500' : 'text-emerald-500'}`}>
                      <Package size={18} />
                      {selectedProduct.stock} em estoque
                    </div>
                  )}
                </div>

                <p className="text-stone-500 leading-relaxed mb-8">{selectedProduct.description}</p>

                {selectedProduct.isCombo && selectedProduct.comboItems && (
                  <div className="mb-8 bg-brand-primary/5 p-6 rounded-3xl border border-brand-primary/10">
                    <h4 className="font-black text-brand-primary text-xs uppercase tracking-widest mb-4">Itens Incluídos no Combo</h4>
                    <ul className="space-y-2">
                      {selectedProduct.comboItems.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-stone-700 text-sm font-bold">
                          <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-6 mb-8">
                  <h4 className="font-black text-stone-900 text-xs uppercase tracking-widest">Avaliações dos Clientes</h4>
                  <div className="space-y-4">
                    {productReviews.length > 0 ? productReviews.map(review => (
                      <div key={review.id} className="bg-stone-50 p-4 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-bold text-stone-900 text-sm">{review.userName}</p>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-stone-200"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-stone-500 text-xs">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((img, i) => (
                              <img key={i} src={img} alt="Review" className="w-12 h-12 rounded-lg object-cover" />
                            ))}
                          </div>
                        )}
                      </div>
                    )) : (
                      <p className="text-stone-400 text-xs italic">Ainda não há avaliações para este produto.</p>
                    )}
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white pt-6 border-t border-stone-100 flex items-center gap-6">
                  <div className="flex items-center gap-4 bg-stone-100 p-2 rounded-2xl">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-600 hover:text-brand-primary transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-black text-stone-900 w-6 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-600 hover:text-brand-primary transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <button 
                    onClick={() => handleAddToCartWithQuantity(selectedProduct)}
                    className="flex-1 bg-brand-primary text-brand-secondary py-4 rounded-2xl font-bold shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={20} />
                    Adicionar • R$ {((selectedProduct.flashSalePrice || selectedProduct.promoPrice || selectedProduct.price) * quantity).toFixed(2)}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
