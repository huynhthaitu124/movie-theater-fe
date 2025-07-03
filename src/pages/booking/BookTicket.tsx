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
import { showtimeService } from '../../services/modules/showtime.service';
import { cinemaService } from '../../services/modules/cinema.service';
import { seatService } from '../../services/modules/seat.service'; 
import { seatTypeService } from '../../services/modules/seat.service';

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
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [scheduleSeats, setScheduleSeats] = useState<any[]>([]);
  const [seatTypes, setSeatTypes] = useState<any[]>([]);
  

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
        const res = await showtimeService.getMovieScheduleByMovieId(movieId);
        // Map API response to your Schedule type
        const formattedSchedules: Schedule[] = res.data.map((schedule: any) => ({
          scheduleId: schedule.scheduleid,
          movieId: schedule.movieid,
          cinemaId: schedule.room?.cinema?.cinemaid || '', // get from nested room.cinema
          roomId: schedule.roomid,
          startTime: `${schedule.showdate}T${schedule.starttime}`,
          endTime: schedule.endtime ? `${schedule.showdate}T${schedule.endtime}` : undefined,
          date: schedule.showdate,
          availableSeats: schedule.room?.capacity || 80,
          totalSeats: schedule.room?.capacity || 100,
          movieName: schedule.movie?.moviename || '',
          movieImageUrl: schedule.movie?.image || '',
          status: schedule.status,
          room: {
            id: schedule.room?.roomid || '',
            name: `Room ${schedule.room?.roomnumber || ''}`,
            capacity: schedule.room?.capacity || 100,
            seats: [],
            rows: schedule.room?.rows || 10,
            columns: schedule.room?.columns || 10,
            type: 'standard',
            status: schedule.room?.isactive ? 'active' : 'inactive',
            features: [],
            cinemaId: schedule.room?.cinemaid || '',
            screenSize: '16m x 8m',
            audioSystem: 'Dolby Atmos',
            createdAt: new Date(schedule.room?.createdat || Date.now()),
            updatedAt: new Date(schedule.room?.updatedat || Date.now())
          }
        }));

        setSchedules(formattedSchedules);
        console.log('Fetched schedules:', formattedSchedules);
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

  // Fetch cinemas
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await cinemaService.getAll();
        setCinemas(res.data);
      } catch (err) {
        setCinemas([]);
      }
    };
    fetchCinemas();
  }, []);

  // Fetch seat types
  useEffect(() => {
  const fetchSeatTypes = async () => {
    try {
      const res = await seatTypeService.getAll();
      setSeatTypes(res.data); // res.data is the array of seat types
    } catch (err) {
      setSeatTypes([]);
    }
  };
  fetchSeatTypes();
}, []);

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
  return schedules
    .filter(schedule => schedule.date === selectedDate)
    .sort((a, b) => {
      if (a.cinemaId !== b.cinemaId) {
        return a.cinemaId.localeCompare(b.cinemaId);
      }
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
};

  // Get unique cinemas that have schedules for this movie on selected date
  const getAvailableCinemas = () => {
    const filteredSchedules = getFilteredSchedules();
    const cinemaIds = [...new Set(filteredSchedules.map(st => st.cinemaId))];
    return cinemas
      .filter(c => cinemaIds.includes(c.cinemaid))
      .map(c => ({
        id: c.cinemaid,
        name: c.cinemaname,
        address: c.address,
        city: c.city,
        phone: c.phone,
        opentime: c.opentime,
        closetime: c.closetime,
        rooms: [],
        status: c.status,
        manager: c.manager || '',
      }));
  };

  const getSelectedSchedule = () => {
    return schedules.find(st => st.scheduleId === selectedSchedule);
  };

  const getSelectedCinema = () => cinemas.find(c => c.cinemaid === selectedCinema);

  const calculateTotal = () => {
    return selectedSeats.reduce((sum, seatId) => {
      const seat = scheduleSeats.find((s: any) => s.seatId === seatId);
      if (!seat) return sum;
      const seatType = seatTypes.find((t: any) =>
        t.name.trim().toLowerCase() === seat.seatTypeName.trim().toLowerCase()
      );
      return sum + (seatType ? seatType.price : 0);
    }, 0);
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

  // Fetch seats when selectedSchedule changes
  useEffect(() => {
    const fetchSeats = async () => {
      const schedule = getSelectedSchedule();
      if (!schedule?.room?.id) {
        setScheduleSeats([]);
        return;
      }
      const res = await seatService.getByRoomId(schedule.room.id);
      setScheduleSeats(res.data);
    };
    if (selectedSchedule) fetchSeats();
  }, [selectedSchedule]);

  // Update getSeatLabel to use scheduleSeats
  const getSeatLabel = (seatId: string) => {
    const seat = scheduleSeats.find((s: any) => s.seatId === seatId);
    return seat ? `${seat.row}${seat.number}` : seatId;
  };

  if (!isLoading && movie && selectedDate && schedules.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-secondary-900 p-8 text-center">
          <h2 className="text-2xl text-white mb-4">No schedule on this date</h2>
          <button 
            onClick={() => {
              setCurrentStep(1);
              setSelectedDate('');
              setError(null);
            }}
            className="text-primary-500 hover:text-primary-400"
          >
            Back to select date
          </button>
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
            onClick={() => {
              setCurrentStep(1);
              setSelectedDate('');
            }}
            className="text-primary-500 hover:text-primary-400"
          >
            Back to select date
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
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="w-full md:w-1/4 mb-4 md:mb-0 flex-shrink-0 flex justify-center">
                <img
                  src={movie.image}
                  alt={movie.movieName}
                  className="w-48 h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
              <div className="w-full md:w-3/4 md:pl-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h1 className="text-3xl font-bold text-white mb-2">{movie.movieName}</h1>
                  <div className="flex items-center space-x-4 text-secondary-400 text-sm mb-2 md:mb-0">
                    <span className="flex items-center"><Clock size={16} className="mr-1" /> {movie.duration} min</span>
                    <span className="flex items-center"><span className="mr-1">16+</span></span>
                    <span className="flex items-center"><span className="mr-1">{movie.movieLanguage}</span></span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div className="flex flex-wrap gap-2 mb-2 md:mb-0">
                    {movie.movieTypes?.split(',').map((type: string) => (
                      <span
                        key={type}
                        className="bg-secondary-700 text-secondary-200 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {type.trim()}
                      </span>
                    ))}
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${movie.status === 'ACTIVE' ? 'bg-green-700 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                      {movie.status === 'ACTIVE' ? 'Now Showing' : 'Coming Soon'}
                    </span>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-white">Overview</span>
                  <div className="text-secondary-300">{movie.description}</div>
                </div>
                <div className="flex flex-col md:flex-row md:space-x-8 mt-4">
                  <div className="mb-2 md:mb-0">
                    <span className="font-semibold text-white">Director</span>
                    <div className="text-secondary-200">{movie.director || 'Unknown'}</div>
                  </div>
                  <div>
                    <span className="font-semibold text-white">Production</span>
                    <div className="text-secondary-200">{movie.productionCompany }</div>
                  </div>
                </div>
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
              </div>
              <SeatSelection
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                showtime={getSelectedSchedule()}
                seatTypes={seatTypes}
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
                    <span className="font-bold text-lg text-primary-500">{getSelectedCinema()?.cinemaname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedDate).month} {formatDate(selectedDate).date} at {new Date(getSelectedSchedule()?.startTime || '').toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 dark:text-gray-400 mt-1">Seats:</span>
                    <span className="font-medium text-gray-900 dark:text-white flex flex-col items-end">
                      {selectedSeats.length > 0
                        ? selectedSeats.map(seatId => {
                            const seat = scheduleSeats.find((s: any) => s.seatId === seatId);
                            const seatType = seatTypes.find((t: any) =>
                              t.name.trim().toLowerCase() === seat?.seatTypeName.trim().toLowerCase()
                            );
                            const price = seatType ? seatType.price : 0;
                            return (
                              <span key={seatId}>
                                {getSeatLabel(seatId)} - {seat?.seatTypeName} - {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(price)}
                              </span>
                            );
                          })
                        : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-secondary-700">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-semibold text-primary-500">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
                    </span>
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