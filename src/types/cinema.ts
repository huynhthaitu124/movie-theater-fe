export interface Room {
  id: string;          // This maps to roomId from API
  roomtypeid: string;  // Add this field
  cinemaname: string;  // Add this field
  roomnumber: number;
  name?: string;       // Add this as optional since API doesn't provide it
  capacity: number;
  isactive: boolean;
  createdat: string;
  updatedat: string;
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









