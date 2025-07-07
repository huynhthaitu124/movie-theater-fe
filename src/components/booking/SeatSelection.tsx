import React, { useEffect, useState } from 'react';
import { Square, Star, Heart } from 'lucide-react';
import { Schedule } from '../../types/schedule';
import { seatService } from '../../services/modules/seat.service';

interface SeatSelectionProps {
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  showtime: Schedule | undefined;
  seatTypes: any[];
  scheduleSeats?: any[]; // Seats with booking status
}

const SeatSelection: React.FC<SeatSelectionProps> = ({
  selectedSeats,
  onSeatSelect,
  showtime,
  seatTypes,
  scheduleSeats = [], // Use the scheduleSeats prop with booking status
}) => {
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If scheduleSeats is provided, use it directly (already includes status)
    if (scheduleSeats && scheduleSeats.length > 0) {
      console.log('SeatSelection received scheduleSeats:', scheduleSeats);
      
      // Enhanced debugging for booked seats with case-insensitive status check
      const bookedSeats = scheduleSeats.filter(seat => 
        seat.status && seat.status.toUpperCase() === 'BOOKED'
      );
      
      // Add better logging for seat counts
      const totalSeats = scheduleSeats.length;
      const availableSeats = totalSeats - bookedSeats.length;
      
      console.log(`Total seats in room: ${totalSeats}`);
      console.log(`BOOKED seats count: ${bookedSeats.length}`);
      console.log(`Available seats count: ${availableSeats}`);
      console.log('BOOKED seats details:', bookedSeats);
      
      // Log the first few seats to check their structure
      if (scheduleSeats.length > 0) {
        console.log('First seat example:', scheduleSeats[0]);
        console.log('Seat properties:', Object.keys(scheduleSeats[0]));
      }
      
      setSeats(scheduleSeats);
      return;
    }

    // Otherwise fetch seats from room
    const fetchSeats = async () => {
      if (!showtime?.room?.id) return;
      setLoading(true);
      try {
        const res = await seatService.getByRoomId(showtime.room.id);
        setSeats(res.data);
      } catch (err) {
        setSeats([]);
      }
      setLoading(false);
    };
    fetchSeats();
  }, [showtime?.room?.id, scheduleSeats]);

  // Helper to get price by seatTypeName
  const getSeatPrice = (seatTypeName: string) => {
    const type = seatTypes.find(
      (t: any) =>
        t.name.trim().toLowerCase() === seatTypeName.trim().toLowerCase()
    );
    return type ? type.price : 0;
  };

  // Helper to get seat label by seatId
  const getSeatLabel = (seatId: string) => {  
    const seat = seats.find(s => s.seatId === seatId);
    return seat ? `${seat.row}${seat.number}` : seatId;
  };

  // Calculate total price
  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const seat = seats.find(s => s.seatId === seatId);
    return sum + (seat ? getSeatPrice(seat.seatTypeName) : 0);
  }, 0);

  // Group seats by row
  const seatsByRow = seats.reduce((acc: Record<string, any[]>, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  // Sort rows alphabetically and seats by number within each row
  const sortedRows = Object.keys(seatsByRow).sort();
  sortedRows.forEach(row => {
    seatsByRow[row].sort((a, b) => parseInt(a.number) - parseInt(b.number));
  });

  // Find the max seat number in all rows
  const maxSeatNumber = Math.max(
    ...Object.values(seatsByRow).flat().map(seat => parseInt(seat.number))
  );

  // Always show all rows/columns based on room config
  const maxRow = showtime?.room?.rows || 10; // Default to 10 if not specified 
  const maxCol = showtime?.room?.columns || 12; // Default to 12 if not specified
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const rows = alphabet.slice(0, maxRow);
  const cols = Array.from({ length: maxCol }, (_, i) => (i + 1).toString());

  // Helper to find seat by row and number
  const findSeat = (row: string, number: string) => {
    return seats.find(seat => seat.row === row && seat.number === number);
  };

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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.seatId === seatId);
    if (!seat) return;
    
    // Clear any previous error message
    setErrorMessage(null);
    
    // Handle case insensitive status check
    const isBooked = seat.status?.toUpperCase() === 'BOOKED';
    
    // Don't allow selection if seat is booked
    if (isBooked) {
      console.log(`Seat ${seatId} (${seat.row}${seat.number}) is already booked with status: ${seat.status}`);
      setErrorMessage(`Seat ${seat.row}${seat.number} is already booked by someone else`);
      return;
    }

    // If seat is linked, also select/deselect the linked seat
    if (seat.islinked && seat.linkedto) {
      const linkedSeatId = seat.linkedto;
      if (selectedSeats.includes(seatId)) {
        // Deselect both
        onSeatSelect(seatId);
        if (selectedSeats.includes(linkedSeatId)) {
          onSeatSelect(linkedSeatId);
        }
      } else {
        // Select both
        onSeatSelect(seatId);
        if (!selectedSeats.includes(linkedSeatId)) {
          onSeatSelect(linkedSeatId);
        }
      }
    } else {
      // Normal seat select/deselect
      onSeatSelect(seatId);
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
        
        {/* Error Message */}
        {errorMessage && (
          <div className="bg-error-500/20 border border-error-500/50 rounded-lg p-3 mb-6 text-center">
            <p className="text-error-500 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Seats */}
        <div className="seat-map">
          <div className="space-y-4 w-full">
            {rows.map(row => (
              <div key={row} className="flex items-center gap-4 justify-center">
                {/* Row Label */}
                <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-300 font-bold text-sm flex-shrink-0">
                  {row}
                </div>
                {/* Seats in Row */}
                <div className="flex gap-2 justify-center">
                  {cols.map((number) => {
                    const seat = findSeat(row, number);
                    if (!seat) {
                      // Show empty spot (no seat)
                      return (
                        <div
                          key={`${row}-${number}`}
                          className="w-12 h-12 rounded-lg border-2 border-slate-600/50 bg-slate-700/30 text-slate-500 flex items-center justify-center text-xs font-bold"
                          style={{ opacity: 0.3 }}
                        >
                          ·
                        </div>
                      );
                    }
                    const isSelected = selectedSeats.includes(seat.seatId);
                    // Enhanced debugging for seat status
                    if (seat.row === "A" || seat.row === "B") {
                      // console.log(`Rendering seat ${seat.row}${seat.number} with status: ${seat.status}`);
                    }
                    
                    // Check for booked status with case insensitivity
                    const isBooked = seat.status?.toUpperCase() === 'BOOKED';
                    const isDisabled = isBooked || !seat.isactive;
                    let colorClass = '';
                    
                    if (isBooked) {
                      // Make booked seats stand out more with stronger red color
                      colorClass = 'bg-error-600 border-error-500 text-white cursor-not-allowed font-bold';
                    } else if (isDisabled) {
                      colorClass = 'bg-slate-500/20 border-slate-500/50 text-slate-400 cursor-not-allowed';
                    } else if (isSelected) {
                      colorClass = 'bg-primary-500 text-white border-primary-500';
                    } else if (seat.seatTypeName === 'Ghế VIP') {
                      colorClass = 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
                    } else if (seat.seatTypeName === 'Ghế Đôi') {
                      colorClass = 'bg-pink-500/20 border-pink-500/50 text-pink-400';
                    } else {
                      colorClass = 'bg-primary-500/20 border-primary-500/50 text-primary-400';
                    }
                    return (
                      <button
                        key={seat.seatId}
                        disabled={isDisabled}
                        onClick={() => handleSeatClick(seat.seatId)}
                        className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 ${colorClass}`}
                        title={`${seat.seatTypeName} - ${seat.row}${seat.number} (${seat.status})`}
                      >
                        {isBooked ? <span>✕</span> : <span>{seat.row}{seat.number}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-secondary-700">
          {/* Seat Availability Summary */}
          <div className="mb-4 bg-secondary-700/30 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-secondary-200 font-medium">Seat Availability</span>
              <span className="text-primary-400 font-medium">
                {seats.length - seats.filter(s => s.status?.toUpperCase() === 'BOOKED').length}/{seats.length} Available
              </span>
            </div>
            <div className="w-full h-2 bg-secondary-600 mt-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500"
                style={{ 
                  width: `${seats.length ? ((seats.length - seats.filter(s => s.status?.toUpperCase() === 'BOOKED').length) / seats.length) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
          
          {/* Seat Types Legend */}
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-500/20 border-2 border-primary-500/50 rounded-lg"></div>
              <span className="text-secondary-400 text-sm">Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-lg"></div>
              <span className="text-secondary-400 text-sm">VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-pink-500/20 border-2 border-pink-500/50 rounded-lg"></div>
              <span className="text-secondary-400 text-sm">Couple</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-error-500/70 border-2 border-error-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">✕</span>
              </div>
              <span className="text-secondary-400 text-sm">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-500 border-2 border-primary-500 rounded-lg"></div>
              <span className="text-secondary-400 text-sm">Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-secondary-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Booking Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-secondary-300">
            <span>Selected Seats</span>
            <span>
              {selectedSeats.length > 0
                ? selectedSeats.map(getSeatLabel).join(', ')
                : 'None'}
            </span>
          </div>
          <div className="flex justify-between text-secondary-300">
            <span>Price</span>
            <span>
              {selectedSeats.length > 0
                ? selectedSeats
                    .map(seatId => {
                      const seat = seats.find(s => s.seatId === seatId);
                      const price = seat ? getSeatPrice(seat.seatTypeName) : 0;
                      return `${getSeatLabel(seatId)}: ${new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(price)}`;
                    })
                    .join(', ')
                : '0 đ'}
            </span>
          </div>
          <div className="pt-4 border-t border-secondary-700">
            <div className="flex justify-between text-white">
              <span className="font-medium">Total</span>
              <span className="font-medium">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(totalPrice)}
              </span>
            </div>
          </div>
          {/* Total and Available Seats Count */}
          <div className="pt-4 border-t border-secondary-700">
            <div className="flex justify-between text-secondary-300">
              <span>Total Seats</span>
              <span className="font-medium">
                {seats.length}
              </span>
            </div>
            <div className="flex justify-between text-secondary-300">
              <span>Available Seats</span>
              <span className="font-medium">
                {seats.filter(seat => seat.status?.toUpperCase() !== 'BOOKED').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;