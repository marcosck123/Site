import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Image, Type, AlignLeft, Tag } from 'lucide-react';
import { Product } from '../types';
import { FirebaseService } from '../services/firebaseService';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: (product: Partial<Product>) => void;
}

export default function ProductForm({ isOpen, onClose, product, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({});
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[90] overflow-hidden"
          >
            <div className="relative p-6 md:p-8">
              <button
                onClick={onClose}
                className="absolute right-6 top-6 p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold text-stone-900 mb-6">
                {product ? 'Editar Produto' : 'Adicionar Produto'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 ml-1">NOME</label>
                    <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Nome do Produto" required className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none" />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 ml-1">PREÇO</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input type="number" name="price" value={formData.price || ''} onChange={handleChange} placeholder="19.99" required className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 ml-1">CATEGORIA</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input type="text" name="category" value={formData.category || ''} onChange={handleChange} placeholder="Categoria" required className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none" />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 ml-1">DESCRIÇÃO</label>
                    <div className="relative">
                        <AlignLeft className="absolute left-4 top-4 text-stone-400" size={18} />
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Descreva o produto..." required rows={4} className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"></textarea>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 ml-1">URL DA IMAGEM</label>
                    <div className="relative">
                        <Image className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input type="text" name="image" value={formData.image || ''} onChange={handleChange} placeholder="https://..." required className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none" />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                  <motion.button
                    type="submit"
                    className="bg-brand-primary text-brand-secondary px-8 py-3 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-accent transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Salvar
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}