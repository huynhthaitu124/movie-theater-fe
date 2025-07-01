import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Users, MapPin } from 'lucide-react';
import {  Movie} from '../../types';
import { CalendarEvent, CinemaRoom } from '../../types/showtime';
import { formatDuration } from '../../utils/timeUtils';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  movie: Movie | null;
  room: CinemaRoom | null;
  onUpdate: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onDelete: (eventId: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  movie,
  room,
  onUpdate,
  onDelete
}) => {
  const [price, setPrice] = useState(event?.price || 12.99);

  if (!event || !movie || !room) return null;

  const handleSave = () => {
    onUpdate(event.id, { price });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this showtime?')) {
      onDelete(event.id);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Showtime Details" size="md">
      <div className="space-y-6">
        {/* Movie Info */}
        <div className="flex items-start space-x-4">
          <img
            src={movie.image}
            alt={movie.movieName}
            className="w-20 h-30 object-cover rounded-lg shadow-sm"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-secondary-900 mb-1">
              {movie.movieName}
            </h3>
            <p className="text-sm text-secondary-600 mb-2">{movie.movieTypes}</p>
            <div className="flex items-center space-x-4 text-sm text-secondary-600">
              <span className="flex items-center">
                <Clock size={14} className="mr-1" />
                {formatDuration(movie.duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock size={16} className="mr-2 text-secondary-600" />
              <span className="text-sm font-medium text-secondary-700">Time</span>
            </div>
            <p className="text-sm text-secondary-900">
              {event.startTime} - {event.endTime}
            </p>
            <p className="text-xs text-secondary-600 mt-1">
              {new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="p-4 bg-secondary-50 rounded-lg">
            <div className="flex items-center mb-2">
              <MapPin size={16} className="mr-2 text-secondary-600" />
              <span className="text-sm font-medium text-secondary-700">Room</span>
            </div>
            <p className="text-sm text-secondary-900">{room.name}</p>
            <p className="text-xs text-secondary-600">{room.type}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-secondary-700">
            <DollarSign size={16} className="mr-2" />
            Ticket Price
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Room Info */}
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-900">Room Details</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              room.type === 'IMAX' ? 'bg-blue-100 text-blue-800' :
              room.type === 'VIP' ? 'bg-purple-100 text-purple-800' :
              room.type === '4DX' ? 'bg-green-100 text-green-800' :
              'bg-secondary-100 text-secondary-800'
            }`}>
              {room.type}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-primary-700">
            <span className="flex items-center">
              <Users size={14} className="mr-1" />
              {room.capacity} seats
            </span>
          </div>
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {room.features.map((feature, index) => (
                <span key={index} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-secondary-200">
          <Button variant="danger" onClick={handleDelete}>
            Delete Showtime
          </Button>
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EventModal;