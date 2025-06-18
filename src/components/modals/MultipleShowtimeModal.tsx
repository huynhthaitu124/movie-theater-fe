import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Calendar, Clock, Info, CalendarRange } from 'lucide-react';
import { Movie } from '../../types/movie';
import { Cinema, Room } from '../../types/cinema';
import { mockLocations } from '../../data/mockCinemas';

interface MultipleShowtimeModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  onSave: (showtimeData: any) => void;
}

interface ShowtimeEntry {
  cinemaId: string;
  roomId: string;
  date: string;
  times: string[];
  price: number;
}

const MultipleShowtimeModal: React.FC<MultipleShowtimeModalProps> = ({
  movie,
  isOpen,
  onClose,
  onSave,
}) => {
  const [entries, setEntries] = useState<ShowtimeEntry[]>([]);
  
  const addEntry = () => {
    setEntries([...entries, {
      cinemaId: '',
      roomId: '',
      date: '',
      times: [],
      price: 75000
    }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, data: Partial<ShowtimeEntry>) => {
    setEntries(entries.map((entry, i) => 
      i === index ? { ...entry, ...data } : entry
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(entries);
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
            className="bg-secondary-900 rounded-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Add Multiple Showtimes</h2>
                <p className="text-sm text-secondary-400 mt-1">
                  Movie: {movie.title} ({movie.duration} minutes)
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-secondary-400" />
              </button>
            </div>

            {/* Info Box */}
            <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4 mb-6 flex items-start">
              <Info size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary-300 ml-3">
                You can add multiple showtime entries. Each entry allows you to set up multiple show times for a specific cinema, room, and date.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {entries.map((entry, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-secondary-800/50 backdrop-blur-sm border border-secondary-700 rounded-lg p-6 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CalendarRange className="w-5 h-5 text-primary-500 mr-2" />
                      <h3 className="text-lg font-medium text-white">Showtime Entry #{index + 1}</h3>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeEntry(index)}
                      className="p-2 hover:bg-error-500/20 rounded-lg group transition-colors"
                    >
                      <Trash2 size={18} className="text-error-500 transition-transform group-hover:scale-110" />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Cinema Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-secondary-300">
                        Cinema
                      </label>
                      <select
                        value={entry.cinemaId}
                        onChange={(e) => updateEntry(index, {
                          cinemaId: e.target.value,
                          roomId: '' // Reset room when cinema changes
                        })}
                        className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                        required
                      >
                        <option value="">Select a cinema</option>
                        {mockLocations.flatMap(location => 
                          location.cinemas.map(cinema => (
                            <option key={cinema.id} value={cinema.id}>
                              {cinema.name}
                            </option>
                          )),
                        )}
                      </select>
                    </div>

                    {/* Room Selection */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-secondary-300">
                        Room
                      </label>
                      <select
                        value={entry.roomId}
                        onChange={(e) => updateEntry(index, { roomId: e.target.value })}
                        className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                        required
                        disabled={!entry.cinemaId}
                      >
                        <option value="">Select a room</option>
                        {entry.cinemaId && mockLocations
                          .flatMap(l => l.cinemas)
                          .find(c => c.id === entry.cinemaId)
                          ?.rooms.map(room => (
                            <option key={room.id} value={room.id}>
                              {room.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary-300">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="date"
                        value={entry.date}
                        onChange={(e) => updateEntry(index, { date: e.target.value })}
                        className="w-full bg-secondary-800 border border-secondary-700 rounded-lg pl-10 pr-4 py-2 text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Enhanced Time Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary-300">
                      Show Times
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {entry.times.map((time, timeIndex) => (
                        <motion.div
                          key={timeIndex}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2 bg-secondary-700/50 rounded-lg p-1"
                        >
                          <Clock size={14} className="text-primary-400" />
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => {
                              const newTimes = [...entry.times];
                              newTimes[timeIndex] = e.target.value;
                              updateEntry(index, { times: newTimes });
                            }}
                            className="bg-transparent border-none text-white text-sm focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newTimes = entry.times.filter((_, i) => i !== timeIndex);
                              updateEntry(index, { times: newTimes });
                            }}
                            className="p-1 hover:bg-error-500/20 rounded-lg transition-colors"
                          >
                            <X size={14} className="text-error-500" />
                          </button>
                        </motion.div>
                      ))}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          updateEntry(index, { times: [...entry.times, ''] });
                        }}
                        className="px-3 py-1 bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 rounded-lg text-sm flex items-center gap-1 transition-colors"
                      >
                        <Plus size={14} />
                        Add Time
                      </motion.button>
                    </div>
                  </div>

                  {/* Enhanced Price Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary-300">
                      Price (VND)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={entry.price}
                        onChange={(e) => updateEntry(index, { price: Number(e.target.value) })}
                        className="w-full bg-secondary-700/50 border border-secondary-600 rounded-lg px-4 py-2 text-white"
                        required
                        min="0"
                        step="1000"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-400 text-sm">
                        VND
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Footer Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-secondary-700">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addEntry}
                  className="px-4 py-2 bg-secondary-700 text-white rounded-lg hover:bg-secondary-600 flex items-center gap-2 transition-colors"
                >
                  <Plus size={18} />
                  Add Another Entry
                </motion.button>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-secondary-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Save All Showtimes
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MultipleShowtimeModal;