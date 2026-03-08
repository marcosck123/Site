
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../hooks/useApp';
import QuantitySelector from '../components/QuantitySelector';
import { NotificationService } from '../services/notificationService';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const foundProduct = products.find(p => p.id === id);
      setProduct(foundProduct || null);
    }
  }, [id, products]);

  const handleAddToCart = async () => {
    if (user && product) {
      for (let i = 0; i < quantity; i++) {
        await FirebaseService.addToCart(user.id, product);
      }
      NotificationService.sendNotification('Success', { body: 'Product added to cart!' });
      navigate('/cart');
    } else {
      NotificationService.sendNotification('Error', { body: 'You must be logged in to add items to the cart.' });
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row">
        <img src={product.image} alt={product.name} className="md:w-1/2 rounded-lg" />
        <div className="md:w-1/2 md:pl-8">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl mb-4">${product.price.toFixed(2)}</p>
          <p className="mb-4">{product.description}</p>
          <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
          <button onClick={handleAddToCart} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
