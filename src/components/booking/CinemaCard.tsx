import React from 'react';
import { MapPin, Star, Clock, Users } from 'lucide-react';
import { Cinema } from '../../types/cinema';
import { Schedule } from '../../types/schedule';

interface CinemaCardProps {
  cinema: Cinema;
  schedules: Schedule[];
  selectedCinema: string;
  selectedSchedule: string;
  onCinemaSelect: (cinemaId: string) => void;
  onScheduleSelect: (scheduleId: string) => void;
}

const CinemaCard: React.FC<CinemaCardProps> = ({
  cinema,
  schedules,
  selectedCinema,
  selectedSchedule,
  onCinemaSelect,
  onScheduleSelect
}) => {
  const isSelected = selectedCinema === cinema.id;
  const cinemaSchedules = schedules;

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300 overflow-hidden
      ${isSelected ? 'ring-2 ring-blue-500 shadow-blue-500/20' : 'hover:shadow-xl'}
    `}>
      {/* Cinema Header */}
      <div className="p-6 pb-0">
        <h3 className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 mb-3 tracking-tight">
          {cinema.name}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <MapPin size={18} className="mr-2 text-primary-500" />
            <span className="truncate">{cinema.address}</span>
          </div>
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <span className="font-medium mr-2">City:</span>
            <span>{cinema.city}</span>
          </div>
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <span className="font-medium mr-2">Phone:</span>
            <span>{cinema.phone}</span>
          </div>
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <Clock size={18} className="mr-2 text-primary-500" />
            <span>
              <span className="font-medium">Open:</span> {cinema.opentime || cinema.openTime}
              <span className="mx-2">|</span>
              <span className="font-medium">Close:</span> {cinema.closetime || cinema.closeTime}
            </span>
          </div>
        </div>
        <hr className="my-4 border-secondary-200 dark:border-secondary-700" />
      </div>

      {/* Cinema Details */}
      <div className="p-4 pt-2">
        {/* Schedules */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">Available Times</h4>
          <div className="grid grid-cols-1 gap-2">
            {cinemaSchedules.map((schedule) => (
              <button
                key={schedule.scheduleId}
                onClick={() => {
                  onCinemaSelect(cinema.id);
                  onScheduleSelect(schedule.scheduleId);
                }}
                className={`
                  p-3 rounded-lg border transition-all duration-200 text-left
                  ${selectedSchedule === schedule.scheduleId 
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Clock size={16} className="text-gray-500" />
                    <span className="font-medium">{formatTime(schedule.startTime)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{schedule.room?.name}</span>
                  <div className="flex items-center space-x-1">
                    <Users size={14} className={getAvailabilityColor(schedule.availableSeats, schedule.totalSeats)} />
                    <span className={`${getAvailabilityColor(schedule.availableSeats, schedule.totalSeats)} font-medium`}>
                      {schedule.availableSeats}/{schedule.totalSeats} seats
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