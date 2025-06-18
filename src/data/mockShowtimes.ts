import { Showtime } from '../types/showtime';
import { mockMovies } from './mockMovies';
import { mockLocations } from './mockCinemas';

export const mockShowtimes: Showtime[] = [
  {
    id: 'st-1',
    movieId: mockMovies[0].id,
    cinemaId: mockLocations[0].cinemas[0].id,
    roomId: mockLocations[0].cinemas[0].rooms[0].id,
    startTime: '2024-03-15T19:30:00',
    endTime: '2024-03-15T21:30:00',
    price: 75000,
    status: 'scheduled',
    movie: mockMovies[0],
    cinema: mockLocations[0].cinemas[0],
    room: mockLocations[0].cinemas[0].rooms[0]
  },
  {
    id: 'st-2',
    movieId: mockMovies[1].id,
    cinemaId: mockLocations[0].cinemas[0].id,
    roomId: mockLocations[0].cinemas[0].rooms[1].id,
    startTime: '2024-03-15T20:00:00',
    endTime: '2024-03-15T22:00:00',
    price: 150000,
    status: 'scheduled',
    movie: mockMovies[1],
    cinema: mockLocations[0].cinemas[0],
    room: mockLocations[0].cinemas[0].rooms[1]
  },
  {
    id: 'st-3',
    movieId: mockMovies[2].id,
    cinemaId: mockLocations[1].cinemas[0].id,
    roomId: mockLocations[1].cinemas[0].rooms[0].id,
    startTime: '2024-03-16T15:00:00',
    endTime: '2024-03-16T17:00:00',
    price: 85000,
    status: 'scheduled',
    movie: mockMovies[2],
    cinema: mockLocations[1].cinemas[0],
    room: mockLocations[1].cinemas[0].rooms[0]
  }
];