import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Film, Loader2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import CinemaCard from '../../components/booking/CinemaCard';
import SeatSelection from '../../components/booking/SeatSelection';
import PaymentForm, { PaymentFormData } from '../../components/booking/PaymentForm';
import { mockCinemas } from '../../data/mockCinemas';
import { BookingStep } from '../../types/booking';
import { Movie } from '../../types/movie';
import { Schedule } from '../../types/schedule';
import { movieService } from '../../services/modules/movie.service';
import { scheduleService } from '../../services/modules/schedule.service';

const BookTicket: React.FC = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const steps: BookingStep[] = [
    { step: 1, title: 'Select Date', isCompleted: false },
    { step: 2, title: 'Choose Cinema & Time', isCompleted: false },
    { step: 3, title: 'Pick Seats', isCompleted: false },
    { step: 4, title: 'Payment', isCompleted: false },
  ];

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId) return;
      try {
        setIsLoading(true);
        const movieResponse = await movieService.getAll();
        const movieData = movieResponse.data.find(m => m.movieID === movieId && m.status === 'ACTIVE');
        if (!movieData) {
          setError('Movie not found or not currently showing');
          setIsLoading(false);
          return;
        }
        setMovie(movieData);
        setError(null);
      } catch (err) {
        setError('Failed to load movie details');
        setMovie(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [movieId]);

  // Fetch schedules when date changes
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!movieId) return;
      try {
        setIsLoading(true);
        const scheduleResponse = await scheduleService.getByMovie(movieId);
        console.log('Fetched schedules:', scheduleResponse.data);
        
        // Convert API response to match Schedule type
        const formattedSchedules: Schedule[] = scheduleResponse.data.map(schedule => ({
          scheduleId: schedule.scheduleId,
          movieId: movieId,
          cinemaId: '1', // Default cinema ID
          roomId: schedule.roomnumber.toString(),
          startTime: `${schedule.showdate}T${schedule.starttime}`,
          date: schedule.showdate,
          price: 75000, // Default price in VND
          availableSeats: 80, // Default available seats
          totalSeats: 100, // Default total seats
          movieName: schedule.moviename,
          movieImageUrl: schedule.image,
          status: 'scheduled',
          room: {
            id: schedule.roomnumber.toString(),
            name: `Room ${schedule.roomnumber}`,
            capacity: 100,
            seats: [],
            layout: {
              rows: 10,
              seatsPerRow: 10
            },
            type: 'standard',
            status: 'active',
            features: [],
            cinemaId: '1',
            screenSize: '16m x 8m',
            audioSystem: 'Dolby Atmos',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }));

        // Filter schedules for selected date
        setSchedules(formattedSchedules.filter(schedule => 
          schedule.date === selectedDate
        ));
        setError(null);
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError('Failed to load schedules');
        setSchedules([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (selectedDate) {
      fetchSchedules();
    }
  }, [movieId, selectedDate]);

  // Reset selections when date changes
  useEffect(() => {
    setSelectedCinema('');
    setSelectedSchedule('');
    setSelectedSeats([]);
  }, [selectedDate]);

  // Reset seat selection when schedule changes
  useEffect(() => {
    setSelectedSeats([]);
  }, [selectedSchedule]);

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

  const handleScheduleSelect = (scheduleId: string) => {
    setSelectedSchedule(scheduleId);
  };

  const handleSeatSelect = (seatId: string) => {
    const schedule = getSelectedSchedule();
    if (schedule && selectedSeats.length >= 10 && !selectedSeats.includes(seatId)) {
      return; // Max 10 seats per booking
    }
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      }
      return [...prev, seatId];
    });
  };

  // Get filtered schedules with proper sorting
  const getFilteredSchedules = () => {
    return schedules.sort((a, b) => {
      // First sort by cinema/room
      if (a.cinemaId !== b.cinemaId) {
        return a.cinemaId.localeCompare(b.cinemaId);
      }
      // Then sort by start time
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  };

  // Get unique cinemas that have schedules for this movie on selected date
  const getAvailableCinemas = () => {
    const filteredSchedules = getFilteredSchedules();
    const cinemaIds = [...new Set(filteredSchedules.map(st => st.cinemaId))];
    
    // Create proper Cinema objects
    return cinemaIds.map(id => ({
      id,
      name: `Cinema ${id}`,
      image: '/images/cinema-default.jpg',
      address: '123 Movie Street',
      city: 'Ho Chi Minh City',
      phone: '(+84) 123-456-789',
      email: 'cinema@example.com',
      rooms: [],
      facilities: ['Parking', 'Food Court', 'Wheelchair Access'],
      status: 'active' as const,
      manager: 'John Doe',
      rating: 4.5
    }));
  };

  const getSelectedSchedule = () => {
    return schedules.find(st => st.scheduleId === selectedSchedule);
  };

  const getSelectedCinema = () => {
    return mockCinemas.find(c => c.id === selectedCinema);
  };

  const calculateTotal = () => {
    const schedule = getSelectedSchedule();
    return selectedSeats.length * (schedule?.price || 0);
  };

  const handlePayment = async (paymentData: PaymentFormData) => {
    if (!movie) return;
    
    setIsProcessing(true);
    try {
      // TODO: Replace with actual payment API integration
      console.log('Processing payment with:', {
        cardNumber: paymentData.cardNumber,
        cardHolder: paymentData.cardHolder,
        expiryDate: paymentData.expiryDate,
        amount: calculateTotal(),
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated payment processing
      
      const schedule = getSelectedSchedule();
      const cinema = getSelectedCinema();
      
      navigate('/booking/success', {
        state: {
          movieTitle: movie.movieName,
          cinemaName: cinema?.name,
          screenName: schedule?.room?.name,
          date: selectedDate,
          time: schedule?.startTime,
          seats: selectedSeats,
          totalAmount: calculateTotal(),
          confirmationCode: `BK${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }
      });
    } catch (error) {
      console.error('Payment failed:', error);
      // TODO: Show error message to user
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2: return selectedDate;
      case 3: return selectedDate && selectedCinema && selectedSchedule;
      case 4: return selectedDate && selectedCinema && selectedSchedule && selectedSeats.length > 0;
      default: return true;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-secondary-900 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="mt-4 text-white">Loading movie details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !movie) {
    return (
      <Layout>
        <div className="min-h-screen bg-secondary-900 p-8 text-center">
          <h2 className="text-2xl text-white mb-4">{error || 'Movie not found or not currently showing'}</h2>
          <button 
            onClick={() => navigate('/movies')}
            className="text-primary-500 hover:text-primary-400"
          >
            Back to Movies
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-secondary-900 text-white py-8">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.step} className="flex items-center">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${currentStep === step.step ? 'bg-primary-500 text-white' :
                        currentStep > step.step ? 'bg-success-500 text-white' : 'bg-secondary-700 text-secondary-400'}
                    `}
                  >
                    {currentStep > step.step ? '✓' : step.step}
                  </div>
                  <span className="hidden sm:block ml-2 text-sm font-medium text-secondary-400">
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="w-16 sm:w-32 h-1 mx-2 bg-secondary-700">
                      <div
                        className={`h-full ${currentStep > step.step ? 'bg-primary-500' : ''}`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Movie Info */}
          <div className="bg-secondary-800 rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-1/4 mb-4 sm:mb-0">
                <img
                  src={movie.imageUrl}
                  alt={movie.movieName}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="w-full sm:w-3/4 sm:pl-6">
                <h1 className="text-2xl font-bold mb-2">{movie.movieName}</h1>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center text-secondary-400">
                      <Clock size={16} className="mr-2" />
                      <span>{movie.duration} min</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-secondary-400">
                      <Film size={16} className="mr-2" />
                      <span>{movie.movieTypes}</span>
                    </div>
                  </div>
                </div>
                <p className="text-secondary-300">{movie.description}</p>
              </div>
            </div>
          </div>

          {/* Booking Steps */}
          <div className="space-y-8">
            {/* Step 1: Date Selection */}
            <div className={currentStep === 1 ? 'block' : 'hidden'}>
              <h2 className="text-xl font-semibold mb-4">Select Date</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                {dates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      p-4 rounded-xl text-center transition-all
                      ${selectedDate === date 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-secondary-800 text-secondary-400 hover:bg-secondary-700'}
                    `}
                  >
                    <div className="text-sm">{formatDate(date).day}</div>
                    <div className="text-2xl font-bold my-1">{formatDate(date).date}</div>
                    <div className="text-sm">{formatDate(date).month}</div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  disabled={!canProceedToStep(2)}
                  onClick={() => setCurrentStep(2)}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Step 2: Cinema & Schedule Selection */}
            <div className={currentStep === 2 ? 'block' : 'hidden'}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Choose Cinema & Time</h2>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-primary-500 hover:text-primary-400"
                >
                  Change Date
                </button>
              </div>
              <div className="space-y-4">
                {getAvailableCinemas().map((cinema) => (
                  <CinemaCard
                    key={cinema.id}
                    cinema={cinema}
                    schedules={getFilteredSchedules().filter(st => st.cinemaId === cinema.id)}
                    selectedCinema={selectedCinema}
                    selectedSchedule={selectedSchedule}
                    onCinemaSelect={handleCinemaSelect}
                    onScheduleSelect={handleScheduleSelect}
                  />
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button
                  disabled={!canProceedToStep(3)}
                  onClick={() => setCurrentStep(3)}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Step 3: Seat Selection */}
            <div className={currentStep === 3 ? 'block' : 'hidden'}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Select Your Seats</h2>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-primary-500 hover:text-primary-400"
                >
                  Change Cinema/Time
                </button>
              </div>
              <SeatSelection
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                showtime={getSelectedSchedule()}
              />
              <div className="mt-6 flex justify-end space-x-4">
                <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button
                  disabled={!canProceedToStep(4)}
                  onClick={() => setCurrentStep(4)}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Step 4: Payment */}
            <div className={currentStep === 4 ? 'block' : 'hidden'}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Payment</h2>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-primary-500 hover:text-primary-400"
                >
                  Change Seats
                </button>
              </div>
              
              {/* Booking Summary */}
              <div className="bg-secondary-800 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Movie:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{movie.movieName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cinema:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{getSelectedCinema()?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedDate).day}, {formatDate(selectedDate).month} {formatDate(selectedDate).date} at {new Date(getSelectedSchedule()?.startTime || '').toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Seats:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedSeats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-secondary-700">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-semibold text-primary-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <PaymentForm
                onSubmit={handlePayment}
                isProcessing={isProcessing}
                amount={calculateTotal()}
              />

              <div className="mt-6 flex justify-end space-x-4">
                <Button variant="secondary" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookTicket;