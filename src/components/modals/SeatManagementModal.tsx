import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Settings2, X, Save, RotateCcw, Copy, 
  Maximize2, Minimize2, Grid3X3, MousePointer2
} from 'lucide-react';
import { Room, Seat } from '../../types/cinema';
import { cn } from '../../utils/cn';
import { createDefaultSeats, generateSeatId } from '../../utils/seatUtils';
import SeatGrid from '../seatManagement/SeatGrid';
import SeatControls from '../seatManagement/SeatControls';
import SeatLegend from '../seatManagement/SeatLegend';

interface SeatManagementModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onSave: (seats: Seat[]) => void;
}

const SeatManagementModal: React.FC<SeatManagementModalProps> = ({
  room,
  isOpen,
  onClose,
  onSave,
}) => {
  const [seats, setSeats] = useState<Seat[]>(room.seats);
  const [selectedType, setSelectedType] = useState<Seat['type']>('standard');
  const [selectedStatus, setSelectedStatus] = useState<Seat['status']>('available');
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rows, setRows] = useState<string[]>(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  const [seatsPerRow, setSeatsPerRow] = useState(10);

  // Performance optimization: memoize expensive calculations
  const seatStats = useMemo(() => {
    const stats = {
      total: seats.length,
      available: 0,
      maintenance: 0,
      standard: 0,
      vip: 0,
      couple: 0
    };

    seats.forEach(seat => {
      stats[seat.status]++;
      stats[seat.type]++;
    });

    return stats;
  }, [seats]);

  const handleSeatClick = useCallback((seatId: string) => {
    if (bulkMode) {
      const seat = seats.find(s => s.id === seatId);
      if (seat) {
        // In bulk mode, select all seats in the same row
        const rowSeats = seats.filter(s => s.row === seat.row).map(s => s.id);
        setSelectedSeats(prev => {
          const newSet = new Set(prev);
          const allSelected = rowSeats.every(id => newSet.has(id));
          
          if (allSelected) {
            rowSeats.forEach(id => newSet.delete(id));
          } else {
            rowSeats.forEach(id => newSet.add(id));
          }
          
          return newSet;
        });
      }
    } else {
      setSelectedSeats(prev => {
        const newSet = new Set(prev);
        if (newSet.has(seatId)) {
          newSet.delete(seatId);
        } else {
          newSet.add(seatId);
        }
        return newSet;
      });
    }
  }, [bulkMode, seats]);

  const applyToSelected = useCallback((
    changes: { type?: Seat['type']; status?: Seat['status'] }
  ) => {
    if (selectedSeats.size === 0) return;
    
    setSeats(prev => prev.map(seat => 
      selectedSeats.has(seat.id)
        ? { ...seat, ...changes }
        : seat
    ));
  }, [selectedSeats]);

  const handleTypeChange = useCallback((newType: Seat['type']) => {
    setSelectedType(newType);
    applyToSelected({ type: newType });
  }, [applyToSelected]);

  const handleStatusChange = useCallback((newStatus: Seat['status']) => {
    setSelectedStatus(newStatus);
    applyToSelected({ status: newStatus });
  }, [applyToSelected]);

  const handleSeatDoubleClick = useCallback((seatId: string) => {
    setSeats(prev => prev.map(seat => 
      seat.id === seatId 
        ? { 
            ...seat, 
            type: selectedType,
            status: seat.status // Keep existing status
          }
        : seat
    ));
  }, [selectedType]);

  const deleteSelected = useCallback(() => {
    if (selectedSeats.size === 0) return;
    
    setSeats(prev => prev.filter(seat => !selectedSeats.has(seat.id)));
    setSelectedSeats(new Set());
  }, [selectedSeats]);

  const addRow = useCallback(() => {
    const nextRowLetter = String.fromCharCode(65 + rows.length);
    const newRows = [...rows, nextRowLetter];
    setRows(newRows);
    
    const newSeats: Seat[] = [];
    for (let i = 1; i <= seatsPerRow; i++) {
      newSeats.push({
        id: generateSeatId(nextRowLetter, i),
        row: nextRowLetter,
        number: i,
        type: 'standard' as const,
        status: 'available' as const,
        price: 12
      });
    }
    
    setSeats(prev => [...prev, ...newSeats]);
  }, [rows, seatsPerRow]);

  const removeRow = useCallback(() => {
    if (rows.length <= 1) return;
    
    const lastRow = rows[rows.length - 1];
    const newRows = rows.slice(0, -1);
    setRows(newRows);
    
    setSeats(prev => prev.filter(seat => seat.row !== lastRow));
    setSelectedSeats(prev => {
      const newSet = new Set(prev);
      seats.forEach(seat => {
        if (seat.row === lastRow) {
          newSet.delete(seat.id);
        }
      });
      return newSet;
    });
  }, [rows, seats]);

  const resetSeats = useCallback(() => {
    const defaultSeats = createDefaultSeats(rows, seatsPerRow);
    setSeats(defaultSeats);
    setSelectedSeats(new Set());
  }, [rows, seatsPerRow]);

  const duplicateLayout = useCallback(() => {
    // Create a copy of current layout for quick templates
    navigator.clipboard.writeText(JSON.stringify(seats));
  }, [seats]);

  // Add column handler
  const addColumn = useCallback(() => {
    setSeatsPerRow(prev => prev + 1);
    
    // Add new seat to each row
    setSeats(prev => {
      const newSeats = [...prev];
      rows.forEach(row => {
        newSeats.push({
          id: generateSeatId(row, seatsPerRow + 1),
          row: row,
          number: seatsPerRow + 1,
          type: 'standard',
          status: 'available',
          price: 12
        });
      });
      return newSeats;
    });
  }, [rows, seatsPerRow]);

  // Remove column handler
  const removeColumn = useCallback(() => {
    if (seatsPerRow <= 1) return;
    
    setSeatsPerRow(prev => prev - 1);
    
    // Remove last seat from each row
    setSeats(prev => {
      return prev.filter(seat => seat.number !== seatsPerRow);
    });
    
    // Clear selection for removed seats
    setSelectedSeats(prev => {
      const newSet = new Set(prev);
      seats.forEach(seat => {
        if (seat.number === seatsPerRow) {
          newSet.delete(seat.id);
        }
      });
      return newSet;
    });
  }, [seatsPerRow, seats]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm",
            isFullscreen && "p-0"
          )}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={cn(
              "relative bg-secondary-900/95 backdrop-blur rounded-3xl flex flex-col overflow-hidden",
              "border border-secondary-800/50 shadow-2xl",
              isFullscreen 
                ? "w-full h-full rounded-none" 
                : "w-[95vw] max-w-7xl h-[90vh]"
            )}
          >
            {/* Enhanced Header */}
            <div className="sticky top-0 z-10 bg-secondary-900/95 backdrop-blur-sm 
                          border-b border-secondary-800/50 shadow-lg">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{room.name}</h2>
                    <p className="text-sm text-secondary-400">
                      {seatStats.total} seats • {seatStats.available} available
                    </p>
                  </div>
                  
                  <div className="h-12 w-px bg-secondary-800/50" />
                  
                  {/* Mode Controls */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setBulkMode(!bulkMode)}
                      className={cn(
                        "px-4 py-2 rounded-xl font-medium transition-all duration-200",
                        "flex items-center gap-2 text-sm",
                        bulkMode 
                          ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" 
                          : "bg-secondary-800/50 text-secondary-400 hover:bg-secondary-700/50"
                      )}
                    >
                      {bulkMode ? <Grid3X3 className="w-4 h-4" /> : <MousePointer2 className="w-4 h-4" />}
                      {bulkMode ? 'Row Select' : 'Single Select'}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-2 rounded-xl bg-secondary-800/50 text-secondary-400 
                               hover:bg-secondary-700/50 transition-all duration-200"
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={duplicateLayout}
                    className="p-2 rounded-xl bg-secondary-800/50 text-secondary-400 
                             hover:bg-secondary-700/50 transition-all duration-200"
                    title="Copy layout to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetSeats}
                    className="p-2 rounded-xl bg-secondary-800/50 text-secondary-400 
                             hover:bg-secondary-700/50 transition-all duration-200"
                    title="Reset to default layout"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                  
                  <button 
                    onClick={onClose} 
                    className="p-2 hover:bg-secondary-800/50 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-secondary-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 min-h-0">
              {/* Seats Section */}
              <div className="flex-1 p-6 overflow-auto">
                {/* Screen */}
                <motion.div 
                  className="relative mb-16"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Monitor className="w-40 h-10 mx-auto text-primary-500/40 mb-4" />
                  <div className="w-3/4 h-2 mx-auto bg-gradient-to-r from-primary-500/0 
                                via-primary-500/30 to-primary-500/0 rounded-full shadow-lg" />
                  <p className="text-center text-secondary-400 text-sm mt-2 font-medium">SCREEN</p>
                </motion.div>

                {/* Seat Grid */}
                <SeatGrid
                  seats={seats}
                  selectedSeats={selectedSeats}
                  onSeatClick={handleSeatClick}
                  onSeatDoubleClick={handleSeatDoubleClick}
                  bulkMode={bulkMode}
                  rows={rows}
                  seatsPerRow={seatsPerRow}
                />

                {/* Legend */}
                <div className="mt-12">
                  <SeatLegend />
                </div>
              </div>

              {/* Controls Panel */}
              <SeatControls
                selectedType={selectedType}
                selectedStatus={selectedStatus}
                onTypeChange={handleTypeChange}    // Use new handler
                onStatusChange={handleStatusChange} // Use new handler
                selectedSeatsCount={selectedSeats.size}
                onAddRow={addRow}
                onRemoveRow={removeRow}
                onDeleteSelected={deleteSelected}
                onAddColumn={addColumn}
                onRemoveColumn={removeColumn}
                canRemoveRow={rows.length > 1}
                canRemoveColumn={seatsPerRow > 1}
              />
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 p-6 bg-secondary-900/95 backdrop-blur-sm 
                          border-t border-secondary-800/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-secondary-400">
                  {selectedSeats.size > 0 && (
                    <span>
                      {selectedSeats.size} seat{selectedSeats.size !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSave(seats)}
                  className="px-8 py-3 bg-primary-500 text-white rounded-xl
                           hover:bg-primary-600 font-medium shadow-lg shadow-primary-500/20
                           transition-all duration-200 flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SeatManagementModal;