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
  referredBy?: string; // New: who referred this user
  favorites?: string[]; // New: array of product IDs
  birthday?: string;
  savedAddresses?: SavedAddress[];
  notifications?: Notification[];
  subscription?: Subscription;
  loyaltyTier?: 'Bronze' | 'Prata' | 'Ouro';
  walletBalance?: number; // New: for Sweet Wallet
  walletTransactions?: WalletTransaction[]; // New: transaction history
  favoriteFolders?: FavoriteFolder[]; // New: for organized favorites
}

export interface WalletTransaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  proofImage?: string; // For PIX confirmation
  createdAt: string;
}

export interface FavoriteFolder {
  id: string;
  name: string;
  productIds: string[];
}

export interface Subscription {
  plan: 'Mensal' | 'Anual';
  status: 'Ativo' | 'Cancelado';
  nextBoxDate: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  isCompleted: boolean;
  expiresAt: string;
}

export interface SavedAddress {
  id: string;
  label: string; // 'Casa', 'Trabalho', etc.
  address: string;
  lat?: number;
  lng?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'coupon' | 'info';
  isRead: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  costPrice?: number; // New: for financial reports
  image: string;
  category: string;
  rating: number;
  deliveryTime: string;
  stock?: number;
  isCombo?: boolean;
  comboItems?: string[];
  flashSalePrice?: number; // New: for flash sales
  flashSaleEnd?: string; // New: ISO string
  tags?: string[]; // New: ['Sem Açúcar', 'Vegano', etc]
}

export interface CartItem {
  id: string; // Product ID
  name: string;
  price: number;
  promoPrice?: number;
  image: string;
  quantity: number;
  category: string;
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
  paymentMethod: 'credit' | 'pix' | 'cash' | 'wallet';
  changeFor?: number;
  couponCode?: string;
  scheduledFor?: string;
  isGift?: boolean; // New: for gift mode
  giftMessage?: string; // New: message for gift
  pointsEarned?: number;
  driverId?: string;
  isGoldenTicket?: boolean;
  goldenTicketClaimed?: boolean;
  deliveryLat?: number;
  deliveryLng?: number;
  isDigitalGiftCard?: boolean; // New: for Digital Gift Card
  giftCardLink?: string; // New: link to animated card
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

export interface Ingredient {
  id: string;
  name: string;
  unit: string; // e.g., 'kg', 'g', 'un', 'L'
  stock: number;
  minStock: number;
  costPrice: number;
  image?: string;
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
  isStoreOpen: boolean; // New: Panic Button
  banners: AppBanner[]; // New: Banner Manager
  pixKey?: string; // New: for wallet top-up
  pixName?: string; // New: for wallet top-up
}

export interface AppBanner {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  link?: string;
  isActive: boolean;
}
