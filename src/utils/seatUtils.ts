import { Seat } from '../types/cinema';

export const getSeatColor = (type: Seat['type'], status: Seat['status']): string => {
  // Base colors for different seat types
  const typeColors = {
    standard: 'border-secondary-600 bg-secondary-700/50',
    vip: 'border-warning-500 bg-warning-500/20',
    couple: 'border-pink-500 bg-pink-500/20',
    disabled: 'border-blue-500 bg-blue-500/20'
  };

  // Status overlays
  const statusColors = {
    available: 'text-white hover:bg-primary-500/20 hover:border-primary-400',
    occupied: 'bg-error-500/80 border-error-400 text-white cursor-not-allowed',
    maintenance: 'bg-warning-500/80 border-warning-400 text-white',
    reserved: 'bg-secondary-500/80 border-secondary-400 text-white'
  };

  const baseColor = typeColors[type] || typeColors.standard;
  const statusColor = statusColors[status] || statusColors.available;

  return `${baseColor} ${statusColor}`;
};

export const getSeatTypeIcon = (type: Seat['type']): string => {
  const icons = {
    standard: '💺',
    vip: '👑',
    couple: '💕',
    disabled: '♿'
  };
  return icons[type] || icons.standard;
};

export const getSeatPrice = (type: Seat['type']): number => {
  const prices = {
    standard: 12,
    vip: 25,
    couple: 30,
    disabled: 12
  };
  return prices[type] || prices.standard;
};

export const generateSeatId = (row: string, number: number): string => {
  return `${row}${number.toString().padStart(2, '0')}`;
};

export const createDefaultSeats = (rows: string[], seatsPerRow: number): Seat[] => {
  const seats: Seat[] = [];
  
  rows.forEach(row => {
    for (let i = 1; i <= seatsPerRow; i++) {
      seats.push({
        id: generateSeatId(row, i),
        row,
        number: i,
        type: 'standard',
        status: 'available',
        price: getSeatPrice('standard')
      });
    }
  });
  
  return seats;
};