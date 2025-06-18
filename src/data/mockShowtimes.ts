import { Showtime } from '../types/showtime';
import { mockMovies } from './mockMovies';
import { mockLocations } from './mockCinemas';

export const mockShowtimes: Showtime[] = [
  {
    id: 'st-1',
    movieId: mockMovies[0].id,
    cinemaId: mockLocations[0].cinemas[0].id,
    roomId: 'room-1', // Using the correct room ID
    startTime: '2024-03-15T19:30:00',
    endTime: '2024-03-15T21:30:00',
    price: 75000,
    status: 'scheduled',
    format: 'Standard',
    availableSeats: 55,
    totalSeats: 70,
    movie: mockMovies[0],
    cinema: mockLocations[0].cinemas[0],
    room: mockLocations[0].cinemas[0].rooms[0]
  },
  {
    id: 'st-2',
    movieId: mockMovies[1].id,
    cinemaId: mockLocations[0].cinemas[0].id,
    roomId: 'room-2', // Using the correct room ID
    startTime: '2024-03-15T20:00:00',
    endTime: '2024-03-15T22:00:00',
    price: 150000,
    status: 'scheduled',
    format: 'Dolby Atmos',
    availableSeats: 35,
    totalSeats: 50,
    movie: mockMovies[1],
    cinema: mockLocations[0].cinemas[0],
    room: mockLocations[0].cinemas[0].rooms[1]
  }
];