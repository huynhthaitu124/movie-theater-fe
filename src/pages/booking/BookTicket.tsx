import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Star, Film } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import CinemaCard from '../../components/booking/CinemaCard';
import SeatSelection from '../../components/booking/SeatSelection';
import PaymentForm, { PaymentFormData } from '../../components/booking/PaymentForm';
import { mockShowtimes } from '../../data/mockShowtimes';
import { BookingStep } from '../../types/booking';
import { mockCinemas } from '../../data/mockCinemas';

const BookTicket: React.FC = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps: BookingStep[] = [
    { step: 1, title: 'Select Date', isCompleted: false },
    { step: 2, title: 'Choose Cinema & Time', isCompleted: false },
    { step: 3, title: 'Pick Seats', isCompleted: false },
    { step: 4, title: 'Payment', isCompleted: false },
  ];

  // Mock movie data - in real app, fetch based on movieId
  const movie = {
    id: movieId || '1',
    title: 'Avengers: Endgame',
    posterUrl: 'https://images.pexels.com/photos/7991225/pexels-photo-7991225.jpeg?auto=compress&cs=tinysrgb&w=400',
    duration: 181,
    genre: ['Action', 'Adventure', 'Drama'],
    rating: 'PG-13',
    description: 'The grave course of events set in motion by Thanos that wiped out half the universe and fractured the Avengers ranks compels the remaining Avengers to take one final stand.'
  };

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().split('T')[0];
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dayLabel = '';
    if (date.toDateString() === today.toDateString()) {
      dayLabel = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dayLabel = 'Tomorrow';
    } else {
      dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    
    return {
      day: dayLabel,
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    };
  };

  const handleCinemaSelect = (cinemaId: string) => {
    setSelectedCinema(cinemaId);
  };

  const handleShowtimeSelect = (showtimeId: string) => {
    setSelectedShowtime(showtimeId);
  };

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      }
      return [...prev, seatId];
    });
  };

  const getSelectedShowtime = () => {
    return mockShowtimes.find(st => st.id === selectedShowtime);
  };

  const getSelectedCinema = () => {
    return mockCinemas.find(c => c.id === selectedCinema);
  };

  const calculateTotal = () => {
    const showtime = getSelectedShowtime();
    return selectedSeats.length * (showtime?.price || 0);
  };

  const handlePayment = async (paymentData: PaymentFormData) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const showtime = getSelectedShowtime();
      const cinema = getSelectedCinema();
      
      navigate('/booking/success', {
        state: {
          movieTitle: movie.title,
          cinemaName: cinema?.name,
          date: selectedDate,
          time: showtime?.startTime,
          seats: selectedSeats,
          totalAmount: calculateTotal(),
          confirmationCode: `BK${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }
      });
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2: return selectedDate;
      case 3: return selectedDate && selectedCinema && selectedShowtime;
      case 4: return selectedDate && selectedCinema && selectedShowtime && selectedSeats.length > 0;
      default: return true;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        {/* Header with Movie Info */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <img 
                src={movie.posterUrl} 
                alt={movie.title}
                className="w-16 h-24 object-cover rounded-lg shadow-md"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Film className="mr-2 text-blue-600" size={24} />
                  {movie.title}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mt-1">
                  <span>{movie.duration} min</span>
                  <span>•</span>
                  <span>{movie.rating}</span>
                  <span>•</span>
                  <span>{movie.genre.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <React.Fragment key={step.step}>
                  <div className="flex items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                      ${currentStep === step.step 
                        ? 'bg-blue-600 text-white shadow-lg scale-110' 
                        : currentStep > step.step 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                    `}>
                      {currentStep > step.step ? '✓' : step.step}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.step 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 sm:w-24 h-0.5 mx-4 transition-colors duration-300 ${
                      currentStep > step.step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step 1: Date Selection */}
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                  <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Select Your Preferred Date
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose from the next 7 days
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
                  {dates.map((date) => {
                    const formattedDate = formatDate(date);
                    const isSelected = selectedDate === date;
                    
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`
                          p-4 rounded-xl border-2 text-center transition-all duration-300 transform hover:scale-105
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-lg' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300'}
                        `}
                      >
                        <div className="text-sm font-medium mb-1">{formattedDate.day}</div>
                        <div className="text-2xl font-bold mb-1">{formattedDate.date}</div>
                        <div className="text-sm opacity-75">{formattedDate.month}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!selectedDate}
                    size="lg"
                    className="px-8"
                  >
                    Continue to Cinemas
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Cinema & Showtime Selection */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Choose Cinema & Showtime
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Select your preferred cinema and showtime for {formatDate(selectedDate).day}, {formatDate(selectedDate).month} {formatDate(selectedDate).date}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockCinemas.map((cinema) => (
                  <CinemaCard
                    key={cinema.id}
                    cinema={cinema}
                    showtimes={mockShowtimes}
                    selectedCinema={selectedCinema}
                    selectedShowtime={selectedShowtime}
                    onCinemaSelect={handleCinemaSelect}
                    onShowtimeSelect={handleShowtimeSelect}
                  />
                ))}
              </div>

              <div className="flex justify-between max-w-4xl mx-auto">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(1)}
                  size="lg"
                >
                  Back to Dates
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedToStep(3)}
                  size="lg"
                  className="px-8"
                >
                  Choose Seats
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Seat Selection */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Select Your Seats
                </h2>
                <div className="text-gray-600 dark:text-gray-400">
                  <p>{getSelectedCinema()?.name}</p>
                  <p>{formatDate(selectedDate).day}, {formatDate(selectedDate).month} {formatDate(selectedDate).date} at {getSelectedShowtime()?.startTime}</p>
                </div>
              </div>

              <SeatSelection
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                ticketPrice={getSelectedShowtime()?.price || 0}
              />
              
              <div className="flex justify-between max-w-4xl mx-auto">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(2)}
                  size="lg"
                >
                  Back to Cinemas
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  disabled={!canProceedToStep(4)}
                  size="lg"
                  className="px-8"
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Complete Your Booking
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Review your selection and complete payment
                </p>
              </div>

              {/* Booking Summary */}
              <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Movie:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{movie.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cinema:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{getSelectedCinema()?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedDate).day}, {formatDate(selectedDate).month} {formatDate(selectedDate).date} at {getSelectedShowtime()?.startTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Seats:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedSeats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Format:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{getSelectedShowtime()?.format}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="font-bold text-xl text-blue-600 dark:text-blue-400">${calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <PaymentForm
                total={calculateTotal()}
                onSubmit={handlePayment}
              />
              
              <div className="flex justify-between max-w-2xl mx-auto">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(3)}
                  size="lg"
                >
                  Back to Seats
                </Button>
                <Button
                  type="submit"
                  form="payment-form"
                  isLoading={isProcessing}
                  size="lg"
                  className="px-8"
                >
                  {isProcessing ? 'Processing...' : `Pay $${calculateTotal()}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookTicket;