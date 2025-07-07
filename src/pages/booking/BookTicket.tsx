import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Loader2 } from 'lucide-react';
import { useAuth, AuthContextType } from '../../contexts/AuthContext';

// Components
import Layout from '../../components/layout/Layout';
import { ProductSelection } from '../../components/booking/ProductSelection';
import Button from '../../components/common/Button';
import SeatSelection from '../../components/booking/SeatSelection';

// Services
import { productService } from '../../services/modules/product.service';
import { movieService } from '../../services/modules/movie.service';
import { showtimeService } from '../../services/modules/showtime.service';
import { cinemaService } from '../../services/modules/cinema.service';
import { seatService, seatTypeService } from '../../services/modules/seat.service';
import { seatScheduleService } from '../../services/modules/seatSchedule.service';
import { transactionService } from '../../services/modules/transaction.service';
import { vnpayService } from '../../services/modules/vnpay.service';
import { axiosClient } from '../../services/api/axiosClient';

// Types
import { Movie } from '../../types/movie';
import { Schedule } from '../../types/schedule';
import { Product } from '../../types/product';
import { BookingStep } from '../../types/booking';

const BookTicket: React.FC = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string; quantity: number }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [scheduleSeats, setScheduleSeats] = useState<any[]>([]);
  const [seatTypes, setSeatTypes] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const steps: BookingStep[] = [
    { step: 1, title: 'Select Date', isCompleted: false },
    { step: 2, title: 'Choose Cinema & Time', isCompleted: false },
    { step: 3, title: 'Pick Seats', isCompleted: false },
    { step: 4, title: 'Food & Beverages', isCompleted: false },
    { step: 5, title: 'Payment', isCompleted: false },
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
          cinemaId: schedule.room?.cinema?.cinemaid || '',
          roomId: schedule.roomid,
          startTime: `${schedule.showdate}T${schedule.starttime}`,
          date: schedule.showdate,
          // Initially set available seats to 0, will update after counting actual seats
          availableSeats: 0,
          totalSeats: 0, // Will be updated with actual count from room seats
          movieName: schedule.movie?.moviename || '',
          movieImageUrl: schedule.movie?.image || '',
          status: schedule.status || 'scheduled',
          price: schedule.price || 0,
          room: {
            id: schedule.room?.roomid || '',
            roomtypeid: schedule.room?.roomtypeid || '',
            cinemaname: schedule.room?.cinema?.cinemaname || '',
            roomnumber: schedule.room?.roomnumber || 1,
            name: `Room ${schedule.room?.roomnumber || ''}`,
            capacity: schedule.room?.capacity || 100,
            isactive: true,
            createdat: schedule.room?.createdat || new Date().toISOString(),
            updatedat: schedule.room?.updatedat || new Date().toISOString(),
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

  // Update available seats count for all schedules when schedules are loaded
  useEffect(() => {
    const updateAllScheduleSeats = async () => {
      if (!schedules.length) return;
      
      // Create a copy of schedules to update
      const updatedSchedules = [...schedules];
      
      // Process each schedule to get actual available seats
      for (let i = 0; i < updatedSchedules.length; i++) {
        const schedule = updatedSchedules[i];
        try {
          // First fetch all room seats to get the actual total seat count
          if (!schedule.room?.id) continue;
          
          // Fetch all seats in the room
          const roomSeatsRes = await seatService.getByRoomId(schedule.room.id);
          const roomSeats = roomSeatsRes.data || [];
          
          // Total seats is the actual count of seats in the room
          const totalSeats = roomSeats.length;
          
          // Fetch seat schedule data to determine booked seats
          const scheduleResponse = await seatScheduleService.getByScheduleId(schedule.scheduleId);
          const seatSchedules = scheduleResponse.data || [];
          
          // Count booked seats
          const bookedSeatsCount = seatSchedules.filter((seat: any) => 
            seat.status?.toUpperCase() === 'BOOKED').length;
          
          // Update available and total seats count
          updatedSchedules[i] = {
            ...schedule,
            totalSeats: totalSeats,
            availableSeats: totalSeats - bookedSeatsCount
          };
          
          console.log(`Schedule ${schedule.scheduleId}: ${updatedSchedules[i].availableSeats}/${totalSeats} seats available (${bookedSeatsCount} booked)`);
        } catch (error) {
          console.error(`Error updating seats for schedule ${schedule.scheduleId}:`, error);
        }
      }
      
      // Update schedules state with actual available seats counts
      setSchedules(updatedSchedules);
      console.log('All schedules updated with actual available seats count');
    };
    
    updateAllScheduleSeats();
  }, [schedules.length]); // Only run when the number of schedules changes

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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const res = await productService.getAll();
        setProducts(res.filter(p => p.isactive && p.status === 'AVAILABLE'));
      } catch (err) {
        console.error('Error fetching products:', err);
        setProductsError('Failed to load food & beverages. Please try again.');
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    if (currentStep === 4) {
      fetchProducts();
    }
  }, [currentStep]);

  // Check for payment success in localStorage when component mounts
  useEffect(() => {
    const savedPaymentSuccess = localStorage.getItem('booking_payment_success');
    if (savedPaymentSuccess === 'true') {
      setPaymentSuccess(true);
    }
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
    localStorage.setItem('booking_scheduleId', scheduleId);
  };

  const handleSeatSelect = (seatId: string) => {
    // Get seat object to check its status
    const seat = scheduleSeats.find((s: any) => s.seatId === seatId);
    
    // Don't allow selection if seat is already booked
    if (seat && seat.status === 'BOOKED') {
      return; // Seat is already booked
    }
    
    // Don't allow more than 10 seats
    const schedule = getSelectedSchedule();
    if (schedule && selectedSeats.length >= 10 && !selectedSeats.includes(seatId)) {
      return; // Max 10 seats per booking
    }
    
    setSelectedSeats(prev => {
      const newSelectedSeats = prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId];
      
      // Store the updated selected seats in localStorage
      localStorage.setItem('booking_selectedSeats', JSON.stringify(newSelectedSeats));
      
      return newSelectedSeats;
    });
  };

  const handleProductSelect = (productId: string, quantity: number) => {
    setSelectedProducts(prev => {
      if (quantity === 0) {
        return prev.filter(p => p.productId !== productId);
      }
      const existing = prev.find(p => p.productId === productId);
      if (existing) {
        return prev.map(p => p.productId === productId ? { ...p, quantity } : p);
      }
      return [...prev, { productId, quantity }];
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
      .map(c => c);
  };

  const getSelectedSchedule = () => {
    return schedules.find(st => st.scheduleId === selectedSchedule);
  };

  const getSelectedCinema = () => cinemas.find(c => c.cinemaid === selectedCinema);

  const calculateTotal = () => {
    // Calculate seats total
    const seatsTotal = selectedSeats.reduce((sum, seatId) => {
      const seat = scheduleSeats.find((s: any) => s.seatId === seatId);
      if (!seat) return sum;
      const seatType = seatTypes.find((t: any) =>
        t.name.trim().toLowerCase() === seat.seatTypeName.trim().toLowerCase()
      );
      return sum + (seatType ? seatType.price : 0);
    }, 0);

    // Calculate products total
    const productsTotal = selectedProducts.reduce((sum, { productId, quantity }) => {
      const product = products.find(p => p.productId === productId);
      return sum + (product ? product.price * quantity : 0);
    }, 0);

    // No booking fee
    return seatsTotal + productsTotal;
  };

  const handleConfirmPayment = async () => {
    if (!movie) return;
    
    // Check if payment was already successful
    if (paymentSuccess) {
      alert('Your payment was already processed successfully!');
      return;
    }
    
    setIsProcessing(true);
    try {
      if (!currentUser) {
        alert('You need to be logged in to complete this booking.');
        navigate('/login');
        return;
      }

      // Get the current logged-in user's accountId from the auth context
      const accountId = currentUser.accountid;

      // Debug: Log selected seats before creating transaction
      console.log('Selected seats count:', selectedSeats.length);
      console.log('Selected seats:', selectedSeats);
      
      // Create transaction with the booking details
      // Ensure accountId is not undefined
      if (!accountId) {
        alert('Your account information is missing. Please log in again.');
        navigate('/login');
        return;
      }
      
      const transactionData = {
        accountId: accountId, // This ensures it's a string, not possibly undefined
        seatIds: selectedSeats,
        productItems: selectedProducts.length > 0 ? selectedProducts : undefined
      };
      
      // Debug: Log transaction data
      console.log('Transaction data being sent:', JSON.stringify(transactionData));
      
      // Call the transaction API
      const transactionResponse = await transactionService.createTransaction(transactionData);
      console.log('Transaction created:', transactionResponse.data);
      
      // Extract the transactionId from the response
      const transactionId = transactionResponse.data.transactionid;
      
      // Make sure the selected seats are stored in localStorage before redirecting
      localStorage.setItem('booking_selectedSeats', JSON.stringify(selectedSeats));
      localStorage.setItem('booking_scheduleId', selectedSchedule);
      localStorage.setItem('booking_transactionId', transactionId);
      
      // Use the transactionId to create a VNPay payment URL
      const paymentUrl = await vnpayService.createPaymentUrl(transactionId);
      
      // Redirect to the VNPay payment URL
      window.location.href = paymentUrl;
      
    } catch (error: any) {
      console.error('Payment initialization failed:', error);
      
      // Display more detailed error messages based on which part failed
      if (error.response?.status === 400) {
        alert(`Invalid request: ${error.response?.data?.message || 'Please check your booking details.'}`);
      } else if (error.response?.status === 401) {
        alert('Authentication error. Please log in again.');
        navigate('/login');
      } else if (error.message?.includes('transaction')) {
        alert('Failed to create transaction. Please try again or contact support.');
      } else if (error.message?.includes('payment')) {
        alert('Payment service is currently unavailable. Please try again later.');
      } else {
        alert('Failed to initialize payment. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2: return selectedDate;
      case 3: return selectedDate && selectedCinema && selectedSchedule;
      case 4: return selectedDate && selectedCinema && selectedSchedule && selectedSeats.length > 0;
      case 5: return selectedDate && selectedCinema && selectedSchedule && selectedSeats.length > 0;
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
      
      try {
        // Fetch all seats in the room first
        const roomSeatsRes = await seatService.getByRoomId(schedule.room.id);
        const roomSeats = roomSeatsRes.data;
        
        // Update the total seats count in the selected schedule
        if (schedule) {
          // Update the schedule with the actual number of seats
          const updatedSchedule = {
            ...schedule,
            totalSeats: roomSeats.length
          };
          
          // Update the schedules state with the correct total seats
          setSchedules(prevSchedules => 
            prevSchedules.map(s => 
              s.scheduleId === selectedSchedule ? updatedSchedule : s
            )
          );
        }
        
        try {
          // Use the service instead of direct API call for better error handling and data formatting
          console.log(`Fetching seat schedule for scheduleId: ${selectedSchedule}`);
          const scheduleResponse = await seatScheduleService.getByScheduleId(selectedSchedule);
          console.log('Seat schedule response:', scheduleResponse);
          
          // Get the seat schedules from our properly formatted response
          const seatSchedules = scheduleResponse.data || [];
          console.log('Seat schedules array:', seatSchedules);
          console.log(`Total room seats: ${roomSeats.length}, Seat schedules: ${seatSchedules.length}`);
          
          // Let's check what properties are available on the first seat schedule if any
          if (seatSchedules && seatSchedules.length > 0) {
            console.log('First seat schedule object keys:', Object.keys(seatSchedules[0]));
            console.log('First seat schedule full object:', seatSchedules[0]);
          }
          
          // Combine room seats with booking status
          const seatsWithStatus = roomSeats.map((seat: any) => {
            // Log to check each seat for debugging
            console.log(`Checking room seat ${seat.row}${seat.number}, seatId: ${seat.seatId}`);
            
            // First try to find matching seat schedule by seatId with proper case handling
            let foundSchedule = null;
            
            // Attempt to match by seatId considering all possible property names and case variations
            for (const ss of seatSchedules) {
              // Check all possible fields that might contain seatId with case insensitive comparison
              // Using optional chaining and accessing properties safely
              const seatIdMatch = 
                (ss.seatId && ss.seatId.toLowerCase() === seat.seatId.toLowerCase()) || 
                // Use bracket notation to access potential lowercase property name
                (ss['seatid'] && ss['seatid'].toLowerCase() === seat.seatId.toLowerCase()) ||
                (ss.seatScheduleId && ss.seatScheduleId.toLowerCase() === seat.seatId.toLowerCase());
                
              if (seatIdMatch) {
                console.log(`MATCH FOUND by ID for ${seat.row}${seat.number} with status ${ss.status}`);
                foundSchedule = ss;
                break;
              }
            }
            
            // If no match by ID, try matching by row and number (these are more reliable)
            if (!foundSchedule) {
              foundSchedule = seatSchedules.find((ss: any) => 
                ss.row && ss.number && 
                ss.row.toLowerCase() === seat.row.toLowerCase() && 
                ss.number.toLowerCase() === seat.number.toLowerCase());
              
              if (foundSchedule) {
                console.log(`MATCH FOUND by row/number for ${seat.row}${seat.number} with status ${foundSchedule.status}`);
              }
            }
            
            // Extra debug for specific seats to help troubleshoot
            if (seat.row === "A" && (seat.number === "1" || seat.number === "2" || seat.number === "6" || seat.number === "7")) {
              console.log(`SPECIAL CHECK: Seat ${seat.row}${seat.number} with id ${seat.seatId}`);
              console.log('Found schedule?', !!foundSchedule);
              if (foundSchedule) {
                console.log('Schedule data:', JSON.stringify(foundSchedule));
                console.log('Status from schedule:', foundSchedule.status);
              }
            }
            
            // Make sure we handle case-insensitive status comparison
            const isBooked = foundSchedule && 
              (foundSchedule.status?.toUpperCase() === "BOOKED" || 
              foundSchedule.status?.toUpperCase() === "UNAVAILABLE");
              
            return {
              ...seat,
              // Status comes from the seatSchedule object, not the seat object
              status: isBooked ? "BOOKED" : "AVAILABLE"
            };
          });
          
          console.log('Seats with status mapped:', seatsWithStatus);
          setScheduleSeats(seatsWithStatus);
        } catch (scheduleError) {
          console.error('Error fetching seat schedules:', scheduleError);
          console.log('Falling back to default seat status');
          // If seat schedule fetch fails, just use the room seats without status
          // Show an alert to the user about the issue
          alert('Could not retrieve current seat booking information. Some seats might already be booked.');
          setScheduleSeats(roomSeats.map((seat: any) => ({
            ...seat,
            status: 'AVAILABLE' // Default all to available if we can't get booking status
          })));
        }
      } catch (error) {
        console.error('Error fetching seats:', error);
        setScheduleSeats([]);
      }
    };
    
    if (selectedSchedule) fetchSeats();
  }, [selectedSchedule]);

  // Update getSeatLabel to use scheduleSeats
  const getSeatLabel = (seatId: string) => {
    const seat = scheduleSeats.find((s: any) => s.seatId === seatId);
    return seat ? `${seat.row}${seat.number}` : seatId;
  };

  // Check for successful payment status when component mounts
  useEffect(() => {
    const paymentStatus = localStorage.getItem('booking_payment_success');
    const storedScheduleId = localStorage.getItem('booking_scheduleId');
    
    // If there's a successful payment status and it matches the current schedule
    if (paymentStatus === 'true' && storedScheduleId === selectedSchedule) {
      setPaymentSuccess(true);
    }
    
    // Listen for URL parameters that might indicate payment success
    const urlParams = new URLSearchParams(window.location.search);
    const vnpResponseCode = urlParams.get('vnp_ResponseCode');
    
    // VNPay returns '00' for successful payments
    if (vnpResponseCode === '00') {
      setPaymentSuccess(true);
      localStorage.setItem('booking_payment_success', 'true');
      
    }
  }, [selectedSchedule]);

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
              // Reset payment success state
              localStorage.removeItem('booking_payment_success');
              setPaymentSuccess(false);
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
              // Reset payment success state
              localStorage.removeItem('booking_payment_success');
              setPaymentSuccess(false);
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
                    onClick={() => {
                      setSelectedDate(date);
                      // Reset payment success state when starting a new booking flow
                      localStorage.removeItem('booking_payment_success');
                      setPaymentSuccess(false);
                    }}
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
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">Choose Cinema & Time</h2>
              </div>

              {/* Cinema List */}
              <div className="space-y-6">
                {getAvailableCinemas().map((cinema) => (
                  <div 
                    key={cinema.cinemaid} 
                    className={`
                      bg-secondary-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300
                      ${selectedCinema === cinema.cinemaid ? 'ring-2 ring-primary-500' : 'hover:bg-secondary-700/50'}
                    `}
                  >
                    {/* Cinema Header */}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {cinema.cinemaname}
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-secondary-400">
                        {/* Address */}
                        <div className="flex items-center">
                          <MapPin size={18} className="mr-2 text-primary-500" />
                          <span>{cinema.address}</span>
                        </div>
                        {/* Operating Hours */}
                        <div className="flex items-center">
                          <Clock size={18} className="mr-2 text-primary-500" />
                          <span>{cinema.opentime.slice(0,5)} - {cinema.closetime.slice(0,5)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Schedule Grid */}
                    <div className="bg-secondary-900/50 p-6 border-t border-secondary-700">
                      <h4 className="text-lg font-semibold text-white mb-4">Available Times</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {getFilteredSchedules()
                          .filter(schedule => schedule.cinemaId === cinema.cinemaid)
                          .map((schedule) => {
                            // Calculate availability percentage with safety check to avoid division by zero
                            const seatsPercentage = schedule.totalSeats > 0 
                              ? (schedule.availableSeats / schedule.totalSeats) * 100 
                              : 0;
                            
                            const availability = seatsPercentage > 50 ? 'high' : seatsPercentage > 20 ? 'medium' : 'low';
                            const availabilityColor = {
                              high: 'text-success-500',
                              medium: 'text-warning-500',
                              low: 'text-error-500'
                            }[availability];

                            return (
                              <button
                                key={schedule.scheduleId}
                                onClick={() => {
                                  handleCinemaSelect(cinema.cinemaid);
                                  handleScheduleSelect(schedule.scheduleId);
                                }}
                                className={`
                                  p-4 rounded-lg transition-all duration-200 text-left space-y-2
                                  ${selectedSchedule === schedule.scheduleId 
                                    ? 'bg-primary-500/20 border-2 border-primary-500 text-white' 
                                    : 'bg-secondary-800 border border-secondary-600 hover:border-primary-500 hover:bg-secondary-700 text-secondary-400'
                                  }
                                `}
                              >
                                {/* Time */}
                                <div className="text-lg font-semibold">
                                  {new Date(schedule.startTime).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </div>

                                {/* Seat Availability */}
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-1">
                                    <Users size={14} className={availabilityColor} />
                                    <span className={availabilityColor}>
                                      {schedule.availableSeats}/{schedule.totalSeats}
                                    </span>
                                  </div>
                                  <span className="text-xs opacity-75">{schedule.room?.name}</span>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-end space-x-4">
                <Button variant="secondary" onClick={() => {
                  setCurrentStep(1);
                  setSelectedDate('');
                  // Reset payment success state
                  localStorage.removeItem('booking_payment_success');
                  setPaymentSuccess(false);
                }}>
                  Back to select date
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
                scheduleSeats={scheduleSeats}
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

            {/* Step 4: Product Selection */}
            <div className={currentStep === 4 ? 'block' : 'hidden'}>
              {productsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
                </div>
              ) : productsError ? (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-red-500 mb-2">{productsError}</h3>
                  <Button variant="secondary" onClick={() => setCurrentStep(3)}>
                    Back
                  </Button>
                </div>
              ) : (
                <>              <ProductSelection
                products={products}
                selectedProducts={selectedProducts}
                onProductSelect={handleProductSelect}
                isLoading={productsLoading}
                error={productsError}
              />
                  
                  <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="secondary" onClick={() => setCurrentStep(3)}>
                      Back
                    </Button>
                    <Button
                      disabled={!canProceedToStep(5)}
                      onClick={() => setCurrentStep(5)}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Step 5: Payment */}
            <div className={currentStep === 5 ? 'block' : 'hidden'}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Payment</h2>
              </div>

              {/* Display payment success message if already paid */}
              {paymentSuccess && (
                <div className="bg-green-900/30 border border-green-500 text-green-300 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-center text-green-500 mb-2">Payment Successfully Completed</h3>
                  <p className="text-center mb-4">Your booking has been confirmed and tickets have been reserved.</p>
                  <div className="flex justify-center">
                    <Button onClick={() => navigate('/profile/bookings')} className="bg-green-600 hover:bg-green-700">
                      View My Bookings
                    </Button>
                  </div>
                </div>
              )}
              
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
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600 dark:text-gray-400 mt-1">Products:</span>
                    <span className="font-medium text-gray-900 dark:text-white flex flex-col items-end">
                      {selectedProducts.length > 0
                        ? selectedProducts.map(({ productId, quantity }) => {
                            const product = products.find(p => p.productId === productId);
                            return (
                              <span key={productId}>
                                {product?.name} x {quantity} - {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(product ? product.price * quantity : 0)}
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

              {/* Payment Action */}
              {!paymentSuccess && (
                <div className="bg-secondary-800 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Complete Your Payment</h3>
                    <p className="text-secondary-400 mt-2">
                      After confirming, you will be redirected to VNPay to complete your payment securely.
                    </p>
                  </div>
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={handleConfirmPayment}
                      disabled={isProcessing}
                      className="px-8 py-3 text-lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Confirm and Pay'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-4">
                <Button variant="secondary" onClick={() => setCurrentStep(4)}>
                  Back
                </Button>
                {paymentSuccess && (
                  <Button variant="primary" onClick={() => {
                    setCurrentStep(1);
                    setSelectedDate('');
                    // Reset payment success state to start a new booking
                    localStorage.removeItem('booking_payment_success');
                    setPaymentSuccess(false);
                  }}>
                    Book Another Ticket
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookTicket;