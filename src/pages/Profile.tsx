import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Phone, Mail, MapPin, Save, CheckCircle, ShieldCheck, ArrowRight, X, Navigation, ShoppingBag, Clock, Truck, Star, ChevronRight, Ticket, Plus, Heart, Trash2, RefreshCcw, Gift, Sparkles, TrendingUp, Users, Package, Minus, Wallet, Camera } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { User, Order, Product, SavedAddress } from '../types';
import { LocalDB } from '../services/localDB'; // Will be removed gradually
import { FirebaseService } from '../services/firebaseService';
import confetti from 'canvas-confetti';
import { serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';

const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface ProfileProps {
  user: User;
  onReorder: (order: Order) => void;
}

export default function Profile({ user, onReorder }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'perfil' | 'pedidos' | 'favoritos' | 'enderecos' | 'sweetclub' | 'wallet'>('perfil');
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email);
  const [address, setAddress] = useState(user.address || '');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressText, setNewAddressText] = useState('');
  const [coords, setCoords] = useState<[number, number]>([-23.5505, -46.6333]);

  // States to be migrated
  const [orders, setOrders] = useState<Order[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

  useEffect(() => {
    setName(user.name);
    setPhone(user.phone || '');
    setEmail(user.email);
    setAddress(user.address || '');

    // This part will be fully migrated to Firebase soon
    const fetchUserData = async () => {
      const allProducts = await FirebaseService.getProducts();
      setFavoriteProducts(allProducts.filter(p => user.favorites?.includes(p.id)));
      // Orders would be fetched here too
    };
    fetchUserData();

  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await FirebaseService.updateUser(user.id, { name, address });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLabel || !newAddressText) return;
    
    const newAddress: SavedAddress = {
      id: Math.random().toString(36).substr(2, 9), // Temporary ID
      label: newAddressLabel,
      address: newAddressText
    };
    
    try {
      await FirebaseService.updateUser(user.id, {
        savedAddresses: arrayUnion(newAddress)
      });
      setNewAddressLabel('');
      setNewAddressText('');
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleDeleteAddress = async (addressToDelete: SavedAddress) => {
    try {
      await FirebaseService.updateUser(user.id, {
        savedAddresses: arrayRemove(addressToDelete)
      });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    const isFavorited = user.favorites?.includes(productId);
    try {
      await FirebaseService.updateUser(user.id, {
        favorites: isFavorited ? arrayRemove(productId) : arrayUnion(productId)
      });
      // The UI will update automatically thanks to the real-time listener in App.tsx
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

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

  function MapEvents() {
    useMapEvents({
      click(e) {
        setCoords([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  // ... (Other functions like modals, etc. will be migrated next)

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
          <p className="text-stone-500">Membro desde {user.createdAt ? new Date(user.createdAt.seconds * 1000).getFullYear() : new Date().getFullYear()}</p>
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
          { id: 'wallet', label: 'Minha Carteira', icon: Wallet },
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
               {/* Other sections like Loyalty, Referral, etc. remain for now */}
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
                <label className="text-xs font-black text-stone-500 uppercase tracking-wider ml-1">Endereço Principal</label>
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
              disabled={isLoading}
              className="w-full bg-brand-primary text-brand-secondary py-5 rounded-[32px] font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={24} />}
              Salvar Alterações
            </button>
          </motion.form>
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
                <h3 className="text-xl font-display font-black text-stone-900">Meus Favoritos</h3>
                {favoriteProducts.length === 0 ? (
                  <p className="text-stone-500 mt-4">Sua lista de favoritos está vazia.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {favoriteProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 bg-stone-50 rounded-3xl border border-stone-100 group">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-stone-900">{product.name}</h4>
                          <p className="text-brand-primary font-black text-sm">R$ {product.price.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => handleToggleFavorite(product.id)}
                          className={`p-3 bg-white rounded-2xl shadow-sm hover:scale-110 transition-transform ${user.favorites?.includes(product.id) ? 'text-red-500' : 'text-stone-300'}`}
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
              <form onSubmit={handleAddAddress} className="mb-8 p-6 bg-stone-50 rounded-3xl border border-stone-100 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="Ex: Casa, Trabalho"
                    value={newAddressLabel}
                    onChange={(e) => setNewAddressLabel(e.target.value)}
                    className="md:col-span-1 bg-white border border-stone-200 rounded-2xl px-4 py-3 text-sm"/>
                  <input 
                    type="text" 
                    placeholder="Endereço completo"
                    value={newAddressText}
                    onChange={(e) => setNewAddressText(e.target.value)}
                    className="md:col-span-2 bg-white border border-stone-200 rounded-2xl px-4 py-3 text-sm"/>
                </div>
                <button type="submit" className="w-full bg-brand-primary text-brand-secondary py-3 rounded-2xl font-bold text-sm">Salvar Endereço</button>
              </form>

              <div className="space-y-4">
                {user.savedAddresses && user.savedAddresses.length > 0 ? (
                  user.savedAddresses.map((addr) => (
                    <div key={addr.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <div>
                        <h4 className="font-black text-stone-900">{addr.label}</h4>
                        <p className="text-xs text-stone-500">{addr.address}</p>
                      </div>
                      <button onClick={() => handleDeleteAddress(addr)} className="p-2 text-stone-400 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-400 text-sm italic text-center py-4">Nenhum endereço salvo.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
      {/* Modals will be migrated in the next steps */}
    </div>
  );
}
