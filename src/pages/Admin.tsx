import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Truck, 
  CheckCircle,
  Users
} from 'lucide-react';
import { Product, Order, OrderStatus, User } from '../types';
import { FirebaseService } from '../services/firebaseService';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'users'>('orders');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribeOrders = FirebaseService.subscribeToCollection('orders', (data) => {
        const formattedOrders = data.map(order => ({
            ...order,
            createdAt: order.createdAt?.toDate ? order.createdAt.toDate().toISOString() : order.createdAt,
        })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(formattedOrders as Order[]);
        setIsLoading(false);
    });

    const unsubscribeProducts = FirebaseService.subscribeToProducts(setProducts);
    const unsubscribeUsers = FirebaseService.subscribeToCollection('users', (data) => {
         const formattedUsers = data.map(user => ({
            ...user,
            createdAt: user.createdAt?.toDate ? user.createdAt.toDate().toISOString() : user.createdAt,
        }));
        setUsers(formattedUsers as User[]);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeUsers();
    };
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await FirebaseService.updateDocument('orders', orderId, { status });
  };

  const Sidebar = () => (
    <aside className="hidden md:flex w-64 bg-brand-primary text-brand-secondary p-6 flex-col gap-8 sticky top-0 h-screen">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-brand-secondary rounded-xl flex items-center justify-center text-brand-primary">
          <ShoppingBag size={24} />
        </div>
        <span className="text-xl font-black tracking-tighter">PAINEL</span>
      </div>

      <nav className="flex flex-col gap-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-brand-secondary text-brand-primary' : 'hover:bg-white/10'}`}
        >
          <LayoutDashboard size={20} /> Painel
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-brand-secondary text-brand-primary' : 'hover:bg-white/10'}`}
        >
          <ShoppingBag size={20} /> Pedidos
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-brand-secondary text-brand-primary' : 'hover:bg-white/10'}`}
        >
          <Package size={20} /> Produtos
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-brand-secondary text-brand-primary' : 'hover:bg-white/10'}`}
        >
          <Users size={20} /> Usuários
        </button>
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        {isLoading && <p>Carregando...</p>}

        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <header>
                  <h1 className="text-3xl font-black text-stone-900">Pedidos</h1>
                  <p className="text-stone-500">Gerencie as solicitações dos clientes</p>
                </header>

                <div className="bg-white rounded-[40px] shadow-sm border border-stone-100 overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-stone-50 text-stone-500 text-xs font-black uppercase tracking-wider">
                      <tr>
                        <th className="px-8 py-4">ID / Data</th>
                        <th className="px-8 py-4">Cliente</th>
                        <th className="px-8 py-4">Itens</th>
                        <th className="px-8 py-4">Total</th>
                        <th className="px-8 py-4">Status</th>
                        <th className="px-8 py-4">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-8 py-6">
                            <p className="font-bold text-stone-900">#{order.id.slice(-4)}</p>
                            <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="font-bold text-stone-900">{order.userName}</p>
                            <p className="text-xs text-stone-400">{order.phone}</p>
                          </td>
                          <td className="px-8 py-6 text-sm text-stone-600">
                            {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                          </td>
                          <td className="px-8 py-6 font-black text-brand-primary">R$ {order.total.toFixed(2)}</td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              order.status === 'Pendente' ? 'bg-amber-100 text-amber-600' :
                              order.status === 'Aceito' ? 'bg-blue-100 text-blue-600' :
                              order.status === 'Em Trânsito' ? 'bg-purple-100 text-purple-600' :
                              order.status === 'Entregue' ? 'bg-emerald-100 text-emerald-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex gap-2">
                              {order.status === 'Pendente' && (
                                <>
                                  <button 
                                    onClick={() => handleUpdateOrderStatus(order.id, 'Aceito')}
                                    className="p-2 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                                  >
                                    <Check size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateOrderStatus(order.id, 'Recusado')}
                                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                  >
                                    <X size={18} />
                                  </button>
                                </>)}
                              {order.status === 'Aceito' && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Em Trânsito')}
                                  className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                                >
                                  <Truck size={18} />
                                </button>)}
                              {order.status === 'Em Trânsito' && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Entregue')}
                                  className="p-2 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                                >
                                  <CheckCircle size={18} />
                                </button>)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
          )}
          
          {activeTab === 'products' && (
            <p>Gerenciamento de produtos em breve.</p>
          )}

          {activeTab === 'dashboard' && (
            <p>Painel em breve.</p>
          )}

          {activeTab === 'users' && (
            <p>Gerenciamento de usuários em breve.</p>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
