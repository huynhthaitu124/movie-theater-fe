import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, DollarSign } from 'lucide-react';
import { CalendarEvent } from '../../types/showtime';
import { timeToMinutes, minutesToTime } from '../../utils/timeUtils';
import { useMoviesWithColor } from '../../utils/moviesWithColor';

interface CalendarCellProps {
  roomId: string;
  roomName: string;
  date: string;
  events: CalendarEvent[];
  movies: any[];
  onDrop: (e: React.DragEvent, roomId: string, date: string, dropY: number) => void;
  onEventDelete: (eventId: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  totalHeight: number;
  pixelsPerMinute: number;
  startHour: number;
  snapInterval: number;
}

// Add this helper function at the top (outside the component)
function isColorLight(hex: string): boolean {
  // Remove hash if present
  hex = hex.replace('#', '');
  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }
  // Parse r, g, b
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Perceived brightness formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 220; // You can adjust this threshold
}

const CalendarCell: React.FC<CalendarCellProps> = ({
  roomId,
  roomName,
  date,
  events,
  movies,
  onDrop,
  onEventDelete,
  onEventClick,
  totalHeight,
  pixelsPerMinute,
  startHour,
  snapInterval
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [dragPosition, setDragPosition] = React.useState<number | null>(null);
  const [snappedPosition, setSnappedPosition] = React.useState<number | null>(null);
  const moviesWithColor = useMoviesWithColor(movies);

  const snapToGrid = (minutes: number): number => {
    return Math.round(minutes / snapInterval) * snapInterval;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we have valid movie data
    const types = e.dataTransfer.types;
    if (types.includes('application/json')) {
      setIsDragOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set the drop effect to copy to show the correct cursor
    e.dataTransfer.dropEffect = 'copy';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Ensure y is within bounds
    const clampedY = Math.max(0, Math.min(y, totalHeight));
    setDragPosition(clampedY);
    
    const minutesFromStart = Math.round(clampedY / pixelsPerMinute);
    const snappedMinutes = snapToGrid(minutesFromStart);
    const snappedY = snappedMinutes * pixelsPerMinute;
    setSnappedPosition(snappedY);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only hide drag indicators if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
      setDragPosition(null);
      setSnappedPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setDragPosition(null);
    setSnappedPosition(null);
    
    // Validate that we have the correct data
    const jsonData = e.dataTransfer.getData('application/json');
    if (!jsonData) {
      console.warn('No movie data found in drop event');
      return;
    }
    
    try {
      const movieData = JSON.parse(jsonData);
      if (!movieData.movieID || !movieData.movieName) {
        console.warn('Invalid movie data structure');
        return;
      }
      
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const clampedY = Math.max(0, Math.min(y, totalHeight));
      
      onDrop(e, roomId, date, clampedY);
    } catch (error) {
      console.error('Error parsing movie data:', error);
    }
  };

  const getEventPosition = (event: CalendarEvent) => {
    const startMinutes = timeToMinutes(event.startTime) - (startHour * 60);
    const endMinutes = timeToMinutes(event.endTime) - (startHour * 60);
    
    return {
      top: startMinutes * pixelsPerMinute,
      height: Math.max((endMinutes - startMinutes) * pixelsPerMinute, 30)
    };
  };

  const getSnappedTime = (position: number): string => {
    const minutesFromStart = Math.round(position / pixelsPerMinute);
    const snappedMinutes = snapToGrid(minutesFromStart);
    return minutesToTime(startHour * 60 + snappedMinutes);
  };

  return (
    <div
      className={`absolute inset-0 transition-all duration-200 ${
        isDragOver 
          ? 'bg-primary-500/10 ring-2 ring-primary-400/50 ring-inset' 
          : 'hover:bg-secondary-700/20'
      }`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Events */}
      {events.map(event => {
        const position = getEventPosition(event);
        const isSmall = position.height < 60;
        // Find the movie info for this event
        const movie = moviesWithColor.find(
          m => m.movieId === event.movieId || m.movieID === event.movieId
        );

        const eventColor = movie?.color || '#3B82F6';
        const textColor = isColorLight(eventColor) ? 'text-blue-700' : 'text-white';

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03, zIndex: 50 }}
            className="absolute left-1 right-1 group cursor-pointer z-10"
            style={{
              top: position.top,
              height: position.height
            }}
            onClick={() => onEventClick(event)}
          >
            <div
              className={`relative h-full w-full rounded-lg flex flex-col justify-between shadow-xl border border-white/20 overflow-hidden backdrop-blur-sm transition-all duration-200 ${textColor}`}
              style={{
                background: `linear-gradient(135deg, ${eventColor} 70%, #fff0 100%)`,
                borderLeft: `6px solid ${eventColor}`,
              }}
            >
              {/* Overlay for better text contrast on light backgrounds */}
              {isColorLight(eventColor) && (
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              )}

              <div className="flex flex-col gap-2 z-10 p-3 pb-0">
                {/* Movie image - one line, bigger */}
                {movie?.image && (
                  <img
                    src={movie.image}
                    alt={event.title}
                    className="w-16 h-16 object-cover rounded shadow border-2 border-black mx-auto mb-2"
                    style={{ display: 'block' }}
                  />
                )}
                {/* Movie name - one line, bigger */}
                <h4 className="font-bold leading-tight text-lg truncate text-center mb-1">
                  {event.title}
                </h4>
                {/* Time - one line, bigger */}
                <div className="flex items-center justify-center gap-2 text-base opacity-90 font-semibold mb-1">
                  <Clock size={18} className="mr-1" />
                  <span>
                    {event.startTime} - {event.endTime}
                  </span>
                </div>
                {/* Duration and extra info */}
                {position.height > 60 && (
                  <div className="flex items-center justify-center text-base opacity-80 mt-1 pb-2 z-10">
                    <span>
                      {Math.round(timeToMinutes(event.endTime) - timeToMinutes(event.startTime))} min
                    </span>
                  </div>
                )}
                {/* Delete button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onEventDelete(event.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded-sm flex-shrink-0 z-20"
                  title="Delete"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
      
      {/* Enhanced Drop indicator */}
      {isDragOver && snappedPosition !== null && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute left-1 right-1 z-30 pointer-events-none"
          style={{ top: snappedPosition }}
        >
          <div className="h-10 border-2 border-dashed border-primary-400 bg-primary-500/20 rounded-md flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="text-xs text-primary-300 font-semibold">
                📽️ Drop at {getSnappedTime(snappedPosition)}
              </div>
              <div className="text-xs text-primary-400 opacity-75">5-minute precision</div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Subtle snap grid indicators */}
      {isDragOver && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {Array.from({ length: Math.floor(totalHeight / (snapInterval * pixelsPerMinute)) }, (_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-primary-400/30"
              style={{ top: i * snapInterval * pixelsPerMinute }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarCell;