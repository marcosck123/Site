import React from 'react';

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, setQuantity }) => {
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="flex items-center">
      <button onClick={handleDecrement} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-lg">-</button>
      <span className="px-4 py-1 bg-gray-100">{quantity}</span>
      <button onClick={handleIncrement} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-lg">+</button>
    </div>
  );
};

export default QuantitySelector;
