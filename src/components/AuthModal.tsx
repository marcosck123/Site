import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { User as UserType } from '../types';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';
import { auth } from '../services/firebase';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        onLogin({
          id: user.uid,
          name: user.displayName || 'Usuário',
          email: user.email || '',
          avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        onLogin({
          id: user.uid,
          name: name,
          email: user.email || '',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
        });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (providerName: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      onLogin({
        id: user.uid,
        name: user.displayName || 'Usuário',
        email: user.email || '',
        avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro no login social.');
    } finally {
      setIsLoading(false);
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
            <div className="relative p-8">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-brand-accent transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Entrar' : 'Criar Conta'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-stone-400 font-medium">Ou continue com</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 border border-stone-100 rounded-2xl hover:bg-stone-50 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  <Chrome size={18} className="text-red-500" />
                  Google
                </button>
                <button 
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 border border-stone-100 rounded-2xl hover:bg-stone-50 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  <Github size={18} />
                  GitHub
                </button>
              </div>

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
