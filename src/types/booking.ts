export interface Showtime {
  id: string;
  movieId: string;
  date: string;
  time: string;
  roomId: string;
  price: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'available' | 'occupied' | 'selected';
  type: 'standard' | 'vip' | 'couple';
}

export interface BookingStep {
  step: number;
  title: string;
  isCompleted: boolean;
}
