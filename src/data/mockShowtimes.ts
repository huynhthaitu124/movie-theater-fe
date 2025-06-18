import { Showtime } from '../types/showtime';
import { mockMovies } from './mockMovies';
import { mockLocations } from './mockCinemas';

export const mockShowtimes: Showtime[] = [
  // Only include showtimes for "now-showing" movies (movie-1 and movie-5)
  {
    id: 'st-1',
    movieId: 'movie-1', // Avengers: Endgame
    cinemaId: mockLocations[0].cinemas[0].id,
    roomId: 'room-3',
    startTime: '2025-06-21T10:00:00', // Update to current date
    endTime: '2025-06-21T13:01:00',
    price: 180000,
    status: 'scheduled',
    format: 'IMAX',
    availableSeats: 100,
    totalSeats: 120,
    movie: mockMovies[0],
    cinema: mockLocations[0].cinemas[0],
    room: mockLocations[0].cinemas[0].rooms[2]
  },
  // Add more showtimes for different dates and cinemas
  {
    id: 'st-2',
    movieId: 'movie-1',
    cinemaId: mockLocations[0].cinemas[1].id,
    roomId: 'room-2',
    startTime: '2025-06-21T14:00:00',
    endTime: '2025-06-21T17:01:00',
    price: 150000,
    status: 'scheduled',
    format: 'Dolby Atmos',
    availableSeats: 40,
    totalSeats: 50,
    movie: mockMovies[0],
    cinema: mockLocations[0].cinemas[1],
    room: mockLocations[0].cinemas[1].rooms[1]
  }
  // Add similar entries for movie-5 (Top Gun: Maverick)
];

export default mockShowtimes;