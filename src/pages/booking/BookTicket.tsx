import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, CreditCard } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import SeatSelection from '../../components/booking/SeatSelection';
import PaymentForm, { PaymentFormData } from '../../components/booking/PaymentForm';

type BookingStep = {
  step: number;
  title: string;
  isCompleted: boolean;
};

const BookTicket: React.FC = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps: BookingStep[] = [
    { step: 1, title: 'Select Date & Time', isCompleted: false },
    { step: 2, title: 'Choose Seats', isCompleted: false },
    { step: 3, title: 'Payment', isCompleted: false },
  ];

  // Enhanced dates - next 7 days
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().split('T')[0];
  });

  // Enhanced showtimes with more options and different prices
  const showtimes = [
    { id: '1', time: '10:00 AM', price: 8, type: 'Early Bird' },
    { id: '2', time: '12:30 PM', price: 10, type: 'Matinee' },
    { id: '3', time: '2:30 PM', price: 10, type: 'Matinee' },
    { id: '4', time: '4:45 PM', price: 12, type: 'Standard' },
    { id: '5', time: '6:00 PM', price: 15, type: 'Prime Time' },
    { id: '6', time: '7:30 PM', price: 15, type: 'Prime Time' },
    { id: '7', time: '9:00 PM', price: 15, type: 'Prime Time' },
    { id: '8', time: '10:30 PM', price: 12, type: 'Late Night' },
  ];

  // Add state for selected showtime price
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  // Modify the showtime selection handler to store the price
  const handleShowtimeSelect = (showtimeId: string) => {
    setSelectedShowtime(showtimeId);
    const selected = showtimes.find(show => show.id === showtimeId);
    if (selected) {
      setSelectedPrice(selected.price);
    }
  };

  // Calculate total amount based on selected price and seats
  const calculateTotal = () => {
    return selectedSeats.length * selectedPrice;
  };

  // Update the date selection display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  };

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      }
      return [...prev, seatId];
    });
  };

  const handlePayment = async (paymentData: PaymentFormData) => {
    setIsProcessing(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page with booking details
      navigate('/booking/success', {
        state: {
          movieTitle: "Movie Title", // Replace with actual movie title
          date: selectedDate,
          time: showtimes.find(st => st.id === selectedShowtime)?.time,
          seats: selectedSeats,
          totalAmount: selectedSeats.length * 12,
          confirmationCode: `BK${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }
      });
    } catch (error) {
      console.error('Payment failed:', error);
      // TODO: Show error notification
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Booking Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.step}>
                <div className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${currentStep === step.step ? 'bg-primary-500 text-white' : 
                      currentStep > step.step ? 'bg-success-500 text-white' : 'bg-secondary-700 text-secondary-400'}
                  `}>
                    {currentStep > step.step ? '✓' : step.step}
                  </div>
                  <span className="ml-2 font-medium text-secondary-300">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-24 h-0.5 bg-secondary-700" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Enhanced Date & Time Selection */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="bg-secondary-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Select Date</h3>
              <div className="grid grid-cols-7 gap-4">
                {dates.map((date) => {
                  const formattedDate = formatDate(date);
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        p-4 rounded-lg border text-center transition-colors
                        ${selectedDate === date 
                          ? 'border-primary-500 bg-primary-500/10 text-white' 
                          : 'border-secondary-700 hover:border-primary-500 text-secondary-300'}
                      `}
                    >
                      <div className="text-sm font-medium">{formattedDate.day}</div>
                      <div className="text-2xl font-bold my-1">{formattedDate.date}</div>
                      <div className="text-sm">{formattedDate.month}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-secondary-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Select Time</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {showtimes.map((show) => (
                  <button
                    key={show.id}
                    onClick={() => handleShowtimeSelect(show.id)}
                    className={`
                      p-4 rounded-lg border text-center transition-colors
                      ${selectedShowtime === show.id 
                        ? 'border-primary-500 bg-primary-500/10 text-white' 
                        : 'border-secondary-700 hover:border-primary-500 text-secondary-300'}
                    `}
                  >
                    <Clock size={20} className="mx-auto mb-2" />
                    <div className="font-medium">{show.time}</div>
                    <div className="text-sm text-secondary-400">${show.price}</div>
                    <div className="text-xs text-primary-400 mt-1">{show.type}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!selectedDate || !selectedShowtime}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Seat Selection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <SeatSelection
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              ticketPrice={selectedPrice}
            />
            
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={selectedSeats.length === 0}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <PaymentForm
              total={calculateTotal()}
              onSubmit={handlePayment}
            />
            
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setCurrentStep(2)}
              >
                Back
              </Button>
              <Button
                type="submit"
                form="payment-form"
                isLoading={isProcessing}
              >
                Complete Booking
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookTicket;