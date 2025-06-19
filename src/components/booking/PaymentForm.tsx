import React, { useState } from 'react';
import { CreditCard, Calendar, Lock } from 'lucide-react';
import Input from '../common/Input';

interface PaymentFormProps {
  total: number;
  onSubmit: (paymentData: PaymentFormData) => void;
}

export interface PaymentFormData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ total, onSubmit }) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-8">
      <div className="bg-secondary-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Payment Details</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6 md:col-span-2">
              <Input
                label="Card Number"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            
            <Input
              label="Card Holder Name"
              id="cardHolder"
              name="cardHolder"
              value={formData.cardHolder}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder="MM/YY"
                required
              />

              <Input
                label="CVV"
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                required
                type="password"
                maxLength={3}
              />
            </div>
          </div>
        </form>
      </div>

      <div className="bg-secondary-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Order Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-secondary-300">
            <span>Subtotal</span>
            <span>${total}</span>
          </div>
          <div className="flex justify-between text-secondary-300">
            <span>Booking Fee</span>
            <span>$2.00</span>
          </div>
          <div className="pt-4 border-t border-secondary-700">
            <div className="flex justify-between text-white">
              <span className="font-medium">Total</span>
              <span className="font-medium">${(total + 2).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;