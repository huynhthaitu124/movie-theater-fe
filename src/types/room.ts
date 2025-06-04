export interface Room {
  id: string;
  cinemaId: string;
  name: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  seats: Seat[];
  createdAt: string;
  updatedAt: string;
}

export interface Seat {
  id: string;
  roomId: string;
  seatTypeId: string;
  row: string;
  number: string;
  status: 'available' | 'booked' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

export interface SeatType {
  id: string;
  name: string;
  basePrice: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  rooms: Room[];
  createdAt: string;
  updatedAt: string;
}