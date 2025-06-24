import { Cinema, Room } from './cinema';
import { Movie } from './movie';

export interface Schedule {
  scheduleId: string;
  movieId: string;
  cinemaId: string;
  roomId: string;
  startTime: string;
  date: string; 
  price: number;
  availableSeats: number;
  totalSeats: number;
  movieName?: string;
  movieImageUrl?: string;
  movie?: Movie;
  cinema?: Cinema;
  room?: Room;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}
