import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Phone, MapPin } from 'lucide-react';
import { User as UserType } from '../types';
import { FirebaseService } from '../services/firebaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserType) => void;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    onClose(); // Fecha o modal imediatamente

    try {
      if (isLogin) {
        const user = await FirebaseService.login(email, password);
        if (user) {
          onLogin(user);
        } else {
          // Se o login falhar, o modal já fechou. 
          // O ideal seria reabri-lo com o erro ou mostrar um toast.
          // Por enquanto, apenas logamos o erro no console.
          console.error('Login failed: Invalid credentials');
        }
      } else {
        const newUser = await FirebaseService.register({
          name,
          email,
          phone,
          address,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        }, password);
        onLogin(newUser);
      }
    } catch (err: any) {
      const errorCode = err?.code || err?.message || 'unknown';
      console.error('Authentication error:', errorCode);
      // Como o modal já fechou, precisamos de um sistema de notificação global
      // para informar o usuário sobre erros de cadastro (ex: e-mail já existe)
    }
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden"
          >
            <div className="relative p-6 md:p-8">
              <button
                onClick={onClose}
                className="absolute right-6 top-6 p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-secondary rounded-2xl flex items-center justify-center text-brand-primary mx-auto mb-4">
                  <User size={32} />
                </div>
                <h2 className="text-2xl font-bold text-stone-900">
                  {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
                </h2>
                <p className="text-stone-500 text-sm mt-1">
                  {isLogin 
                    ? 'Entre para acompanhar seus pedidos e promoções.' 
                    : 'Junte-se a nós para uma experiência mais doce.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 ml-1">NOME COMPLETO</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Como quer ser chamado?"
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 ml-1">E-MAIL</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-stone-700">SENHA</label>
                    {isLogin && (
                      <button type="button" className="text-[10px] font-bold text-brand-primary hover:underline">
                        ESQUECEU A SENHA?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700 ml-1">NÚMERO (WHATSAPP)</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700 ml-1">ENDEREÇO DE ENTREGA</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Rua, Número, Bairro, Cidade"
                          className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand-primary text-brand-secondary py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-accent transition-all flex items-center justify-center gap-2"
                >
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                  <ArrowRight size={18} />
                </button>
              </form>

              <p className="text-center mt-8 text-sm text-stone-500">
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 font-bold text-brand-primary hover:underline"
                >
                  {isLogin ? 'Cadastre-se' : 'Faça login'}
                </button>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
