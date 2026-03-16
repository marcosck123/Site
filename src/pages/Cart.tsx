import React from 'react';
import { Link } from 'react-router-dom';
import { CartItem } from '../types';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
}

const Cart: React.FC<CartProps> = ({ cartItems, onUpdateQuantity, onRemoveFromCart, onClearCart }) => {
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.promoPrice || item.price) * item.quantity, 0);

  return (
    <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Carrinho</h1>
        <button onClick={onClearCart} className="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2">
          <Trash2 size={18} />
          L limpar carrinho
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Seu carrinho está vazio.</p>
          <Link to="/produtos" className="mt-4 inline-block bg-brand-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-accent transition-all">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg"/>
                  <div>
                    <h2 className="font-bold text-gray-800">{item.name}</h2>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 border rounded-full px-3 py-1">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="text-gray-500 hover:text-brand-primary transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-lg text-gray-800">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="text-gray-500 hover:text-brand-primary transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right">
                    {item.promoPrice && (
                      <p className="text-xs text-gray-400 line-through">R$ {item.price.toFixed(2)}</p>
                    )}
                    <p className="font-bold text-lg text-brand-primary">R$ {(item.promoPrice || item.price).toFixed(2)}</p>
                  </div>
                  <button 
                    onClick={() => onRemoveFromCart(item.id)} 
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t">

  {/* Subtotal */}
  <div className="flex justify-end items-center mb-4">
    <span className="text-lg font-medium text-gray-600">Subtotal:</span>
    <span className="text-2xl font-bold text-gray-900 ml-4">R$ {cartTotal.toFixed(2)}</span>
  </div>

  {/* Frete (novo) */}
  <div className="flex justify-end items-center mb-4">
    <span className="text-lg font-medium text-gray-600">Frete:</span>
    <span className="text-2xl font-bold text-gray-900 ml-4">R$ {frete.toFixed(2)}</span>
  </div>

  {/* Total (subtotal + frete) */}
  <div className="flex justify-end items-center font-bold text-xl border-t pt-4">
    <span>Total:</span>
    <span className="text-3xl font-bold ml-4">R$ {total.toFixed(2)}</span>
  </div>
            <p className="text-right text-sm text-gray-500 mb-6">Cupons, formas de pagamento, etc. serão exibidos na próxima página.</p>
            <Link to="/checkout" className="w-full flex items-center justify-center bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-all">
              Ir para o pagamento
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
