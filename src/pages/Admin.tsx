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
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  Save
} from 'lucide-react';
import { Product, Order, OrderStatus } from '../types';
import { LocalDB } from '../services/localDB';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    promoPrice: '',
    image: '',
    category: 'Brigadeiros',
    deliveryTime: '20-30 min'
  });

  useEffect(() => {
    setProducts(LocalDB.getProducts());
    setOrders(LocalDB.getOrders());
  }, []);

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    LocalDB.updateOrderStatus(orderId, status);
    setOrders(LocalDB.getOrders());
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : undefined,
      image: formData.image || 'https://picsum.photos/seed/new/400/400',
      category: formData.category,
      rating: editingProduct?.rating || 5.0,
      deliveryTime: formData.deliveryTime
    };

    if (editingProduct) {
      LocalDB.updateProduct(product);
    } else {
      LocalDB.addProduct(product);
    }

    setProducts(LocalDB.getProducts());
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      promoPrice: '',
      image: '',
      category: 'Brigadeiros',
      deliveryTime: '20-30 min'
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      LocalDB.deleteProduct(id);
      setProducts(LocalDB.getProducts());
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      promoPrice: product.promoPrice?.toString() || '',
      image: product.image,
      category: product.category,
      deliveryTime: product.deliveryTime
    });
    setIsProductModalOpen(true);
  };

  // Mock data for charts
  const statsData = [
    { name: 'Seg', sales: 400, revenue: 2400 },
    { name: 'Ter', sales: 300, revenue: 1398 },
    { name: 'Qua', sales: 200, revenue: 9800 },
    { name: 'Qui', sales: 278, revenue: 3908 },
    { name: 'Sex', sales: 189, revenue: 4800 },
    { name: 'Sáb', sales: 239, revenue: 3800 },
    { name: 'Dom', sales: 349, revenue: 4300 },
  ];

  const monthlyData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Fev', revenue: 3000 },
    { name: 'Mar', revenue: 2000 },
    { name: 'Abr', revenue: 2780 },
    { name: 'Mai', revenue: 1890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
    { name: 'Ago', revenue: 4000 },
    { name: 'Set', revenue: 3000 },
    { name: 'Out', revenue: 2000 },
    { name: 'Nov', revenue: 2780 },
    { name: 'Dez', revenue: 1890 },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-brand-primary text-brand-secondary p-6 flex-col gap-8 sticky top-0 h-screen">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-brand-secondary rounded-xl flex items-center justify-center text-brand-primary">
            <ShoppingBag size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter">ADMIN</span>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-brand-secondary text-brand-primary' : 'hover:bg-white/10'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
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
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-brand-primary text-brand-secondary p-4 sticky top-0 z-50 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-secondary rounded-lg flex items-center justify-center text-brand-primary">
            <ShoppingBag size={18} />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">{activeTab}</span>
        </div>
        <nav className="flex gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`p-2 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-brand-secondary text-brand-primary' : 'text-brand-secondary/60'}`}
          >
            <LayoutDashboard size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`p-2 rounded-lg transition-all ${activeTab === 'orders' ? 'bg-brand-secondary text-brand-primary' : 'text-brand-secondary/60'}`}
          >
            <ShoppingBag size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`p-2 rounded-lg transition-all ${activeTab === 'products' ? 'bg-brand-secondary text-brand-primary' : 'text-brand-secondary/60'}`}
          >
            <Package size={20} />
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <header>
              <h1 className="text-3xl font-black text-stone-900">Dashboard</h1>
              <p className="text-stone-500">Visão geral do seu negócio</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-bold">RECEITA TOTAL</p>
                  <p className="text-2xl font-black text-stone-900">R$ {LocalDB.getStats().totalRevenue.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-bold">PEDIDOS ENTREGUES</p>
                  <p className="text-2xl font-black text-stone-900">{LocalDB.getStats().orderCount}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-bold">CRESCIMENTO</p>
                  <p className="text-2xl font-black text-stone-900">+12.5%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100">
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <Calendar size={20} className="text-brand-primary" /> Vendas Semanais
                </h3>
                <div className="h-[250px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={statsData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#61401E" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#61401E" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#61401E" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100">
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-brand-primary" /> Receita Anual
                </h3>
                <div className="h-[250px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        cursor={{fill: '#f9f5f0'}}
                      />
                      <Bar dataKey="revenue" fill="#61401E" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-stone-900">Pedidos</h1>
                <p className="text-stone-500">Gerencie as solicitações dos clientes</p>
              </div>
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
                        <p className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-stone-900">{order.userName}</p>
                        <p className="text-xs text-stone-400">{order.phone}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-stone-600">{order.items.length} itens</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-black text-brand-primary">R$ {order.total.toFixed(2)}</p>
                      </td>
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
                                title="Aceitar Pedido"
                              >
                                <Check size={18} />
                              </button>
                              <button 
                                onClick={() => handleUpdateOrderStatus(order.id, 'Recusado')}
                                className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                title="Recusar Pedido"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                          {order.status === 'Aceito' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Em Trânsito')}
                              className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                              title="Enviar Pedido"
                            >
                              <Truck size={18} />
                            </button>
                          )}
                          {order.status === 'Em Trânsito' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(order.id, 'Entregue')}
                              className="p-2 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                              title="Confirmar Entrega"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-stone-900">Produtos</h1>
                <p className="text-stone-500">Gerencie seu cardápio</p>
              </div>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    promoPrice: '',
                    image: '',
                    category: 'Brigadeiros',
                    deliveryTime: '20-30 min'
                  });
                  setIsProductModalOpen(true);
                }}
                className="bg-brand-primary text-brand-secondary px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
              >
                <Plus size={20} /> Novo Produto
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-stone-100 group">
                  <div className="relative h-48">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-stone-600 hover:text-brand-primary transition-colors shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-stone-600 hover:text-red-500 transition-colors shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-stone-900 mb-1">{product.name}</h3>
                    <p className="text-xs text-stone-400 mb-4">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.promoPrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-brand-primary font-black">R$ {product.promoPrice.toFixed(2)}</span>
                            <span className="text-xs text-stone-400 line-through">R$ {product.price.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-brand-primary font-black">R$ {product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[40px] shadow-2xl z-[90] overflow-hidden"
            >
              <form onSubmit={handleSaveProduct} className="p-6 md:p-10 space-y-6 max-h-[90vh] overflow-y-auto">
                <header className="flex justify-between items-center mb-4">
                  <h2 className="text-xl md:text-2xl font-black text-stone-900">
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </h2>
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                    <X size={24} />
                  </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Nome do Produto</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Descrição</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none h-24 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Preço (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Preço Promocional (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.promoPrice}
                      onChange={e => setFormData({...formData, promoPrice: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Categoria</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    >
                      <option>Brigadeiros</option>
                      <option>Bolos</option>
                      <option>Tortas</option>
                      <option>Cookies</option>
                      <option>Gelados</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Tempo de Entrega</label>
                    <input 
                      type="text" 
                      required
                      value={formData.deliveryTime}
                      onChange={e => setFormData({...formData, deliveryTime: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">URL da Imagem</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                      <input 
                        type="url" 
                        value={formData.image}
                        onChange={e => setFormData({...formData, image: e.target.value})}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-primary text-brand-secondary py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Salvar Produto
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
