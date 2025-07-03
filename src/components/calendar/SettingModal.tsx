import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Monitor, Eye, EyeOff, Users, Calendar as CalendarIcon } from 'lucide-react';
import { CinemaRoom } from '../../types/showtime';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { roomService } from '../../services/modules/room.service'; // Import your room service

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRooms: string[];
  onRoomToggle: (roomId: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  daysToShow: number;
  onDaysChange: (days: number) => void;
  cinemaName: string;
  cinemaId: string; // <-- use cinemaId
  cinemaLocation: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedRooms,
  onRoomToggle,
  onSelectAll,
  onSelectNone,
  daysToShow,
  onDaysChange,
  cinemaName,
  cinemaLocation
}) => {
  const [rooms, setRooms] = useState<CinemaRoom[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cinemaName || !isOpen) return;
    setLoading(true);
    roomService.getAll()
      .then(res => {
        const filtered = res.data.filter((room: any) => room.cinemaname === cinemaName);
        const mappedRooms: CinemaRoom[] = filtered.map((room: any) => ({
          id: room.roomId, // use roomId from backend
          number: room.roomnumber, // add room number
          type: room.roomtype, // use roomtype from backend
          features: room.features || [],
          capacity: room.capacity,
        }));
        setRooms(mappedRooms);
      })
      .finally(() => setLoading(false));
  }, [cinemaName, isOpen]);

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'IMAX':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'VIP':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case '4DX':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-secondary-600/50 text-secondary-300 border-secondary-500/30';
    }
  };

  const dayOptions = [
    { value: 1, label: 'Today' },
    { value: 3, label: '3 Days' },
    { value: 5, label: '5 Days' },
    { value: 7, label: '1 Week' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Settings" size="lg">
      <div className="space-y-8 bg-secondary-900 text-white">
        {/* Cinema Info */}
        <div className="bg-primary-500/10 rounded-lg p-6 border border-primary-500/20">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-primary-500/20 rounded-xl">
              <CalendarIcon className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{cinemaName}</h3>
              <p className="text-primary-300">{cinemaLocation}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-secondary-800/50 rounded-lg p-3 border border-secondary-700">
              <div className="text-2xl font-bold text-white">{rooms.length}</div>
              <div className="text-sm text-secondary-300">Total Theaters</div>
            </div>
            <div className="bg-secondary-800/50 rounded-lg p-3 border border-secondary-700">
              <div className="text-2xl font-bold text-primary-400">{selectedRooms.length}</div>
              <div className="text-sm text-secondary-300">Selected</div>
            </div>
            <div className="bg-secondary-800/50 rounded-lg p-3 border border-secondary-700">
              <div className="text-2xl font-bold text-green-400">{daysToShow}</div>
              <div className="text-sm text-secondary-300">Days Shown</div>
            </div>
          </div>
        </div>

        {/* View Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <CalendarIcon size={20} className="mr-2 text-primary-400" />
            Calendar View
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {dayOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onDaysChange(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  daysToShow === option.value
                    ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                    : 'border-secondary-600 hover:border-secondary-500 text-secondary-300 hover:text-white bg-secondary-800/50'
                }`}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs text-secondary-400 mt-1">
                  {option.value === 1 ? 'Single day' : `${option.value} days`}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Theater Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Monitor size={20} className="mr-2 text-primary-400" />
              Theater Selection
            </h3>
            <div className="flex space-x-2">
              <Button size="sm" variant="ghost" onClick={onSelectAll}>
                Select All
              </Button>
              <Button size="sm" variant="ghost" onClick={onSelectNone}>
                Clear All
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-secondary-300 bg-secondary-800/50 rounded-lg p-3 border border-secondary-700">
            💡 Select theaters to display in the schedule. Fewer theaters = better visibility
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-secondary-800 scrollbar-thumb-secondary-600">
            {rooms.map(room => {
              const isSelected = selectedRooms.includes(room.id);
              
              return (
                <motion.button
                  key={room.id}
                  onClick={() => onRoomToggle(room.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500/20 shadow-md shadow-primary-500/10'
                      : 'border-secondary-600 hover:border-secondary-500 hover:bg-secondary-800/50 bg-secondary-800/30'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {isSelected ? (
                        <Eye size={16} className="text-primary-400 flex-shrink-0" />
                      ) : (
                        <EyeOff size={16} className="text-secondary-500 flex-shrink-0" />
                      )}
                      <Monitor size={16} className="text-secondary-400 flex-shrink-0" />
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full border font-medium ${getRoomTypeColor(room.type)}`}>
                      {room.type}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-white">
                      Room {room.number}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm text-secondary-300">
                        <Users size={12} />
                        <span>{room.capacity} seats</span>
                      </div>
                      {isSelected && (
                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-700">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            Apply Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;