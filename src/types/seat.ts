// API Response Types
export interface SeatResponse {
  seatId: string;
  seatTypeName: string;
  number: string;
  row: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  isactive: boolean;
  islinked: boolean;
  linkedto: string | null;
  createdat: string;
  updatedat: string;
  roomId: string;
}

export interface SeatType {
  seattypeid: string;
  name: string;
  price: number;
  isactive: boolean;
  createdat: string;
  updatedat: string;
}

// Local State Types
export interface LocalSeat {
  id: string;
  roomId: string;
  seatTypeId: string;
  seatTypeName: string;
  number: string;
  row: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  isactive: boolean;
  islinked: boolean;
  linkedto: string | null;
  price: number;
}

// API DTOs
export interface SeatCreateDto {
  roomId: string;
  seatTypeId: string;
  number: string;
  row: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  isactive: boolean;
  islinked: boolean;
  linkedto?: string;
}

export interface SeatUpdateDto {
  seatTypeId: string;
  number: string;
  row: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  isactive: boolean;
  islinked: boolean;
  linkedto?: string;
}

export interface SeatTypeCreateDto {
  name: string;
  price: number;
  isactive: boolean;
}

export interface SeatTypeUpdateDto {
  name?: string;
  price?: number;
  isactive?: boolean;
}

// API Response Wrapper
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface SeatType {
    id: string;
    name: string;
    description?: string;
}

export interface SeatTypeProps {
    seatType: SeatType | null;
    onSubmit: (seatType: SeatType) => void;
    onClose: () => void;
}

export interface Seat {
  seatId: string;
  seattypeid: string;
  seatTypeName: string;
  number: string;
  row: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'BLOCKED';
  isactive: boolean;
  islinked: boolean;
  linkedto: string | null;
  createdat: string;
  updatedat: string;
  roomId: string;
}

export interface SeatCreateRequest {
  seatTypeName: string;
  number: string;
  row: string;
  status: string;
  isactive: boolean;
  islinked: boolean;
  linkedto?: string | null;
  roomId: string;
}

