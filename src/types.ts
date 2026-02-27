export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  isAdmin?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  image: string;
  category: string;
  rating: number;
  deliveryTime: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type OrderStatus = 'Pendente' | 'Aceito' | 'Recusado' | 'Em Trânsito' | 'Entregue';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  address: string;
  phone: string;
  paymentMethod: 'credit' | 'pix' | 'cash';
  changeFor?: number;
}

export type Category = string;
