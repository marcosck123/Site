import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Plus, 
  Minus,
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
  Save,
  Phone,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  Ticket,
  Settings,
  UserCheck,
  FileText,
  Printer,
  Moon,
  Sun,
  Download,
  Star
} from 'lucide-react';
import { Product, Order, OrderStatus, Coupon, Driver, AppSettings, Ingredient } from '../types';
import { LocalDB } from '../services/localDB';
import { exportOrdersToPDF, exportOrdersToExcel } from '../utils/reports';
import { useTheme } from '../ThemeContext';
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
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'categories' | 'coupons' | 'drivers' | 'settings' | 'users' | 'inventory'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [settings, setSettings] = useState<AppSettings>(LocalDB.getSettings());
  const [newCategory, setNewCategory] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  // Driver Form State
  const [driverFormData, setDriverFormData] = useState({
    name: '',
    phone: ''
  });

  // Coupon Form State
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    expiresInDays: '7'
  });

  // Ingredient Form State
  const [ingredientFormData, setIngredientFormData] = useState({
    name: '',
    unit: 'kg',
    stock: '',
    minStock: '',
    costPrice: '',
    image: ''
  });

  // Product Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    promoPrice: '',
    costPrice: '',
    image: '',
    category: '',
    deliveryTime: '20-30 min',
    stock: '',
    isCombo: false,
    comboItems: [] as string[],
    flashSalePrice: '',
    flashSaleEnd: '',
    tags: ''
  });

  useEffect(() => {
    setProducts(LocalDB.getProducts());
    setOrders(LocalDB.getOrders());
    setUsers(LocalDB.getUsers());
    setCoupons(LocalDB.getCoupons());
    setDrivers(LocalDB.getDrivers());
    setIngredients(LocalDB.getIngredients());
    setSettings(LocalDB.getSettings());
    const cats = LocalDB.getCategories();
    setCategories(cats);
    if (cats.length > 0) {
      setFormData(prev => ({ ...prev, category: cats[0] }));
    }
  }, []);

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    LocalDB.updateOrderStatus(orderId, status);
    setOrders(LocalDB.getOrders());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      promoPrice: formData.promoPrice ? parseFloat(formData.promoPrice) : undefined,
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
      image: formData.image || 'https://picsum.photos/seed/new/400/400',
      category: formData.category,
      rating: editingProduct?.rating || 5.0,
      deliveryTime: formData.deliveryTime,
      stock: formData.stock ? parseInt(formData.stock) : undefined,
      isCombo: formData.isCombo,
      comboItems: formData.comboItems,
      flashSalePrice: formData.flashSalePrice ? parseFloat(formData.flashSalePrice) : undefined,
      flashSaleEnd: formData.flashSaleEnd || undefined,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== '')
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
      category: categories[0] || 'Geral',
      deliveryTime: '20-30 min'
    });
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, stock: newStock } : p
    );
    setProducts(updatedProducts);
    LocalDB.saveProducts(updatedProducts);
  };

  const handleUpdateUserPoints = (userId: string, newPoints: number) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, points: newPoints } : u
    );
    setUsers(updatedUsers);
    LocalDB.updateUserPoints(userId, newPoints);
  };

  const handleUpdateIngredientStock = (id: string, newStock: number) => {
    const updated = ingredients.map(i => i.id === id ? { ...i, stock: newStock } : i);
    setIngredients(updated);
    LocalDB.saveIngredients(updated);
  };

  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const ingredient: Ingredient = {
      id: editingIngredient?.id || Date.now().toString(),
      name: ingredientFormData.name,
      unit: ingredientFormData.unit,
      stock: parseFloat(ingredientFormData.stock),
      minStock: parseFloat(ingredientFormData.minStock),
      costPrice: parseFloat(ingredientFormData.costPrice),
      image: ingredientFormData.image || 'https://picsum.photos/seed/ing/400/400'
    };

    if (editingIngredient) {
      LocalDB.updateIngredient(ingredient);
    } else {
      LocalDB.addIngredient(ingredient);
    }

    setIngredients(LocalDB.getIngredients());
    setIsIngredientModalOpen(false);
    setEditingIngredient(null);
    setIngredientFormData({
      name: '',
      unit: 'kg',
      stock: '',
      minStock: '',
      costPrice: '',
      image: ''
    });
  };

  const handleDeleteIngredient = (id: string) => {
    if (confirm('Excluir este ingrediente?')) {
      LocalDB.deleteIngredient(id);
      setIngredients(LocalDB.getIngredients());
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      alert('Esta categoria já existe!');
      return;
    }
    const updated = [...categories, newCategory.trim()];
    setCategories(updated);
    LocalDB.saveCategories(updated);
    setNewCategory('');
  };

  const handleDeleteCategory = (cat: string) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${cat}"?`)) {
      const updated = categories.filter(c => c !== cat);
      setCategories(updated);
      LocalDB.saveCategories(updated);
    }
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(couponFormData.expiresInDays));

    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: couponFormData.code.toUpperCase(),
      discountType: couponFormData.discountType,
      discountValue: parseFloat(couponFormData.discountValue),
      expiresAt: expiresAt.toISOString(),
      isActive: true
    };

    LocalDB.addCoupon(newCoupon);
    setCoupons(LocalDB.getCoupons());
    setIsCouponModalOpen(false);
    setCouponFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      expiresInDays: '7'
    });
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      LocalDB.deleteCoupon(id);
      setCoupons(LocalDB.getCoupons());
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      LocalDB.deleteProduct(id);
      setProducts(LocalDB.getProducts());
    }
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const newDriver: Driver = {
      id: Date.now().toString(),
      name: driverFormData.name,
      phone: driverFormData.phone,
      isActive: true
    };
    const updated = [...drivers, newDriver];
    setDrivers(updated);
    LocalDB.saveDrivers(updated);
    setIsDriverModalOpen(false);
    setDriverFormData({ name: '', phone: '' });
  };

  const handleDeleteDriver = (id: string) => {
    if (confirm('Excluir este entregador?')) {
      const updated = drivers.filter(d => d.id !== id);
      setDrivers(updated);
      LocalDB.saveDrivers(updated);
    }
  };

  const handleAssignDriver = (orderId: string, driverId: string) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, driverId } : o);
    setOrders(updatedOrders);
    LocalDB.saveOrders(updatedOrders);
  };

  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Pedido #${order.id.slice(-6)}</title></head>
          <body style="font-family: sans-serif; padding: 20px;">
            <h1>Doce Entrega - Pedido #${order.id.slice(-6)}</h1>
            <p><strong>Cliente:</strong> ${order.userName}</p>
            <p><strong>Telefone:</strong> ${order.phone}</p>
            <p><strong>Endereço:</strong> ${order.address}</p>
            <hr/>
            <h3>Itens:</h3>
            <ul>
              ${order.items.map(item => `<li>${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
            </ul>
            <hr/>
            <p><strong>Pagamento:</strong> ${order.paymentMethod}</p>
            <h2>Total: R$ ${order.total.toFixed(2)}</h2>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      promoPrice: product.promoPrice?.toString() || '',
      costPrice: product.costPrice?.toString() || '',
      image: product.image,
      category: product.category,
      deliveryTime: product.deliveryTime,
      stock: product.stock?.toString() || '',
      isCombo: product.isCombo || false,
      comboItems: product.comboItems || [],
      flashSalePrice: product.flashSalePrice?.toString() || '',
      flashSaleEnd: product.flashSaleEnd || '',
      tags: product.tags?.join(', ') || ''
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
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-brand-secondary text-brand-primary' : 'hover:bg-white/10'}`}
          >
            <Package size={20} className="text-orange-400" /> Estoque
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'categories' ? 'bg-brand-secondary text-brand-primary' : 'hover:bg-white/10'}`}
          >
            <Tag size={20} /> Categorias
          </button>
          <button 
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'coupons' ? 'bg-brand-secondary text-brand-primary' : 'hover:bg-white/10'}`}
          >
            <Ticket size={20} /> Cupons
          </button>
          <button 
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'drivers' ? 'bg-brand-secondary text-brand-primary' : 'hover:bg-white/10'}`}
          >
            <Truck size={20} /> Entregadores
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-brand-secondary text-brand-primary' : 'hover:bg-white/10'}`}
          >
            <Users size={20} /> Usuários
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-brand-secondary text-brand-primary' : 'hover:bg-white/10'}`}
          >
            <Settings size={20} /> Configurações
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all hover:bg-white/10 w-full"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          </button>
        </div>
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
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`p-2 rounded-lg transition-all ${activeTab === 'inventory' ? 'bg-brand-secondary text-brand-primary' : 'text-brand-secondary/60'}`}
          >
            <Package size={20} className="text-orange-400" />
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`p-2 rounded-lg transition-all ${activeTab === 'categories' ? 'bg-brand-secondary text-brand-primary' : 'text-brand-secondary/60'}`}
          >
            <Tag size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('coupons')}
            className={`p-2 rounded-lg transition-all ${activeTab === 'coupons' ? 'bg-brand-secondary text-brand-primary' : 'text-brand-secondary/60'}`}
          >
            <Ticket size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`p-2 rounded-lg transition-all ${activeTab === 'users' ? 'bg-brand-secondary text-brand-primary' : 'text-brand-secondary/60'}`}
          >
            <Users size={20} />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-brand-secondary text-brand-primary' : 'text-brand-secondary/60'}`}
          >
            <Settings size={20} />
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

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase">Receita</p>
                  <p className="text-xl font-black text-stone-900">R$ {LocalDB.getStats().totalRevenue.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase">Pedidos</p>
                  <p className="text-xl font-black text-stone-900">{LocalDB.getStats().orderCount}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase">Estoque Baixo</p>
                  <p className="text-xl font-black text-stone-900">{products.filter(p => p.stock !== undefined && p.stock < 10).length}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                  <Star size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase">Total Pontos</p>
                  <p className="text-xl font-black text-stone-900">{LocalDB.getStats().totalLoyaltyPoints}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase">Estoque Total</p>
                  <p className="text-xl font-black text-stone-900">{LocalDB.getStats().totalInventoryStock}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100">
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <Package size={20} className="text-red-500" /> Alerta de Estoque Baixo
                </h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {products.filter(p => p.stock !== undefined && p.stock < 10).length > 0 ? (
                    products.filter(p => p.stock !== undefined && p.stock < 10).map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="text-sm font-bold text-stone-900">{product.name}</p>
                            <p className="text-[10px] text-stone-500 uppercase font-black">{product.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-red-500">{product.stock}</p>
                          <p className="text-[10px] text-red-400 font-bold uppercase">Restantes</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
                      <p className="text-stone-500 text-sm">Tudo certo com o estoque!</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-stone-100">
                <h3 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                  <DollarSign size={20} className="text-emerald-500" /> Resumo Financeiro
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="text-[10px] font-black text-stone-400 uppercase mb-1">Receita Bruta</p>
                      <p className="text-xl font-black text-stone-900">R$ {LocalDB.getStats().totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                      <p className="text-[10px] font-black text-stone-400 uppercase mb-1">Custo Estimado</p>
                      <p className="text-xl font-black text-stone-900">
                        R$ {products.reduce((sum, p) => sum + (p.costPrice || 0) * (LocalDB.getOrders().filter(o => o.status === 'Entregue').reduce((count, o) => count + o.items.filter(i => i.id === p.id).reduce((q, item) => q + item.quantity, 0), 0)), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-black text-emerald-600 uppercase mb-1">Lucro Estimado</p>
                        <p className="text-3xl font-black text-emerald-700">
                          R$ {(LocalDB.getStats().totalRevenue - products.reduce((sum, p) => sum + (p.costPrice || 0) * (LocalDB.getOrders().filter(o => o.status === 'Entregue').reduce((count, o) => count + o.items.filter(i => i.id === p.id).reduce((q, item) => q + item.quantity, 0), 0)), 0)).toFixed(2)}
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                        <TrendingUp size={32} />
                      </div>
                    </div>
                  </div>
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
              <div className="flex gap-2">
                <button 
                  onClick={() => exportOrdersToPDF(orders)}
                  className="bg-white border border-stone-100 text-stone-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-50 transition-all text-sm"
                >
                  <Download size={16} /> PDF
                </button>
                <button 
                  onClick={() => exportOrdersToExcel(orders)}
                  className="bg-white border border-stone-100 text-stone-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-stone-50 transition-all text-sm"
                >
                  <Download size={16} /> Excel
                </button>
              </div>
            </header>

            <div className="bg-white rounded-[40px] shadow-sm border border-stone-100 overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-stone-50 text-stone-500 text-xs font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-8 py-4">ID / Data</th>
                    <th className="px-8 py-4">Cliente</th>
                    <th className="px-8 py-4">Itens</th>
                    <th className="px-8 py-4">Pagamento</th>
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
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-bold text-stone-900">{order.userName}</p>
                            <p className="text-xs text-stone-400">{order.phone}</p>
                          </div>
                          <a 
                            href={`https://wa.me/${order.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                            title="Conversar no WhatsApp"
                          >
                            <Phone size={14} />
                          </a>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-stone-600">{order.items.length} itens</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
                            {order.paymentMethod === 'pix' && <><QrCode size={14} className="text-brand-primary" /> PIX</>}
                            {order.paymentMethod === 'credit' && <><CreditCard size={14} className="text-brand-primary" /> Cartão</>}
                            {order.paymentMethod === 'cash' && <><Banknote size={14} className="text-brand-primary" /> Dinheiro</>}
                          </div>
                          {order.paymentMethod === 'cash' && order.changeFor && (
                            <p className="text-[10px] text-emerald-500 font-black">
                              Troco p/ R$ {order.changeFor.toFixed(2)}
                              <br />
                              (R$ {(order.changeFor - order.total).toFixed(2)})
                            </p>
                          )}
                          {order.couponCode && (
                            <div className="flex items-center gap-1 text-[10px] text-brand-primary font-black mt-1">
                              <Ticket size={10} /> {order.couponCode}
                            </div>
                          )}
                        </div>
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
                          <button 
                            onClick={() => handlePrintOrder(order)}
                            className="p-2 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-all"
                            title="Imprimir Pedido"
                          >
                            <Printer size={18} />
                          </button>
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
                            <div className="flex gap-2">
                              <select 
                                value={order.driverId || ''}
                                onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                                className="bg-stone-50 border border-stone-100 rounded-xl px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-brand-primary/20"
                              >
                                <option value="">Atribuir Entregador</option>
                                {drivers.map(d => (
                                  <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                              </select>
                              <button 
                                onClick={() => handleUpdateOrderStatus(order.id, 'Em Trânsito')}
                                className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                                title="Enviar Pedido"
                              >
                                <Truck size={18} />
                              </button>
                            </div>
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
                    category: categories[0] || 'Geral',
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

        {activeTab === 'inventory' && (
          <div className="space-y-8">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-stone-900">Estoque de Ingredientes</h1>
                <p className="text-stone-500">Gerencie a matéria-prima para sua produção</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white px-6 py-3 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-stone-400 font-black uppercase">Itens Totais</p>
                    <p className="text-xl font-black text-brand-primary">
                      {ingredients.reduce((sum, i) => sum + (i.stock || 0), 0).toFixed(1)}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-stone-100" />
                  <div className="text-right">
                    <p className="text-[10px] text-stone-400 font-black uppercase">Custo Total</p>
                    <p className="text-xl font-black text-emerald-500">
                      R$ {ingredients.reduce((sum, i) => sum + ((i.stock || 0) * (i.costPrice || 0)), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setEditingIngredient(null);
                    setIngredientFormData({
                      name: '',
                      unit: 'kg',
                      stock: '',
                      minStock: '',
                      costPrice: '',
                      image: ''
                    });
                    setIsIngredientModalOpen(true);
                  }}
                  className="bg-brand-primary text-brand-secondary px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
                >
                  <Plus size={20} /> Novo Ingrediente
                </button>
              </div>
            </header>

            <div className="bg-white rounded-[40px] shadow-sm border border-stone-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-bottom border-stone-100">
                    <th className="px-8 py-6 text-xs font-black text-stone-400 uppercase tracking-wider">Ingrediente</th>
                    <th className="px-8 py-6 text-xs font-black text-stone-400 uppercase tracking-wider">Unidade</th>
                    <th className="px-8 py-6 text-xs font-black text-stone-400 uppercase tracking-wider">Estoque Atual</th>
                    <th className="px-8 py-6 text-xs font-black text-stone-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {ingredients.map((ing) => (
                    <tr key={ing.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={ing.image} alt={ing.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <p className="font-bold text-stone-900">{ing.name}</p>
                            <p className="text-[10px] text-stone-400 font-black uppercase">Custo: R$ {ing.costPrice.toFixed(2)}/{ing.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-stone-500 uppercase bg-stone-100 px-2 py-1 rounded-lg">{ing.unit}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleUpdateIngredientStock(ing.id, Math.max(0, (ing.stock || 0) - 1))}
                            className="p-2 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-all"
                          >
                            <Minus size={16} />
                          </button>
                          <div className={`inline-flex items-center justify-center w-20 px-3 py-2 rounded-xl font-black text-sm ${
                            (ing.stock || 0) <= (ing.minStock || 0) ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                          }`}>
                            <input 
                              type="number" 
                              step="0.1"
                              value={ing.stock || 0}
                              onChange={(e) => handleUpdateIngredientStock(ing.id, parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent text-center outline-none"
                            />
                          </div>
                          <button 
                            onClick={() => handleUpdateIngredientStock(ing.id, (ing.stock || 0) + 1)}
                            className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-all"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingIngredient(ing);
                              setIngredientFormData({
                                name: ing.name,
                                unit: ing.unit,
                                stock: ing.stock.toString(),
                                minStock: ing.minStock.toString(),
                                costPrice: ing.costPrice.toString(),
                                image: ing.image || ''
                              });
                              setIsIngredientModalOpen(true);
                            }}
                            className="p-2 bg-stone-100 text-stone-600 rounded-xl hover:bg-brand-primary hover:text-white transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteIngredient(ing.id)}
                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8">
            <header>
              <h1 className="text-3xl font-black text-stone-900">Categorias</h1>
              <p className="text-stone-500">Gerencie as categorias dos seus produtos</p>
            </header>

            <div className="max-w-md bg-white p-8 rounded-[40px] shadow-sm border border-stone-100">
              <form onSubmit={handleAddCategory} className="flex gap-2 mb-8">
                <input 
                  type="text" 
                  placeholder="Nova categoria..."
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                />
                <button 
                  type="submit"
                  className="bg-brand-primary text-brand-secondary p-3 rounded-2xl font-bold hover:scale-105 transition-all"
                >
                  <Plus size={24} />
                </button>
              </form>

              <div className="space-y-2">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 group">
                    <span className="font-bold text-stone-700">{cat}</span>
                    <button 
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-2 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-8">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-stone-900">Cupons</h1>
                <p className="text-stone-500">Gerencie seus cupons de desconto</p>
              </div>
              <button 
                onClick={() => setIsCouponModalOpen(true)}
                className="bg-brand-primary text-brand-secondary px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
              >
                <Plus size={20} /> Novo Cupom
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <div key={coupon.id} className={`bg-white p-6 rounded-[32px] shadow-sm border border-stone-100 relative group overflow-hidden ${!coupon.isActive ? 'opacity-60' : ''}`}>
                  {!coupon.isActive && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl">INATIVO</div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-brand-secondary text-brand-primary rounded-2xl flex items-center justify-center">
                      <Ticket size={24} />
                    </div>
                    <button 
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="text-xl font-black text-stone-900 mb-1">{coupon.code}</h3>
                  <p className="text-sm text-stone-500 font-bold mb-4">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `R$ ${coupon.discountValue.toFixed(2)} OFF`}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Calendar size={14} />
                    Expira em: {new Date(coupon.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'drivers' && (
          <div className="space-y-8">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-stone-900">Entregadores</h1>
                <p className="text-stone-500">Gerencie sua equipe de entrega</p>
              </div>
              <button 
                onClick={() => setIsDriverModalOpen(true)}
                className="bg-brand-primary text-brand-secondary px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
              >
                <Plus size={20} /> Novo Entregador
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map((driver) => (
                <div key={driver.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-100 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                      <Truck size={24} />
                    </div>
                    <button 
                      onClick={() => handleDeleteDriver(driver.id)}
                      className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="text-xl font-black text-stone-900 mb-1">{driver.name}</h3>
                  <p className="text-sm text-stone-500 font-bold mb-4">{driver.phone}</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${driver.isActive ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                    <span className="text-xs font-bold text-stone-400">{driver.isActive ? 'Disponível' : 'Indisponível'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            <header>
              <h1 className="text-3xl font-black text-stone-900">Usuários</h1>
              <p className="text-stone-500">Gerencie seus clientes e pontos de fidelidade</p>
            </header>

            <div className="bg-white rounded-[40px] shadow-sm border border-stone-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-bottom border-stone-100">
                    <th className="px-8 py-6 text-xs font-black text-stone-400 uppercase tracking-wider">Cliente</th>
                    <th className="px-8 py-6 text-xs font-black text-stone-400 uppercase tracking-wider">E-mail / Telefone</th>
                    <th className="px-8 py-6 text-xs font-black text-stone-400 uppercase tracking-wider">Pontos</th>
                    <th className="px-8 py-6 text-xs font-black text-stone-400 uppercase tracking-wider">Nível</th>
                    <th className="px-8 py-6 text-xs font-black text-stone-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover" />
                          <span className="font-bold text-stone-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-sm text-stone-600">{user.email}</p>
                          <p className="text-xs text-stone-400">{user.phone || 'Sem telefone'}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Star size={16} className="text-amber-500 fill-amber-500" />
                          <span className="font-black text-brand-primary">{user.points || 0}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          (user.points || 0) >= 1000 ? 'bg-purple-100 text-purple-600' :
                          (user.points || 0) >= 500 ? 'bg-blue-100 text-blue-600' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {(user.points || 0) >= 1000 ? 'Diamante' :
                           (user.points || 0) >= 500 ? 'Ouro' : 'Bronze'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleUpdateUserPoints(user.id, Math.max(0, (user.points || 0) - 50))}
                            className="p-2 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-all"
                            title="Remover 50 pontos"
                          >
                            <Minus size={14} />
                          </button>
                          <input 
                            type="number" 
                            value={user.points || 0}
                            onChange={(e) => handleUpdateUserPoints(user.id, parseInt(e.target.value) || 0)}
                            className="w-16 bg-stone-50 border border-stone-100 rounded-xl py-1 text-center text-xs font-black text-stone-700 outline-none"
                          />
                          <button 
                            onClick={() => handleUpdateUserPoints(user.id, (user.points || 0) + 50)}
                            className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-all"
                            title="Adicionar 50 pontos"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <header>
              <h1 className="text-3xl font-black text-stone-900">Configurações</h1>
              <p className="text-stone-500">Personalize o funcionamento do seu app</p>
            </header>

            <div className="max-w-2xl space-y-4">
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-50 text-stone-500 rounded-2xl flex items-center justify-center">
                    <Package size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-stone-900">Controle de Estoque</h4>
                    <p className="text-sm text-stone-500">Diminuir estoque automaticamente nas vendas</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const newSettings = { ...settings, inventoryControl: !settings.inventoryControl };
                    setSettings(newSettings);
                    LocalDB.saveSettings(newSettings);
                  }}
                  className={`w-14 h-8 rounded-full transition-all relative ${settings.inventoryControl ? 'bg-emerald-500' : 'bg-stone-200'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.inventoryControl ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-50 text-stone-500 rounded-2xl flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-stone-900">Programa de Fidelidade</h4>
                    <p className="text-sm text-stone-500">Habilitar acúmulo de pontos por compra</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const newSettings = { ...settings, loyaltyProgram: !settings.loyaltyProgram };
                    setSettings(newSettings);
                    LocalDB.saveSettings(newSettings);
                  }}
                  className={`w-14 h-8 rounded-full transition-all relative ${settings.loyaltyProgram ? 'bg-emerald-500' : 'bg-stone-200'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.loyaltyProgram ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Ingredient Modal */}
      <AnimatePresence>
        {isIngredientModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsIngredientModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-0 right-0 bottom-0 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-lg bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl z-[90] overflow-hidden"
            >
              <form onSubmit={handleSaveIngredient} className="p-6 md:p-10 space-y-6">
                <header className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black text-stone-900">
                    {editingIngredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}
                  </h2>
                  <button type="button" onClick={() => setIsIngredientModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                    <X size={24} />
                  </button>
                </header>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Nome</label>
                    <input 
                      type="text" 
                      required
                      value={ingredientFormData.name}
                      onChange={e => setIngredientFormData({...ingredientFormData, name: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Unidade</label>
                      <select 
                        value={ingredientFormData.unit}
                        onChange={e => setIngredientFormData({...ingredientFormData, unit: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold"
                      >
                        <option value="kg">Quilograma (kg)</option>
                        <option value="g">Grama (g)</option>
                        <option value="un">Unidade (un)</option>
                        <option value="L">Litro (L)</option>
                        <option value="ml">Mililitro (ml)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Preço de Custo (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={ingredientFormData.costPrice}
                        onChange={e => setIngredientFormData({...ingredientFormData, costPrice: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Estoque Inicial</label>
                      <input 
                        type="number" 
                        step="0.1"
                        required
                        value={ingredientFormData.stock}
                        onChange={e => setIngredientFormData({...ingredientFormData, stock: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Estoque Mínimo</label>
                      <input 
                        type="number" 
                        step="0.1"
                        required
                        value={ingredientFormData.minStock}
                        onChange={e => setIngredientFormData({...ingredientFormData, minStock: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">URL da Imagem (Opcional)</label>
                    <input 
                      type="text" 
                      value={ingredientFormData.image}
                      onChange={e => setIngredientFormData({...ingredientFormData, image: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsIngredientModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-brand-primary text-brand-secondary py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Driver Modal */}
      <AnimatePresence>
        {isDriverModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDriverModalOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-0 right-0 bottom-0 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-lg bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl z-[90] overflow-hidden"
            >
              <form onSubmit={handleSaveDriver} className="p-6 md:p-10 space-y-6">
                <header className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black text-stone-900">Novo Entregador</h2>
                  <button 
                    type="button"
                    onClick={() => setIsDriverModalOpen(false)}
                    className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </header>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Nome</label>
                    <input 
                      type="text" 
                      placeholder="Nome do entregador"
                      value={driverFormData.name}
                      onChange={e => setDriverFormData({...driverFormData, name: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Telefone</label>
                    <input 
                      type="text" 
                      placeholder="(00) 00000-0000"
                      value={driverFormData.phone}
                      onChange={e => setDriverFormData({...driverFormData, phone: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsDriverModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-brand-primary text-brand-secondary py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Coupon Modal */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCouponModalOpen(false)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-0 right-0 bottom-0 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-lg bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl z-[90] overflow-hidden"
            >
              <form onSubmit={handleSaveCoupon} className="p-6 md:p-10 space-y-6">
                <header className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black text-stone-900">Novo Cupom</h2>
                  <button 
                    type="button"
                    onClick={() => setIsCouponModalOpen(false)}
                    className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </header>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Código do Cupom</label>
                    <input 
                      type="text" 
                      placeholder="Ex: DOCE20"
                      value={couponFormData.code}
                      onChange={e => setCouponFormData({...couponFormData, code: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold uppercase"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Tipo</label>
                      <select 
                        value={couponFormData.discountType}
                        onChange={e => setCouponFormData({...couponFormData, discountType: e.target.value as 'percentage' | 'fixed'})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                      >
                        <option value="percentage">Porcentagem (%)</option>
                        <option value="fixed">Valor Fixo (R$)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Valor</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 20"
                        value={couponFormData.discountValue}
                        onChange={e => setCouponFormData({...couponFormData, discountValue: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Duração (dias)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 7"
                      value={couponFormData.expiresInDays}
                      onChange={e => setCouponFormData({...couponFormData, expiresInDays: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsCouponModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-brand-primary text-brand-secondary py-4 rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
                  >
                    Criar Cupom
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
              className="fixed left-0 right-0 bottom-0 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-2xl bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl z-[90] overflow-hidden"
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

                <div className="flex flex-col gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Nome do Produto</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Descrição</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none h-24 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                      <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Preço de Custo (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={formData.costPrice}
                        onChange={e => setFormData({...formData, costPrice: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                      <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Preço Oferta Relâmpago (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={formData.flashSalePrice}
                        onChange={e => setFormData({...formData, flashSalePrice: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Tags (separadas por vírgula)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Sem Açúcar, Vegano, Mais Vendido"
                      value={formData.tags}
                      onChange={e => setFormData({...formData, tags: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-stone-900">Produto é um Combo?</p>
                        <p className="text-[10px] text-stone-400">Habilita seleção de itens do combo</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, isCombo: !formData.isCombo})}
                      className={`w-12 h-6 rounded-full transition-all relative ${formData.isCombo ? 'bg-brand-primary' : 'bg-stone-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isCombo ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Categoria</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
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
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Estoque (Opcional)</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 50"
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-wider">Imagem do Produto</label>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      {formData.image && (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border border-stone-100 flex-shrink-0">
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="relative flex-1 w-full">
                        <label className="flex items-center justify-center gap-2 w-full bg-stone-50 border border-dashed border-stone-200 rounded-2xl py-6 px-4 cursor-pointer hover:bg-stone-100 transition-all">
                          <ImageIcon className="text-stone-400" size={20} />
                          <span className="text-sm font-bold text-stone-600">
                            {formData.image ? 'Alterar Imagem' : 'Anexar Imagem'}
                          </span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
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
