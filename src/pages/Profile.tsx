import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Phone, Mail, MapPin, Save, CheckCircle, ShieldCheck, ArrowRight, X, Navigation, ShoppingBag, Clock, Truck, Star, ChevronRight, Ticket, Plus, Heart, Trash2, RefreshCcw, Gift, Sparkles, TrendingUp, Users, Package, Minus, Wallet, Camera } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { User, Order, Product } from '../types';
import { LocalDB } from '../services/localDB';
import confetti from 'canvas-confetti';

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
  onReorder: (order: Order) => void;
}

export default function Profile({ user, onUpdate, onReorder }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos' | 'favoritos' | 'enderecos' | 'sweetclub' | 'wallet'>('perfil');
  const [favoriteFolders, setFavoriteFolders] = useState<any[]>(LocalDB.getFavoriteFolders());
  const [newFolderName, setNewFolderName] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
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
  const [isGoldenModalOpen, setIsGoldenModalOpen] = useState(false);
  const [selectedGoldenOrderId, setSelectedGoldenOrderId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(LocalDB.getProducts());
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>(
    LocalDB.getProducts().filter(p => user.favorites?.includes(p.id))
  );
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');

  const [isAddCreditsModalOpen, setIsAddCreditsModalOpen] = useState(false);
  const [addCreditsAmount, setAddCreditsAmount] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [walletTransactions, setWalletTransactions] = useState(LocalDB.getWalletTransactions(user.id).reverse());
  const [isRequestingCredits, setIsRequestingCredits] = useState(false);
  const [settings] = useState(LocalDB.getSettings());

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data.display_name) {
        if (activeTab === 'enderecos') {
          setNewAddressText(data.display_name);
        } else {
          setAddress(data.display_name);
        }
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

  const handleRequestCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCreditsAmount || !proofImage) return;
    
    setIsRequestingCredits(true);
    setTimeout(() => {
      LocalDB.requestCredits(user.id, user.name, parseFloat(addCreditsAmount), proofImage);
      setWalletTransactions(LocalDB.getWalletTransactions(user.id).reverse());
      setIsAddCreditsModalOpen(false);
      setAddCreditsAmount('');
      setProofImage(null);
      setIsRequestingCredits(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  const handleClaimGoldenTicket = (orderId: string) => {
    setSelectedGoldenOrderId(orderId);
    setIsGoldenModalOpen(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FFFFFF']
    });
  };

  const handleSelectFreeProduct = (product: Product) => {
    if (!selectedGoldenOrderId) return;

    // Mark as claimed
    LocalDB.claimGoldenTicket(selectedGoldenOrderId);
    
    // Create a free gift order
    const freeOrder: Order = {
      id: `GIFT-${Math.random().toString(36).substr(2, 6)}`,
      userId: user.id,
      userName: user.name,
      items: [{ ...product, quantity: 1 }],
      total: 0,
      status: 'Pendente',
      createdAt: new Date().toISOString(),
      address: user.address || '',
      phone: user.phone || '',
      paymentMethod: 'pix',
      pointsEarned: 0,
    };
    LocalDB.addOrder(freeOrder);
    
    // Refresh orders
    setOrders(LocalDB.getOrders().filter(o => o.userId === user.id).reverse());
    setIsGoldenModalOpen(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLabel || !newAddressText) return;
    
    const newAddress = {
      id: Math.random().toString(36).substr(2, 9),
      label: newAddressLabel,
      address: newAddressText
    };
    
    LocalDB.addAddress(user.id, newAddress);
    onUpdate(LocalDB.getCurrentUser()!);
    setNewAddressLabel('');
    setNewAddressText('');
  };

  const handleDeleteAddress = (id: string) => {
    LocalDB.deleteAddress(user.id, id);
    onUpdate(LocalDB.getCurrentUser()!);
  };

  const handleToggleFavorite = (productId: string) => {
    LocalDB.toggleFavorite(productId);
    const updatedUser = LocalDB.getCurrentUser()!;
    onUpdate(updatedUser);
    setFavoriteProducts(LocalDB.getProducts().filter(p => updatedUser.favorites?.includes(p.id)));
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <header className="mb-12 text-center">
        <div className="w-24 h-24 bg-brand-secondary rounded-3xl flex items-center justify-center text-brand-primary mx-auto mb-6 shadow-xl relative">
          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-3xl object-cover" />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white">
            <ShieldCheck size={16} />
          </div>
        </div>
        <h1 className="text-3xl font-display font-black text-stone-900">{user.name}</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <p className="text-stone-500">Membro desde {new Date().getFullYear()}</p>
          {user.loyaltyTier && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              user.loyaltyTier === 'Ouro' ? 'bg-yellow-400 text-yellow-900' :
              user.loyaltyTier === 'Prata' ? 'bg-stone-300 text-stone-700' :
              'bg-orange-400 text-orange-900'
            }`}>
              Nível {user.loyaltyTier}
            </span>
          )}
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {[
          { id: 'perfil', label: 'Dados Pessoais', icon: UserIcon },
          { id: 'pedidos', label: 'Meus Pedidos', icon: ShoppingBag },
          { id: 'favoritos', label: 'Favoritos', icon: Heart },
          { id: 'enderecos', label: 'Endereços', icon: MapPin },
          { id: 'sweetclub', label: 'Sweet Club', icon: Gift },
          { id: 'wallet', label: 'Minha Carteira', icon: ShoppingBag },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-brand-primary text-brand-secondary shadow-lg shadow-brand-primary/20 scale-105' 
                : 'bg-white text-stone-500 border border-stone-100 hover:bg-stone-50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

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

      <AnimatePresence mode="wait">
        {activeTab === 'perfil' && (
          <motion.form 
            key="perfil"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSave} 
            className="space-y-8"
          >
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

            <div className="bg-gradient-to-br from-stone-900 to-stone-800 p-8 rounded-[40px] shadow-2xl text-white space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <Users size={120} />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  <Users size={14} /> Indique e Ganhe
                </div>
                <h3 className="text-2xl font-display font-black mb-2">Ganhe R$ 10,00 por Amigo!</h3>
                <p className="text-stone-400 text-sm mb-6 max-w-sm">Compartilhe seu código e quando seu amigo fizer a primeira compra, ambos ganham créditos!</p>
                
                <div className="flex gap-3">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 font-mono font-bold text-lg flex items-center justify-between">
                    {user.referralCode || 'DOCE-123'}
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(user.referralCode || 'DOCE-123');
                        alert('Código copiado!');
                      }}
                      className="text-brand-primary hover:text-white transition-colors"
                    >
                      <Save size={20} />
                    </button>
                  </div>
                  <button type="button" className="bg-brand-primary text-brand-secondary px-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all">
                    Convidar
                  </button>
                </div>
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
                <label className="text-xs font-black text-stone-500 uppercase tracking-wider ml-1">Endereço Principal</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {user.savedAddresses && user.savedAddresses.length > 0 ? (
                    user.savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => setAddress(addr.address)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${
                          address === addr.address 
                            ? 'border-brand-primary bg-brand-primary/5 shadow-md' 
                            : 'border-stone-100 bg-stone-50 hover:border-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className={address === addr.address ? 'text-brand-primary' : 'text-stone-400'} />
                          <span className={`text-xs font-black uppercase tracking-wider ${address === addr.address ? 'text-brand-primary' : 'text-stone-600'}`}>
                            {addr.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 line-clamp-2 leading-tight">
                          {addr.address}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-full p-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center">
                      <p className="text-xs text-stone-400 italic">Nenhum endereço salvo. Adicione um na aba "Endereços".</p>
                    </div>
                  )}
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
          </motion.form>
        )}

        {activeTab === 'pedidos' && (
          <motion.div 
            key="pedidos"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100">
              <h3 className="text-xl font-display font-black text-stone-900 mb-6">Histórico de Pedidos</h3>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-stone-50 rounded-3xl flex items-center justify-center text-stone-300 mx-auto mb-4">
                    <ShoppingBag size={32} />
                  </div>
                  <p className="text-stone-500 font-medium">Você ainda não fez nenhum pedido.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="p-6 bg-stone-50 rounded-[32px] border border-stone-100 hover:bg-white hover:shadow-xl transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            order.status === 'Entregue' ? 'bg-emerald-50 text-emerald-500' :
                            order.status === 'Recusado' ? 'bg-red-50 text-red-500' :
                            'bg-brand-primary/10 text-brand-primary'
                          }`}>
                            {order.status === 'Entregue' ? <CheckCircle size={24} /> :
                             order.status === 'Em Trânsito' ? <Truck size={24} /> :
                             <Clock size={24} />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Pedido #{order.id.slice(-6)}</p>
                            <p className="font-black text-stone-900">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${
                            order.status === 'Entregue' ? 'bg-emerald-500 text-white' :
                            order.status === 'Recusado' ? 'bg-red-500 text-white' :
                            'bg-brand-primary text-brand-secondary'
                          }`}>
                            {order.status}
                          </span>
                          <button 
                            onClick={() => onReorder(order)}
                            className="flex items-center gap-1.5 text-[10px] font-black text-brand-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
                          >
                            <RefreshCcw size={12} /> Pedir Novamente
                          </button>
                        </div>
                      </div>

                      {order.isGoldenTicket && (
                        <div className={`mb-6 p-5 rounded-3xl border-2 border-dashed flex items-center justify-between transition-all ${
                          order.goldenTicketClaimed 
                            ? 'bg-stone-50 border-stone-200 opacity-60' 
                            : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-yellow-400 shadow-xl shadow-yellow-200/50 animate-pulse'
                        }`}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-400 text-white rounded-2xl flex items-center justify-center shadow-lg">
                              <Ticket size={24} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Ticket de Ouro!</p>
                              <p className="text-sm font-bold text-stone-700">
                                {order.goldenTicketClaimed ? 'Prêmio já resgatado' : 'Você ganhou um doce grátis!'}
                              </p>
                            </div>
                          </div>
                          {!order.goldenTicketClaimed && (
                            <button 
                              onClick={() => handleClaimGoldenTicket(order.id)}
                              className="bg-yellow-400 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-lg"
                            >
                              Resgatar
                            </button>
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-3 mb-6 bg-white/50 p-4 rounded-2xl">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="font-bold text-stone-600">{item.quantity}x {item.name}</span>
                            <span className="font-black text-stone-900">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-stone-100 flex justify-between items-center">
                        <span className="text-sm font-black text-stone-400 uppercase tracking-widest">Valor Total</span>
                        <span className="text-2xl font-black text-brand-primary">R$ {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'favoritos' && (
          <motion.div 
            key="favoritos"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-display font-black text-stone-900">Meus Favoritos</h3>
                <button 
                  onClick={() => setIsAddingFolder(true)}
                  className="text-brand-primary font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:underline"
                >
                  <Plus size={16} /> Nova Pasta
                </button>
              </div>

              {isAddingFolder && (
                <div className="mb-8 p-6 bg-stone-50 rounded-3xl border border-stone-100 flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Nome da pasta (ex: Chocolates)"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    className="flex-1 bg-white border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  />
                  <button 
                    onClick={() => {
                      if (!newFolderName) return;
                      const newFolder = { id: Date.now().toString(), name: newFolderName, productIds: [] };
                      const updated = [...favoriteFolders, newFolder];
                      setFavoriteFolders(updated);
                      LocalDB.saveFavoriteFolders(updated);
                      setNewFolderName('');
                      setIsAddingFolder(false);
                    }}
                    className="bg-brand-primary text-brand-secondary px-6 rounded-2xl font-bold text-sm"
                  >
                    Criar
                  </button>
                </div>
              )}

              {favoriteFolders.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                  {favoriteFolders.map(folder => (
                    <div key={folder.id} className="p-6 bg-stone-50 rounded-[32px] border border-stone-100 hover:bg-white hover:shadow-xl transition-all cursor-pointer group">
                      <div className="w-12 h-12 bg-white text-brand-primary rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <Package size={24} />
                      </div>
                      <h4 className="font-black text-stone-900 text-sm">{folder.name}</h4>
                      <p className="text-[10px] text-stone-400 font-bold uppercase">{folder.productIds.length} Itens</p>
                    </div>
                  ))}
                </div>
              )}

              {favoriteProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-stone-50 rounded-3xl flex items-center justify-center text-stone-300 mx-auto mb-4">
                    <Heart size={32} />
                  </div>
                  <p className="text-stone-500 font-medium">Sua lista de favoritos está vazia.</p>
                  <button 
                    onClick={() => window.location.href = '/produtos'}
                    className="mt-6 text-brand-primary font-black uppercase tracking-widest text-xs hover:underline"
                  >
                    Explorar Cardápio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 bg-stone-50 rounded-3xl border border-stone-100 group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-stone-900">{product.name}</h4>
                        <p className="text-brand-primary font-black text-sm">R$ {product.price.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={() => handleToggleFavorite(product.id)}
                        className="p-3 bg-white text-red-500 rounded-2xl shadow-sm hover:scale-110 transition-transform"
                      >
                        <Heart size={20} fill="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'enderecos' && (
          <motion.div 
            key="enderecos"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100">
              <h3 className="text-xl font-display font-black text-stone-900 mb-6">Endereços Salvos</h3>
              
              <form onSubmit={handleAddAddress} className="mb-8 p-6 bg-stone-50 rounded-3xl border border-stone-100 space-y-6">
                <p className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Adicionar Novo Endereço</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="Ex: Casa, Trabalho"
                    value={newAddressLabel}
                    onChange={(e) => setNewAddressLabel(e.target.value)}
                    className="md:col-span-1 bg-white border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Endereço completo"
                    value={newAddressText}
                    onChange={(e) => setNewAddressText(e.target.value)}
                    className="md:col-span-2 bg-white border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Selecione no Mapa</label>
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
                  <div className="h-64 rounded-3xl overflow-hidden border border-stone-200 shadow-inner relative z-0">
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
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-primary text-brand-secondary py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                >
                  <Plus size={18} /> Salvar Endereço
                </button>
              </form>

              <div className="space-y-4">
                {user.savedAddresses && user.savedAddresses.length > 0 ? (
                  user.savedAddresses.map((addr) => (
                    <div key={addr.id} className="flex items-center justify-between p-6 bg-stone-50 rounded-3xl border border-stone-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white text-brand-primary rounded-2xl flex items-center justify-center shadow-sm">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-stone-900">{addr.label}</h4>
                          <p className="text-xs text-stone-500">{addr.address}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-3 text-stone-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-stone-400 text-sm italic">Nenhum endereço secundário salvo.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'sweetclub' && (
          <motion.div
            key="sweetclub"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="bg-brand-primary rounded-[40px] p-10 text-brand-secondary relative overflow-hidden shadow-2xl shadow-brand-primary/20">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <Sparkles size={120} />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-display font-black mb-4">Sweet Club</h2>
                <p className="text-brand-secondary/80 mb-8 max-w-md text-lg">
                  {user.subscription?.status === 'Ativo' 
                    ? `Sua assinatura está ativa! Próxima caixa surpresa: ${new Date(user.subscription.nextBoxDate).toLocaleDateString()}`
                    : 'Assine o Sweet Club e receba uma caixa surpresa com nossos melhores doces toda semana.'}
                </p>
                {user.subscription?.status === 'Ativo' ? (
                  <div className="flex gap-4">
                    <button className="bg-white/20 backdrop-blur-md text-brand-secondary px-6 py-3 rounded-2xl font-bold text-sm">Gerenciar Assinatura</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      LocalDB.subscribeToSweetClub(user.id, 'Mensal');
                      onUpdate(LocalDB.getCurrentUser()!);
                    }}
                    className="bg-brand-secondary text-brand-primary px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-xl"
                  >
                    Assinar por R$ 49,90/mês
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Frete Grátis', desc: 'Em todos os pedidos acima de R$ 30', icon: Truck },
                { title: 'Caixa Surpresa', desc: 'Toda semana um mix de novidades', icon: Gift },
                { title: 'Pontos em Dobro', desc: 'Ganhe 2x mais pontos em cada compra', icon: TrendingUp }
              ].map(benefit => (
                <div key={benefit.title} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                  <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mb-4">
                    <benefit.icon size={24} />
                  </div>
                  <h4 className="font-bold text-stone-900 mb-1">{benefit.title}</h4>
                  <p className="text-xs text-stone-500">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Golden Ticket Modal */}
      <AnimatePresence>
        {isGoldenModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGoldenModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[40px] shadow-2xl z-[110] overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-center relative">
                <button 
                  onClick={() => setIsGoldenModalOpen(false)}
                  className="absolute right-6 top-6 text-white/50 hover:text-white"
                >
                  <X size={24} />
                </button>
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                  <Ticket size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-black mb-2">Parabéns!</h2>
                <p className="font-bold text-yellow-100">Você encontrou o Ticket de Ouro. Escolha qualquer doce do nosso cardápio por nossa conta!</p>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                {products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectFreeProduct(product)}
                    className="w-full flex items-center gap-4 p-4 bg-stone-50 rounded-3xl border border-stone-100 hover:bg-white hover:shadow-lg transition-all group text-left"
                  >
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-stone-200">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-stone-900">{product.name}</h4>
                      <p className="text-xs text-stone-500 line-clamp-1">{product.description}</p>
                    </div>
                    <div className="bg-yellow-400 text-white p-2 rounded-xl group-hover:scale-110 transition-transform">
                      <Plus size={20} />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
        {activeTab === 'wallet' && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="bg-brand-secondary rounded-[40px] p-10 text-brand-primary relative overflow-hidden shadow-2xl shadow-brand-secondary/20">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <ShoppingBag size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Saldo Disponível</p>
                <h2 className="text-5xl font-display font-black mb-8">R$ {user.walletBalance?.toFixed(2) || '0,00'}</h2>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsAddCreditsModalOpen(true)}
                    className="bg-brand-primary text-brand-secondary px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                  >
                    Adicionar Créditos
                  </button>
                  <button className="bg-white/50 backdrop-blur-md text-brand-primary px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all">
                    Extrato
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100">
              <h3 className="text-xl font-display font-black text-stone-900 mb-6">Últimas Transações</h3>
              <div className="space-y-4">
                {walletTransactions.length > 0 ? (
                  walletTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.type === 'credit' 
                            ? tx.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'
                            : 'bg-red-50 text-red-500'
                        }`}>
                          {tx.type === 'credit' ? <Plus size={20} /> : <Minus size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{tx.description}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-stone-400 font-bold uppercase">
                              {new Date(tx.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            {tx.status === 'pending' && (
                              <span className="text-[8px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-black uppercase">Pendente</span>
                            )}
                            {tx.status === 'rejected' && (
                              <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-black uppercase">Recusado</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`font-black ${tx.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.type === 'credit' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-stone-400 text-sm italic">Nenhuma transação encontrada.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Modal */}
      <AnimatePresence>
        {isAddCreditsModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddCreditsModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[40px] shadow-2xl z-[110] overflow-hidden p-10"
            >
              <button 
                onClick={() => setIsAddCreditsModalOpen(false)}
                className="absolute right-6 top-6 text-stone-400 hover:text-stone-600"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-secondary rounded-2xl flex items-center justify-center text-brand-primary mx-auto mb-4">
                  <Plus size={32} />
                </div>
                <h2 className="text-2xl font-black text-stone-900">Adicionar Créditos</h2>
                <p className="text-stone-500 text-sm">Transfira via PIX e envie o comprovante</p>
              </div>

              <form onSubmit={handleRequestCredits} className="space-y-6">
                <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Chave PIX (Admin)</span>
                    <span className="text-xs font-bold text-brand-primary">{settings.pixKey || 'Não configurada'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Beneficiário</span>
                    <span className="text-xs font-bold text-brand-primary">{settings.pixName || 'Não configurado'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-500 uppercase tracking-wider ml-1">Valor da Recarga (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={addCreditsAmount}
                    onChange={(e) => setAddCreditsAmount(e.target.value)}
                    placeholder="Ex: 50,00"
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-500 uppercase tracking-wider ml-1">Comprovante (Imagem)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      required
                      onChange={handleProofFileChange}
                      className="hidden"
                      id="proof-upload"
                    />
                    <label 
                      htmlFor="proof-upload"
                      className={`w-full flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                        proofImage ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-stone-200 bg-stone-50 text-stone-400 hover:border-brand-primary hover:bg-brand-primary/5'
                      }`}
                    >
                      {proofImage ? (
                        <>
                          <CheckCircle size={32} />
                          <span className="text-xs font-bold uppercase tracking-widest">Comprovante Selecionado</span>
                        </>
                      ) : (
                        <>
                          <Camera size={32} />
                          <span className="text-xs font-bold uppercase tracking-widest">Clique para enviar foto</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isRequestingCredits}
                  className="w-full bg-brand-primary text-brand-secondary py-5 rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isRequestingCredits ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2 justify-center">
                      <Save size={24} />
                      Solicitar Créditos
                    </div>
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}

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
