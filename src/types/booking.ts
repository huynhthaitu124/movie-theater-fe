export interface Cinema {
  id: string;
  name: string;
  address: string;
  distance: string;
  amenities: string[];
  rating: number;
  image: string;
}

export interface Showtime {
  id: string;
  time: string;
  price: number;
  type: 'Early Bird' | 'Matinee' | 'Standard' | 'Prime Time' | 'Late Night' | 'IMAX' | '4DX';
  format: 'Standard' | 'IMAX' | '4DX' | 'Dolby Atmos';
  availableSeats: number;
  totalSeats: number;
  cinemaId: string;
}

export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  duration: number;
  genre: string[];
  rating: string;
  description: string;
}

export interface BookingStep {
  step: number;
  title: string;
  isCompleted: boolean;
}