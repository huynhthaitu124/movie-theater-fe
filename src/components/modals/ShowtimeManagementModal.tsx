import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock } from 'lucide-react';
import { Showtime } from '../../types/showtime';
import { mockMovies } from '../../data/mockMovies';
import { mockLocations } from '../../data/mockCinemas';

interface ShowtimeManagementModalProps {
  showtime?: Showtime;
  isOpen: boolean;
  onClose: () => void;
  onSave: (showtimeData: Partial<Showtime>) => void;
}

const ShowtimeManagementModal: React.FC<ShowtimeManagementModalProps> = ({
  showtime,
  isOpen,
  onClose,
  onSave,
}) => {
  const initialFormState = {
    movieId: '',
    cinemaId: '',
    roomId: '',
    startTime: '',
    endTime: '',
    price: 0,
    status: 'scheduled' as 'scheduled' | 'ongoing' | 'completed' | 'cancelled',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Get available rooms based on selected cinema
  const availableRooms = formData.cinemaId 
    ? mockLocations
        .flatMap(l => l.cinemas)
        .find(c => c.id === formData.cinemaId)?.rooms || []
    : [];

  useEffect(() => {
    if (showtime) {
      const startDateTime = new Date(showtime.startTime);
      const endDateTime = new Date(showtime.endTime);

      setFormData({
        movieId: showtime.movieId,
        cinemaId: showtime.cinemaId,
        roomId: showtime.roomId,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        price: showtime.price,
        status: showtime.status,
      });

      setSelectedDate(startDateTime.toISOString().split('T')[0]);
      setSelectedTime(startDateTime.toTimeString().slice(0, 5));
    } else {
      setFormData(initialFormState);
      setSelectedDate('');
      setSelectedTime('');
    }
  }, [showtime, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMovie = mockMovies.find(m => m.id === formData.movieId);
    if (!selectedMovie) return;

    const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const endDateTime = new Date(startDateTime.getTime() + selectedMovie.duration * 60000);

    const showtimeData: Partial<Showtime> = {
      ...formData,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    };

    onSave(showtimeData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-secondary-900 rounded-xl w-full max-w-2xl p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {showtime ? 'Edit Showtime' : 'Add New Showtime'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary-800 rounded-lg"
              >
                <X className="w-5 h-5 text-secondary-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Movie Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-300">
                  Movie
                </label>
                <select
                  value={formData.movieId}
                  onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                  className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                  required
                >
                  <option value="">Select a movie</option>
                  {mockMovies.map(movie => (
                    <option key={movie.id} value={movie.id}>{movie.title}</option>
                  ))}
                </select>
              </div>

              {/* Cinema and Room Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary-300">
                    Cinema
                  </label>
                  <select
                    value={formData.cinemaId}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        cinemaId: e.target.value,
                        roomId: '' // Reset room when cinema changes
                      });
                    }}
                    className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                    required
                  >
                    <option value="">Select a cinema</option>
                    {mockLocations.flatMap(location => 
                      location.cinemas.map(cinema => (
                        <option key={cinema.id} value={cinema.id}>
                          {cinema.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary-300">
                    Room
                  </label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                    required
                    disabled={!formData.cinemaId}
                  >
                    <option value="">Select a room</option>
                    {availableRooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date and Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary-300">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-secondary-800 border border-secondary-700 rounded-lg pl-10 pr-4 py-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-secondary-300">
                    Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-secondary-800 border border-secondary-700 rounded-lg pl-10 pr-4 py-2 text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-300">
                  Price (VND)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                  required
                  min="0"
                  step="1000"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-secondary-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  {showtime ? 'Update Showtime' : 'Add Showtime'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShowtimeManagementModal;