export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  deliveryTime: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type Category = 'Todos' | 'Brigadeiros' | 'Bolos' | 'Tortas' | 'Cookies' | 'Gelados';
