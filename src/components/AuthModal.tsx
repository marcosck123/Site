import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Phone, MapPin } from 'lucide-react';
import { User as UserType } from '../types';
import { FirebaseService } from '../services/firebaseService';
import LoadingModal from './LoadingModal';

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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLogin) {
        setLoadingMessage('Signing in...');
    } else {
        setLoadingMessage('We\'re creating your account...');
    }
    setIsLoading(true);

    try {
      if (isLogin) {
        const user = await FirebaseService.login(email, password);
        if (user) {
          onLogin(user);
          onClose();
        } else {
          setError('Invalid credentials. Please try again.');
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
        onClose();
      }
    } catch (err: any) {
      const errorCode = err?.code || err?.message || 'unknown';
      console.error('Authentication error:', errorCode);
      setError('An error occurred. Please try again.');
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  }

  return (
    <>
      <LoadingModal isOpen={isLoading} message={loadingMessage} />
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
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
                  onClick={handleClose}
                  className="absolute right-6 top-6 p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="text-center mb-8">
                  <motion.div
                    className="w-16 h-16 bg-brand-secondary rounded-2xl flex items-center justify-center text-brand-primary mx-auto mb-4"
                    animate={{ rotate: isLogin ? 0 : 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <User size={32} />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-stone-900">
                    {isLogin ? 'Welcome back!' : 'Create your account'}
                  </h2>
                  <p className="text-stone-500 text-sm mt-1">
                    {isLogin
                      ? 'Sign in to track your orders and promotions.'
                      : 'Join us for a sweeter experience.'}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 ml-1">FULL NAME</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="What should we call you?"
                            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
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
                        placeholder="your@email.com"
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-bold text-stone-700">PASSWORD</label>
                      {isLogin && (
                        <button type="button" className="text-[10px] font-bold text-brand-primary hover:underline">
                          FORGOT PASSWORD?
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

                  <AnimatePresence>
                  {!isLogin && (
                      <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 overflow-hidden"
                      >
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 ml-1">NUMBER (WHATSAPP)</label>
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
                        <label className="text-xs font-bold text-stone-700 ml-1">DELIVERY ADDRESS</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Street, Number, Neighborhood, City"
                            className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    className="w-full bg-brand-primary text-brand-secondary py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-accent transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </motion.button>
                </form>

                <p className="text-center mt-8 text-sm text-stone-500">
                  {isLogin ? 'Don\'t have an account?' : 'Already have an account?'}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-1 font-bold text-brand-primary hover:underline"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
