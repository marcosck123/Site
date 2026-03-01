import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Phone, Mail, MapPin, Save, CheckCircle, ShieldCheck, ArrowRight, X, Navigation, ShoppingBag, Clock, Truck, Star, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { User, Order } from '../types';
import { LocalDB } from '../services/localDB';

// Fix for default marker icon
const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export default function Profile({ user, onUpdate }: ProfileProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState(user.address || '');
  const [coords, setCoords] = useState<[number, number]>([-23.5505, -46.6333]); // Default to São Paulo
  const [isLocating, setIsLocating] = useState(false);
  
  const [isVerifying, setIsVerifying] = useState<'email' | 'phone' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>(LocalDB.getOrders().filter(o => o.userId === user.id).reverse());

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleLocationClick = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords([latitude, longitude]);
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLocating(false);
      }
    );
  };

  function MapEvents() {
    useMapEvents({
      click(e) {
        setCoords([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
  }

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-black text-stone-900">Programa de Fidelidade</h4>
                <p className="text-sm text-stone-500">Acumule pontos e ganhe descontos</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-brand-primary">{user.points || 0}</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase">Pontos Atuais</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-stone-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-stone-400 uppercase tracking-wider">Próximo Desconto</span>
              <span className="text-xs font-bold text-brand-primary">{(user.points || 0) % 100}/100</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (user.points || 0) % 100)}%` }}
                className="h-full bg-brand-primary"
              />
            </div>
            <p className="text-[10px] text-stone-400 mt-2">Faltam {100 - ((user.points || 0) % 100)} pontos para você ganhar R$ 10,00 de desconto!</p>
          </div>
        </div>

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

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-black text-stone-500 uppercase tracking-wider ml-1">Mapa de Entrega</label>
              <button 
                type="button"
                onClick={handleLocationClick}
                disabled={isLocating}
                className="text-[10px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity disabled:opacity-50"
              >
                <Navigation size={12} />
                {isLocating ? 'Localizando...' : 'Minha Localização'}
              </button>
            </div>
            <div className="h-64 rounded-[32px] overflow-hidden border border-stone-100 shadow-inner relative z-0">
              <MapContainer 
                center={coords} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coords} icon={defaultIcon} />
                <MapEvents />
                <ChangeView center={coords} />
              </MapContainer>
              <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl text-[10px] font-bold text-stone-500 z-[400] pointer-events-none">
                Clique no mapa para ajustar o ponto de entrega com precisão.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100 space-y-6">
          <h3 className="text-xl font-black text-stone-900 mb-4">Meus Pedidos</h3>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 mx-auto mb-4">
                <ShoppingBag size={24} />
              </div>
              <p className="text-stone-500 text-sm">Você ainda não fez nenhum pedido.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-6 bg-stone-50 rounded-[32px] border border-stone-100 hover:bg-white hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        order.status === 'Entregue' ? 'bg-emerald-50 text-emerald-500' :
                        order.status === 'Recusado' ? 'bg-red-50 text-red-500' :
                        'bg-brand-primary/10 text-brand-primary'
                      }`}>
                        {order.status === 'Entregue' ? <CheckCircle size={20} /> :
                         order.status === 'Em Trânsito' ? <Truck size={20} /> :
                         <Clock size={20} />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-stone-400 uppercase tracking-widest">Pedido #{order.id.slice(-6)}</p>
                        <p className="font-bold text-stone-900">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      order.status === 'Entregue' ? 'bg-emerald-500 text-white' :
                      order.status === 'Recusado' ? 'bg-red-500 text-white' :
                      'bg-brand-primary text-brand-secondary'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-stone-500">
                        <span>{item.quantity}x {item.name}</span>
                        <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
                    <span className="text-sm font-black text-stone-900">Total</span>
                    <span className="text-lg font-black text-brand-primary">R$ {order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
