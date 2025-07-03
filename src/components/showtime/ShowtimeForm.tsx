import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, MapPin, Film, Monitor } from 'lucide-react';
import { Movie, Cinema, CinemaRoom, ShowtimeFormData } from '../../types';
import { CinemaRoom, ShowtimeFormData } from '../../types/showtime';
import { addMinutesToTime, formatDuration } from '../../utils/timeUtils';
import Button from '../ui/Button';

interface ShowtimeFormProps {
  movies: Movie[];
  cinemas: Cinema[];
  onSubmit: (data: ShowtimeFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ShowtimeForm: React.FC<ShowtimeFormProps> = ({
  movies,
  cinemas,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<ShowtimeFormData>({
    movieId: '',
    roomId: '',
    cinemaId: '',
    date: '',
    startTime: '',
    price: 0
  });

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedCinema, setCinema] = useState<Cinema | null>(null);
  const [availableRooms, setAvailableRooms] = useState<CinemaRoom[]>([]);
  const [endTime, setEndTime] = useState<string>('');

  useEffect(() => {
    if (formData.cinemaId) {
      const cinema = cinemas.find(c => c.id === formData.cinemaId);
      setCinema(cinema || null);
      setAvailableRooms(cinema?.rooms || []);
      setFormData(prev => ({ ...prev, roomId: '' }));
    }
  }, [formData.cinemaId, cinemas]);

  useEffect(() => {
    if (formData.movieId) {
      const movie = movies.find(m => m.id === formData.movieId);
      setSelectedMovie(movie || null);
    }
  }, [formData.movieId, movies]);

  useEffect(() => {
    if (selectedMovie && formData.startTime) {
      const calculatedEndTime = addMinutesToTime(formData.startTime, selectedMovie.duration);
      setEndTime(calculatedEndTime);
    }
  }, [selectedMovie, formData.startTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof ShowtimeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      {/* Movie Selection */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-secondary-700">
          <Film size={16} className="mr-2" />
          Select Movie
        </label>
        <select
          value={formData.movieId}
          onChange={(e) => handleInputChange('movieId', e.target.value)}
          className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          required
        >
          <option value="">Choose a movie...</option>
          {movies.map(movie => (
            <option key={movie.id} value={movie.id}>
              {movie.title} ({formatDuration(movie.duration)})
            </option>
          ))}
        </select>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-primary-50 rounded-lg border border-primary-200"
          >
            <div className="flex items-start space-x-4">
              <img
                src={selectedMovie.poster}
                alt={selectedMovie.title}
                className="w-16 h-24 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-medium text-secondary-900">{selectedMovie.title}</h4>
                <p className="text-sm text-secondary-600">{selectedMovie.genre}</p>
                <p className="text-sm text-secondary-600">Duration: {formatDuration(selectedMovie.duration)}</p>
                <p className="text-sm text-secondary-600">Rating: {selectedMovie.rating}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Cinema Selection */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-secondary-700">
          <MapPin size={16} className="mr-2" />
          Select Cinema
        </label>
        <select
          value={formData.cinemaId}
          onChange={(e) => handleInputChange('cinemaId', e.target.value)}
          className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          required
        >
          <option value="">Choose a cinema...</option>
          {cinemas.map(cinema => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name} - {cinema.location}
            </option>
          ))}
        </select>
      </div>

      {/* Room Selection */}
      {availableRooms.length > 0 && (
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-secondary-700">
            <Monitor size={16} className="mr-2" />
            Select Theater Room
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableRooms.map(room => (
              <motion.label
                key={room.id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.roomId === room.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              >
                <input
                  type="radio"
                  name="roomId"
                  value={room.id}
                  checked={formData.roomId === room.id}
                  onChange={(e) => handleInputChange('roomId', e.target.value)}
                  className="sr-only"
                />
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-secondary-900">{room.name}</h4>
                    <p className="text-sm text-secondary-600">{room.type}</p>
                    <p className="text-sm text-secondary-600">Capacity: {room.capacity}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    room.type === 'IMAX' ? 'bg-blue-100 text-blue-800' :
                    room.type === 'VIP' ? 'bg-purple-100 text-purple-800' :
                    room.type === '4DX' ? 'bg-green-100 text-green-800' :
                    'bg-secondary-100 text-secondary-800'
                  }`}>
                    {room.type}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {room.features.slice(0, 2).map((feature, index) => (
                      <span key={index} className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded">
                        {feature}
                      </span>
                    ))}
                    {room.features.length > 2 && (
                      <span className="text-xs text-secondary-500">+{room.features.length - 2} more</span>
                    )}
                  </div>
                </div>
              </motion.label>
            ))}
          </div>
        </div>
      )}

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-secondary-700">
            <Calendar size={16} className="mr-2" />
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-secondary-700">
            <Clock size={16} className="mr-2" />
            Start Time
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            required
          />
          {endTime && (
            <p className="text-sm text-secondary-600">
              End time: {endTime}
            </p>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-secondary-700">
          <DollarSign size={16} className="mr-2" />
          Ticket Price
        </label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
          placeholder="0.00"
          className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          required
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={!formData.movieId || !formData.roomId || !formData.date || !formData.startTime || !formData.price}
        >
          Create Showtime
        </Button>
      </div>
    </motion.form>
  );
};

export default ShowtimeForm;