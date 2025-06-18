import React from 'react';
import { MapPin, Star, Clock, Users } from 'lucide-react';
import { Cinema } from '../../types/cinema';
import { Showtime } from '../../types/showtime';

interface CinemaCardProps {
  cinema: Cinema;
  showtimes: Showtime[];
  selectedCinema: string;
  selectedShowtime: string;
  onCinemaSelect: (cinemaId: string) => void;
  onShowtimeSelect: (showtimeId: string) => void;
}

const CinemaCard: React.FC<CinemaCardProps> = ({
  cinema,
  showtimes,
  selectedCinema,
  selectedShowtime,
  onCinemaSelect,
  onShowtimeSelect
}) => {
  const isSelected = selectedCinema === cinema.id;
  const cinemaShowtimes = showtimes.filter(st => st.cinemaId === cinema.id);

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case 'IMAX': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case '4DX': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Dolby Atmos': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300 overflow-hidden
      ${isSelected ? 'ring-2 ring-blue-500 shadow-blue-500/20' : 'hover:shadow-xl'}
    `}>
      {/* Cinema Header */}
      <div className="relative">
        <img 
          src={cinema.image} 
          alt={cinema.name}
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div>
            </div>
            <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
              <Star size={14} className="text-yellow-400 mr-1" />
              <span className="text-white text-sm font-medium">{cinema.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cinema Details */}
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{cinema.address}</p>
        
        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {cinema.facilities.map((amenity, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            >
              {amenity}
            </span>
          ))}
        </div>

        {/* Showtimes */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">Available Showtimes</h4>
          <div className="grid grid-cols-1 gap-2">
            {cinemaShowtimes.map((showtime) => (
              <button
                key={showtime.id}
                onClick={() => {
                  onCinemaSelect(cinema.id);
                  onShowtimeSelect(showtime.id);
                }}
                className={`
                  p-3 rounded-lg border transition-all duration-200 text-left
                  ${selectedShowtime === showtime.id 
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Clock size={16} className="text-gray-500" />
                    <span className="font-medium">{showtime.startTime}</span>
                    <span className={`px-2 py-1 text-xs rounded border ${getFormatBadgeColor(showtime.format)}`}>
                      {showtime.format}
                    </span>
                  </div>
                  <span className="font-bold text-lg">${showtime.price}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">không biết để gì để đại :3</span>
                  <div className="flex items-center space-x-1">
                    <Users size={14} className={getAvailabilityColor(showtime.availableSeats, showtime.totalSeats)} />
                    <span className={`${getAvailabilityColor(showtime.availableSeats, showtime.totalSeats)} font-medium`}>
                      {showtime.availableSeats}/{showtime.totalSeats} seats
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinemaCard;