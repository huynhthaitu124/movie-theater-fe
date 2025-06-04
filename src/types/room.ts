export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: 'standard' | 'vip' | 'imax';
  status: 'active' | 'maintenance' | 'inactive';
  features: string[];
  screenSize: string;
  soundSystem: string;
}