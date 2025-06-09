import React, { useMemo } from 'react';
import { Square, Star, Heart } from 'lucide-react';

interface SeatSelectionProps {
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  ticketPrice: number;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  selectedSeats,
  onSeatSelect,
  ticketPrice,
}) => {
  // Use useMemo to create persistent seat layout
  const seatRows = useMemo(
    () =>
      Array.from({ length: 8 }, (_, rowIndex) => {
        const row = String.fromCharCode(65 + rowIndex);
        return {
          row,
          seats: Array.from({ length: 12 }, (_, seatIndex) => ({
            id: `${row}${seatIndex + 1}`,
            row,
            number: seatIndex + 1,
            type: rowIndex < 2 ? 'vip' : 'standard' as 'vip' | 'standard' | 'couple',
            // Set some seats as permanently occupied for demo
            status: [2, 7, 12, 18, 25, 45, 52].includes(rowIndex * 12 + seatIndex + 1)
              ? 'occupied'
              : 'available',
            price: rowIndex < 2 ? ticketPrice * 1.5 : ticketPrice,
          })),
        };
      }),
    [ticketPrice] // Only recreate when ticket price changes
  );

  const getSeatIcon = (type: 'vip' | 'couple' | 'standard') => {
    switch (type) {
      case 'vip':
        return <Star size={20} className="mx-auto" />;
      case 'couple':
        return <Heart size={20} className="mx-auto" />;
      default:
        return <Square size={20} className="mx-auto" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-secondary-800 rounded-lg p-6">
        {/* Screen */}
        <div className="relative mb-12">
          <div className="w-3/4 h-2 bg-primary-500 mx-auto rounded-lg mb-4" />
          <div className="text-center text-sm text-secondary-400">Screen</div>
        </div>

        {/* Seats */}
        <div className="space-y-4">
          {seatRows.map((row) => (
            <div key={row.row} className="flex items-center gap-4">
              <div className="w-6 text-secondary-400 text-sm">{row.row}</div>
              <div className="flex-1 grid grid-cols-12 gap-2">
                {row.seats.map((seat) => (
                  <button
                    key={seat.id}
                    disabled={seat.status === 'occupied'}
                    onClick={() => onSeatSelect(seat.id)}
                    className={`
                      p-2 rounded transition-colors
                      ${seat.status === 'occupied'
                        ? 'bg-secondary-700 text-secondary-500 cursor-not-allowed'
                        : selectedSeats.includes(seat.id)
                        ? 'bg-primary-500 text-white'
                        : seat.type === 'vip'
                        ? 'bg-secondary-700 text-yellow-500 hover:bg-primary-500/20'
                        : 'bg-secondary-700 text-secondary-300 hover:bg-primary-500/20'
                      }
                    `}
                  >
                    {getSeatIcon(seat.type)}
                    <div className="text-xs mt-1">{seat.number}</div>
                  </button>
                ))}
              </div>
              <div className="w-6" />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <Square size={16} className="text-secondary-300" />
            <span className="text-sm text-secondary-400">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <Square size={16} className="text-primary-500" />
            <span className="text-sm text-secondary-400">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />
            <span className="text-sm text-secondary-400">VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <Square size={16} className="text-secondary-500" />
            <span className="text-sm text-secondary-400">Occupied</span>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-secondary-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Booking Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-secondary-300">
            <span>Selected Seats</span>
            <span>{selectedSeats.join(', ') || 'None'}</span>
          </div>
          <div className="flex justify-between text-secondary-300">
            <span>Regular Price</span>
            <span>${ticketPrice} × {selectedSeats.length}</span>
          </div>
          <div className="pt-4 border-t border-secondary-700">
            <div className="flex justify-between text-white">
              <span className="font-medium">Total</span>
              <span className="font-medium">${selectedSeats.length * ticketPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;