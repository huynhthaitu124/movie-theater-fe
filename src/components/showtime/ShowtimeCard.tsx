import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, DollarSign, Users, Calendar, Edit, Trash2 } from 'lucide-react';
import { Showtime, Movie, Cinema } from '../../types';
import { formatTime, formatDate, formatDuration } from '../../utils/timeUtils';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ShowtimeCardProps {
  showtime: Showtime;
  movie: Movie;
  cinema: Cinema;
  onEdit?: (showtime: Showtime) => void;
  onDelete?: (showtime: Showtime) => void;
}

const ShowtimeCard: React.FC<ShowtimeCardProps> = ({
  showtime,
  movie,
  cinema,
  onEdit,
  onDelete
}) => {
  const room = cinema.rooms.find(r => r.id === showtime.roomId);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Sold Out':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  return (
    <Card hover className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-16 h-24 object-cover rounded-lg shadow-sm"
            />
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                {movie.title}
              </h3>
              <p className="text-sm text-secondary-600 mb-2">{movie.genre}</p>
              <div className="flex items-center space-x-4 text-sm text-secondary-600">
                <span className="flex items-center">
                  <Clock size={14} className="mr-1" />
                  {formatDuration(movie.duration)}
                </span>
                <span className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {room?.name}
                </span>
              </div>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(showtime.status)}`}>
            {showtime.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-secondary-50 rounded-lg">
            <Calendar size={20} className="mx-auto mb-1 text-secondary-600" />
            <p className="text-xs text-secondary-600">Date</p>
            <p className="text-sm font-medium text-secondary-900">
              {new Date(showtime.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          
          <div className="text-center p-3 bg-secondary-50 rounded-lg">
            <Clock size={20} className="mx-auto mb-1 text-secondary-600" />
            <p className="text-xs text-secondary-600">Time</p>
            <p className="text-sm font-medium text-secondary-900">
              {formatTime(showtime.startTime)}
            </p>
          </div>
          
          <div className="text-center p-3 bg-secondary-50 rounded-lg">
            <DollarSign size={20} className="mx-auto mb-1 text-secondary-600" />
            <p className="text-xs text-secondary-600">Price</p>
            <p className="text-sm font-medium text-secondary-900">
              ${showtime.price.toFixed(2)}
            </p>
          </div>
          
          <div className="text-center p-3 bg-secondary-50 rounded-lg">
            <Users size={20} className="mx-auto mb-1 text-secondary-600" />
            <p className="text-xs text-secondary-600">Available</p>
            <p className="text-sm font-medium text-secondary-900">
              {showtime.availableSeats}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
          <div className="text-sm text-secondary-600">
            <p>{cinema.name}</p>
            <p>{room?.type} • Capacity: {room?.capacity}</p>
          </div>
          
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(showtime)}
              >
                <Edit size={16} className="mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => onDelete(showtime)}
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ShowtimeCard;