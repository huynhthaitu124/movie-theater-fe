export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'standard' | 'vip' | 'imax';
  status: 'active' | 'maintenance' | 'inactive';
  features: string[];
  screenSize: string;
  soundSystem: string;
  seatMap: SeatMap;
  createdAt: string;
  updatedAt: string;
}

export interface SeatMap {
  rows: number;
  columns: number;
  seats: Seat[][];
}

export interface Seat {
  type: 'regular' | 'vip' | 'couple' | 'unavailable';
  number: string;
  price: number;
}