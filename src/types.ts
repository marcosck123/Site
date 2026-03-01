export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  isAdmin?: boolean;
  points?: number;
  referralCode?: string;
  birthday?: string;
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
  stock?: number;
  isCombo?: boolean;
  comboItems?: string[];
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
  couponCode?: string;
  scheduledFor?: string;
  pointsEarned?: number;
  driverId?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiresAt: string;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  image?: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
}

export interface LoyaltyPoints {
  userId: string;
  points: number;
}

export type Category = string;

export interface AppSettings {
  darkMode: boolean;
  inventoryControl: boolean;
  loyaltyProgram: boolean;
}
