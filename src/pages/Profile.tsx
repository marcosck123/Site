import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Phone, Mail, MapPin, Save, CheckCircle, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { User } from '../types';
import { LocalDB } from '../services/localDB';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export default function Profile({ user, onUpdate }: ProfileProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState(user.address || '');
  
  const [isVerifying, setIsVerifying] = useState<'email' | 'phone' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...user,
      name,
      address
    };
    LocalDB.setCurrentUser(updatedUser);
    onUpdate(updatedUser);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const startVerification = (type: 'email' | 'phone') => {
    setIsVerifying(type);
    setVerificationCode('');
    // Simulate sending code
    console.log(`Sending verification code to ${type === 'email' ? email : phone}`);
  };

  const confirmVerification = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const updatedUser: User = {
        ...user,
        email: isVerifying === 'email' ? email : user.email,
        phone: isVerifying === 'phone' ? phone : user.phone,
      };
      LocalDB.setCurrentUser(updatedUser);
      onUpdate(updatedUser);
      setIsVerifying(null);
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <header className="mb-12 text-center">
        <div className="w-24 h-24 bg-brand-secondary rounded-3xl flex items-center justify-center text-brand-primary mx-auto mb-6 shadow-xl relative">
          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-3xl object-cover" />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white">
            <ShieldCheck size={16} />
          </div>
        </div>
        <h1 className="text-3xl font-black text-stone-900">Meu Perfil</h1>
        <p className="text-stone-500">Gerencie suas informações e segurança</p>
      </header>

      {isSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center gap-3 font-bold text-sm"
        >
          <CheckCircle size={20} />
          Alterações salvas com sucesso!
        </motion.div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-stone-500 uppercase tracking-wider ml-1">Nome Completo</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-stone-500 uppercase tracking-wider ml-1">E-mail</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
              </div>
              {email !== user.email && (
                <button 
                  type="button"
                  onClick={() => startVerification('email')}
                  className="bg-brand-primary text-brand-secondary px-6 rounded-2xl font-bold text-sm hover:scale-105 transition-all"
                >
                  Verificar
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-stone-500 uppercase tracking-wider ml-1">Telefone (WhatsApp)</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
              </div>
              {phone !== user.phone && (
                <button 
                  type="button"
                  onClick={() => startVerification('phone')}
                  className="bg-brand-primary text-brand-secondary px-6 rounded-2xl font-bold text-sm hover:scale-105 transition-all"
                >
                  Verificar
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-stone-500 uppercase tracking-wider ml-1">Endereço de Entrega</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-brand-primary text-brand-secondary py-5 rounded-[32px] font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Save size={24} />
          Salvar Alterações
        </button>
      </form>

      {/* Verification Modal */}
      <AnimatePresence>
        {isVerifying && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVerifying(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[40px] shadow-2xl z-[110] overflow-hidden p-10 text-center"
            >
              <button 
                onClick={() => setIsVerifying(null)}
                className="absolute right-6 top-6 text-stone-400 hover:text-stone-600"
              >
                <X size={24} />
              </button>

              <div className="w-16 h-16 bg-brand-secondary rounded-2xl flex items-center justify-center text-brand-primary mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>

              <h2 className="text-2xl font-black text-stone-900 mb-2">Verificação</h2>
              <p className="text-stone-500 text-sm mb-8">
                Enviamos um código de 6 dígitos para o seu {isVerifying === 'email' ? 'e-mail' : 'telefone'}.
              </p>

              <div className="space-y-6">
                <input 
                  type="text" 
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 text-center text-2xl font-black tracking-[0.5em] focus:ring-2 focus:ring-brand-primary/20 outline-none"
                />

                <button 
                  onClick={confirmVerification}
                  disabled={verificationCode.length < 6 || isLoading}
                  className="w-full bg-brand-primary text-brand-secondary py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Confirmar Código
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
