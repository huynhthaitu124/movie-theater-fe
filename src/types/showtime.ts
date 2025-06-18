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
  movie?: Movie;
  cinema?: Cinema;
  room?: Room;
}