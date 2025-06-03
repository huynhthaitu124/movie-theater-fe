export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  genre: string[];
  releaseDate: string;
  director: string;
  cast: string[];
  posterUrl: string;
  trailerUrl?: string;
  rating: number;
  status: 'coming_soon' | 'now_showing' | 'ended';
}

export interface CinemaRoom {
  id: string;
  name: string;
  capacity: number;
  rows: number;
  columns: number;
  seatMap: SeatType[][];
}

export type SeatType = 'regular' | 'vip' | 'couple' | 'unavailable';

export interface Showtime {
  id: string;
  movieId: string;
  movie?: Movie;
  cinemaRoomId: string;
  cinemaRoom?: CinemaRoom;
  startTime: string;
  endTime: string;
  date: string;
  price: {
    regular: number;
    vip: number;
    couple: number;
  };
}

export interface Seat {
  row: number;
  column: number;
  type: SeatType;
  status: 'available' | 'selected' | 'booked' | 'reserved';
  seatNumber: string;
}

export interface Booking {
  id: string;
  userId: string;
  user?: User;
  showtimeId: string;
  showtime?: Showtime;
  seats: Seat[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  promotionId?: string;
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  status: 'active' | 'inactive';
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joinDate: string;
  status: 'active' | 'inactive';
}