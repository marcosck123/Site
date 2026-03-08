import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FirebaseService } from '../services/firebaseService';
import { NotificationService } from '../services/notificationService';

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (user) {
      // In a real app, you'd create an order in your database
      // and process the payment.
      NotificationService.sendNotification('Success', { body: 'Order placed successfully!' });
      // Clear the cart after placing the order
      // This is a simplified example. In a real app, you would have a more robust
      // way of managing the cart and orders.
      const cartItems = await FirebaseService.getCartItems(user.id);
      cartItems.forEach(item => FirebaseService.removeFromCart(user.id, item.id));
      navigate('/');
    } else {
      NotificationService.sendNotification('Error', { body: 'You must be logged in to place an order.' });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Shipping Address</h2>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Payment Method</h2>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="credit_card">Credit Card</option>
          <option value="debit_card">Debit Card</option>
          <option value="cash">Cash</option>
          <option value="pix">Pix</option>
        </select>
      </div>
      <button onClick={handlePlaceOrder} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
        Place Order
      </button>
    </div>
  );
};

export default Checkout;
