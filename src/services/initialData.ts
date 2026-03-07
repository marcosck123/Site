import { Product, Coupon } from '../types';

export const INITIAL_CATEGORIES = ['Brigadeiros', 'Bolos', 'Tortas', 'Cookies', 'Gelados', 'Bebidas'];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: '1',
    code: 'DOCE20',
    discountType: 'percentage',
    discountValue: 20,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  },
  {
    id: '2',
    code: 'BEMVINDO',
    discountType: 'fixed',
    discountValue: 10,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  }
];

export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: 'Brigadeiro Gourmet Belga',
    description: 'Feito com o melhor chocolate belga Callebaut e granulado artesanal de chocolate amargo.',
    price: 4.50,
    image: 'https://picsum.photos/seed/brigadeiro/400/400',
    category: 'Brigadeiros',
    rating: 4.9,
    deliveryTime: '20-30 min',
    stock: 100,
    tags: ['mais-vendido', 'chocolate']
  },
  {
    name: 'Bolo de Cenoura com Brigadeiro',
    description: 'Massa fofinha de cenoura com uma camada generosa de brigadeiro artesanal cremoso.',
    price: 15.00,
    image: 'https://picsum.photos/seed/cake/400/400',
    category: 'Bolos',
    rating: 4.8,
    deliveryTime: '30-40 min',
    stock: 20,
    tags: ['classico']
  },
  {
    name: 'Torta de Limão Siciliano',
    description: 'Base crocante de biscoito, creme de limão siciliano aveludado e merengue suíço maçaricado.',
    price: 18.00,
    image: 'https://picsum.photos/seed/lemon/400/400',
    category: 'Tortas',
    rating: 4.7,
    deliveryTime: '25-35 min',
    stock: 15,
    tags: ['refrescante']
  },
  {
    name: 'Cookie Double Chocolate',
    description: 'Cookie americano autêntico com gotas de chocolate ao leite e meio amargo, crocante por fora e macio por dentro.',
    price: 8.50,
    image: 'https://picsum.photos/seed/cookie/400/400',
    category: 'Cookies',
    rating: 4.9,
    deliveryTime: '15-25 min',
    stock: 50,
    tags: ['vegano']
  }
];
