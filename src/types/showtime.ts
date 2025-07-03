import { Movie } from './movie';
import { Cinema, Room } from './cinema';

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  price: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  format: 'Standard' | 'IMAX' | '4DX' | 'Dolby Atmos';
  availableSeats: number;
  totalSeats: number;
  movie?: Movie;
  cinema?: Cinema;
  room?: Room;
}



export interface CinemaRoom {
  id: string;
  name: string;
  capacity: number;
  type: 'Standard' | 'IMAX' | 'VIP' | '4DX';
  features: string[];
}



export interface Showtime {
  id: string;
  movieId: string;
  roomId: string;
  cinemaId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  availableSeats: number;
}

export interface ShowtimeFormData {
  movieId: string;
  roomId: string;
  cinemaId: string;
  date: string;
  startTime: string;
  price: number;
}

export interface CalendarEvent {
  id: string;
  movieId: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  roomId: string;
  price: number;
  color: string;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
}