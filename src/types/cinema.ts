export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'vip' | 'couple';
  status: 'available' | 'maintenance'; // removed 'reserved'
  price?: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  seats: Seat[];
  layout: {
    rows: number;
    seatsPerRow: number;
  };
  type: 'standard' | 'vip' | 'imax' | '4dx';
  status: 'active' | 'maintenance' | 'closed';
  features: string[];
  cinemaId: string;
  screenSize: string;
  audioSystem: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  rooms: Room[];
  facilities: string[];
  status: 'active' | 'maintenance' | 'closed';
  manager: string;
}

export interface Location {
  id: string;
  name: string;
  region: string;
  cinemas: Cinema[];
}

export interface SeatSelection {
  seats: string[];
  type: Seat['type'];
  status: Seat['status'];
}



export interface SeatType {
  id: string;
  name: string;
  basePrice: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}
