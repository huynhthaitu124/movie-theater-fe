export interface Room {
  id: string;          // This maps to roomId from API
  roomtypeid: string;
  cinemaname: string;
  roomnumber: number;
  name?: string;
  capacity: number;
  isactive: boolean;
  createdat: string;
  updatedat: string;
  rows?: number;       // <-- Add this
  columns?: number;    // <-- Add this
}

export interface Cinema {
  cinemaid: string;
  cinemaname: string;
  address: string;
  city: string;
  phone: string;
  email: string | null;
  totalroom: number;
  opentime: string;
  closetime: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED'; // Ensure uppercase values
  isactive: boolean;
  createdat?: string;
  updatedat?: string;
  // Frontend specific fields
  rooms?: Room[];
  facilities?: string[];
  manager?: string;
  rating?: number;
  image?: string;
}

export interface Location {
  id: string;
  name: string;
  region: string;
  cinemas: Cinema[];
}









