import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { Order } from '../types';
import { DollarSign, ShoppingBag, Users, ArrowUp, ArrowDown } from 'lucide-react';

interface DashboardProps {
  orders: Order[];
  productsCount: number;
  usersCount: number;
}

const StatCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: number }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex-1">
    <div className="flex justify-between items-start">
        <div className="flex flex-col">
            <span className="text-sm font-bold text-stone-500 uppercase tracking-wider">{title}</span>
            <span className="text-3xl font-black text-stone-900 mt-1">{value}</span>
        </div>
        <div className="w-12 h-12 bg-brand-secondary text-brand-primary rounded-2xl flex items-center justify-center">
            {icon}
        </div>
    </div>
    {trend !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {Math.abs(trend)}% vs Mês Anterior
        </div>
    )}
  </div>
);

export default function Dashboard({ orders, productsCount, usersCount }: DashboardProps) {

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency', 
    currency: 'BRL' 
  });

  const processData = (period: 'day' | 'week' | 'month' | 'year') => {
    const now = new Date();
    let data: { [key: string]: number } = {};

    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        let key = '';

        if (period === 'day') {
            if(orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === now.getMonth() && orderDate.getDate() === now.getDate()){
                key = orderDate.getHours().toString().padStart(2, '0') + ':00';
            }
        } else if (period === 'week') {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            if(orderDate >= startOfWeek){
                key = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][orderDate.getDay()];
            }
        } else if (period === 'month') {
            if(orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === now.getMonth()){
                key = `Dia ${orderDate.getDate()}`;
            }
        } else { // year
            if(orderDate.getFullYear() === now.getFullYear()){
                key = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][orderDate.getMonth()];
            }
        }

        if(key){
            if (!data[key]) data[key] = 0;
            data[key] += order.total;
        }
    });
    
    return Object.entries(data).map(([name, total]) => ({ name, faturamento: total }));
  };

  const dailyData = useMemo(() => processData('day'), [orders]);
  const weeklyData = useMemo(() => processData('week'), [orders]);
  const yearlyData = useMemo(() => processData('year'), [orders]);

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);

  return (
    <motion.div 
        key="dashboard"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
    >
        <header>
            <h1 className="text-3xl font-black text-stone-900">Painel</h1>
            <p className="text-stone-500">Visão geral do seu negócio</p>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
            <StatCard title="Faturamento Total" value={currencyFormatter.format(totalRevenue)} icon={<DollarSign />} trend={15} />
            <StatCard title="Total de Pedidos" value={orders.length.toString()} icon={<ShoppingBag />} trend={-3} />
            <StatCard title="Total de Produtos" value={productsCount.toString()} icon={<ShoppingBag />} />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Faturamento Anual</h3>
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} dx={-10} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => currencyFormatter.format(value as number)}/>
                <Tooltip formatter={(value) => currencyFormatter.format(value as number)} contentStyle={{ borderRadius: '1rem', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="faturamento" stroke="#F59E0B" strokeWidth={3} dot={{ r: 6, fill: '#F59E0B' }} activeDot={{ r: 8, fill: '#F59E0B' }} />
            </LineChart>
            </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
                <h3 className="text-lg font-bold text-stone-800 mb-4">Faturamento da Semana</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#6b7280', fontSize: 12 }}/>
                        <YAxis hide={true} />
                        <Tooltip formatter={(value) => currencyFormatter.format(value as number)} cursor={{fill: '#f5f5f440'}} contentStyle={{ borderRadius: '1rem', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}/>
                        <Bar dataKey="faturamento" fill="#F59E0B" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
                <h3 className="text-lg font-bold text-stone-800 mb-4">Faturamento do Dia</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#6b7280', fontSize: 12 }}/>
                        <YAxis hide={true} />
                        <Tooltip formatter={(value) => currencyFormatter.format(value as number)} cursor={{fill: '#f5f5f440'}} contentStyle={{ borderRadius: '1rem', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="faturamento" fill="#F59E0B" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </motion.div>
  );
}