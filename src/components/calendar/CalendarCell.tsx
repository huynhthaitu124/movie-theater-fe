import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock, DollarSign } from 'lucide-react';
import { CalendarEvent } from '../../types/showtime';
import { timeToMinutes, minutesToTime } from '../../utils/timeUtils';

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
        const movie = movies.find(
          m => m.movieId === event.movieId || m.movieID === event.movieId
        );

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, zIndex: 50 }}
            className="absolute left-1 right-1 group cursor-pointer z-10"
            style={{
              top: position.top,
              height: position.height
            }}
            onClick={() => onEventClick(event)}
          >
            <div
              className="h-full w-full rounded-md text-white text-xs p-2 flex flex-col justify-between shadow-lg border border-white/20 overflow-hidden backdrop-blur-sm"
              style={{ 
                backgroundColor: event.color,
                background: `linear-gradient(135deg, ${event.color} 0%, ${event.color}dd 100%)`
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold leading-tight mb-1 ${isSmall ? 'text-xs truncate' : 'text-sm'}`}>
                    {event.title}
                  </h4>
                  {/* Movie image */}
                  {movie?.image && !isSmall && (
                    <img
                      src={movie.image}
                      alt={event.title}
                      className="w-12 h-12 object-cover rounded mb-1"
                    />
                  )}
                  {!isSmall && (
                    <div className="flex items-center text-xs opacity-90">
                      <Clock size={10} className="mr-1" />
                      <span>
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventDelete(event.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded-sm flex-shrink-0 ml-1"
                >
                  <X size={12} />
                </button>
              </div>
              
              {!isSmall && position.height > 80 && (
                <div className="flex items-center justify-between text-xs opacity-90 mt-1 pt-1 border-t border-white/20">
                  <span className="text-xs opacity-75">
                    {Math.round((timeToMinutes(event.endTime) - timeToMinutes(event.startTime)))}min
                  </span>
                </div>
              )}
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