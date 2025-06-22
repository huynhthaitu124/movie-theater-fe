import { LocalSeat, SeatType } from '../types/seat';

export const getSeatTypeColor = (seatTypeName: string): string => {
  switch (seatTypeName.toLowerCase()) {
    case 'ghế thường':
    case 'standard':
      return 'bg-blue-500/20 border-blue-500 text-blue-400';
    case 'ghế vip':
    case 'vip':
      return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
    case 'ghế đôi':
    case 'couple':
      return 'bg-pink-500/20 border-pink-500 text-pink-400';
    default:
      return 'bg-gray-500/20 border-gray-500 text-gray-400';
  }
};

export const getSeatStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'AVAILABLE':
      return 'hover:bg-green-500/30 hover:border-green-400';
    case 'OCCUPIED':
      return 'bg-red-500/20 border-red-500 text-red-400 cursor-not-allowed';
    case 'MAINTENANCE':
      return 'bg-orange-500/20 border-orange-500 text-orange-400';
    default:
      return 'bg-gray-500/20 border-gray-500 text-gray-400';
  }
};

export const getSeatTypeIcon = (seatTypeName: string): string => {
  switch (seatTypeName.toLowerCase()) {
    case 'ghế thường':
    case 'standard':
      return '🪑';
    case 'ghế vip':
    case 'vip':
      return '👑';
    case 'ghế đôi':
    case 'couple':
      return '💕';
    default:
      return '🪑';
  }
};

export const generateSeatId = (row: string, number: string): string => {
  // Generate a UUID for new seats
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

export const createDefaultSeatLayout = (
  rows: string[],
  seatsPerRow: number,
  seatTypes: SeatType[]
): LocalSeat[] => {
  const seats: LocalSeat[] = [];
  const defaultSeatType = seatTypes[0];

  if (!defaultSeatType) return seats;

  rows.forEach(row => {
    for (let i = 1; i <= seatsPerRow; i++) {
      seats.push({
        id: generateSeatId(row, i.toString()), // This should match the API's UUID format
        roomId: '',
        seatTypeId: defaultSeatType.seattypeid,
        seatTypeName: defaultSeatType.name,
        number: i.toString(),
        row: row,
        status: 'AVAILABLE',
        isactive: true,
        islinked: false,
        linkedto: null,
        price: defaultSeatType.price,
      });
    }
  });

  return seats;
};