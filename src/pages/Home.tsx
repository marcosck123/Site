import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface HomeProps {
  products: Product[];
}

export default function Home({ products }: HomeProps) {
  const featuredProducts = useMemo(() => 
    [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4),
  [products]);

  return (
    <div className="space-y-16 pb-20">
      <section className="relative min-h-[400px] flex items-center bg-brand-primary text-brand-secondary rounded-b-[40px]">
        <div className="container mx-auto px-6 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl"
          >
            <h1 className="text-5xl md:text-7xl font-display font-black leading-tight mb-6">
              Sua dose diária de felicidade.
            </h1>
            <p className="text-lg md:text-xl text-brand-secondary/80 mb-10">
              Doces artesanais feitos com amor, entregues na sua porta.
            </p>
            <Link 
              to="/produtos" 
              className="bg-brand-secondary text-brand-primary px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-2 w-fit"
            >
              Ver Cardápio
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-stone-900">Mais Populares</h2>
          <p className="text-stone-500 mt-2">Os favoritos da nossa comunidade</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-stone-100 group"
            >
              <div className="relative h-56">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <button 
                  className={`absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-stone-400 hover:text-brand-primary transition-colors`}
                >
                  <Heart size={18} />
                </button>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-stone-800">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  {product.rating}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-stone-900 mb-1">{product.name}</h3>
                <p className="text-brand-primary font-black mb-4">R$ {product.price.toFixed(2)}</p>
                <Link 
                  to={`/produtos`}
                  className="w-full bg-stone-50 text-stone-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-primary hover:text-brand-secondary transition-all"
                >
                  <ShoppingBag size={18} />
                  Ver detalhes
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
