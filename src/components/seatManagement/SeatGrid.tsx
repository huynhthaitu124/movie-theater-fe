import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Seat } from '../../types/cinema';
import { cn } from '../../utils/cn';
import { getSeatColor, getSeatTypeIcon } from '../../utils/seatUtils';

interface SeatGridProps {
  seats: Seat[];
  selectedSeats: Set<string>;
  onSeatClick: (seatId: string) => void;
  onSeatDoubleClick: (seatId: string) => void;
  bulkMode: boolean;
  rows: string[];
  seatsPerRow: number;
}

const SeatButton = memo(({ 
  seat, 
  isSelected, 
  onClick, 
  onDoubleClick,
  index 
}: {
  seat: Seat;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  index: number;
}) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ 
      delay: index * 0.01,
      type: "spring",
      stiffness: 300,
      damping: 20
    }}
    whileHover={{ 
      scale: seat.status === 'available' ? 1.1 : 1,
      y: seat.status === 'available' ? -2 : 0,
      transition: { duration: 0.2 }
    }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    onDoubleClick={onDoubleClick}
    className={cn(
      "relative w-10 h-10 rounded-xl border-2 text-xs font-medium",
      "flex items-center justify-center transition-all duration-200",
      "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400/50",
      getSeatColor(seat.type, seat.status),
      isSelected && "ring-2 ring-primary-400 bg-primary-500/30",
    )}
    title={`${seat.row}${seat.number} - ${seat.type} (${seat.status})`}
  >
    <span className="absolute -top-1 -right-1 text-xs">
      {getSeatTypeIcon(seat.type)}
    </span>
    {seat.number}
  </motion.button>
));

SeatButton.displayName = 'SeatButton';

const SeatGrid: React.FC<SeatGridProps> = ({
  seats,
  selectedSeats,
  onSeatClick,
  onSeatDoubleClick,
  bulkMode,
  rows,
  seatsPerRow
}) => {
  return (
    <div className="grid gap-4 max-w-5xl mx-auto">
      {rows.map((row, rowIndex) => (
        <motion.div 
          key={row}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: rowIndex * 0.05 }}
          className="flex items-center gap-4"
        >
          {/* Row Label */}
          <motion.div 
            className="w-12 h-12 rounded-xl bg-secondary-800/50 border border-secondary-700/50
                     flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-primary-400 font-bold text-lg">{row}</span>
          </motion.div>

          {/* Seats */}
          <div className="grid grid-cols-10 gap-2 flex-1">
            {Array.from({ length: seatsPerRow }).map((_, idx) => {
              const seat = seats.find(s => s.row === row && s.number === idx + 1);
              if (!seat) return <div key={idx} className="w-10 h-10" />;
              
              const seatIndex = rowIndex * seatsPerRow + idx;
              
              return (
                <SeatButton
                  key={seat.id}
                  seat={seat}
                  isSelected={selectedSeats.has(seat.id)}
                  onClick={() => onSeatClick(seat.id)}
                  onDoubleClick={() => onSeatDoubleClick(seat.id)}
                  index={seatIndex}
                />
              );
            })}
          </div>

          {/* Aisle Gap */}
          <div className="w-8" />
        </motion.div>
      ))}
    </div>
  );
};

export default memo(SeatGrid);