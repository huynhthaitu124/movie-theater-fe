import React, { useState } from 'react';
import { CreditCard, Calendar, Lock } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

interface PaymentFormProps {
  amount: number;
  onSubmit: (paymentData: PaymentFormData) => void;
  isProcessing?: boolean;
}

export interface PaymentFormData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, onSubmit, isProcessing }) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

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

  const bookingFee = 20000; // 20,000 VND booking fee

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
                leftIcon={<CreditCard className="h-4 w-4" />}
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
                leftIcon={<Calendar className="h-4 w-4" />}
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
                leftIcon={<Lock className="h-4 w-4" />}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-secondary-300">
              <span>Subtotal</span>
              <span>{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between text-secondary-300">
              <span>Booking Fee</span>
              <span>{formatCurrency(bookingFee)}</span>
            </div>
            <div className="pt-4 border-t border-secondary-700">
              <div className="flex justify-between text-white">
                <span className="font-medium">Total</span>
                <span className="font-medium">{formatCurrency(amount + bookingFee)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay ${formatCurrency(amount + bookingFee)}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;