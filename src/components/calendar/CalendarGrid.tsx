import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Info, Settings, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { CinemaRoom, CalendarEvent } from '../../types/showtime';
import {  Movie  } from '../../types/movie';
import { addMinutesToTime, timeToMinutes, minutesToTime } from '../../utils/timeUtils';
import CalendarCell from './CalendarCell';
import SettingsModal from './SettingModal';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';

interface CalendarGridProps {
  rooms: CinemaRoom[];
  movies: Movie[];
  events: CalendarEvent[];
  onEventCreate: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventDelete: (eventId: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  cinemaName: string;
  cinemaLocation: string;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  rooms,
  movies,
  events,
  onEventCreate,
  onEventDelete,
  onEventClick,
  cinemaName,
  cinemaLocation
}) => {
  const [daysToShow, setDaysToShow] = useState(3);
  const [selectedRooms, setSelectedRooms] = useState<string[]>(
    rooms.slice(0, 4).map(room => room.id)
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentStartDate, setCurrentStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  
  // Refs for synchronized scrolling
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const daysHeaderRef = useRef<HTMLDivElement>(null);
  const roomsHeaderRef = useRef<HTMLDivElement>(null);
  const timeColumnRef = useRef<HTMLDivElement>(null);
  
  // Track scrolling state to prevent infinite loops
  const isScrollingRef = useRef(false);
  
  const displayDays = Array.from({ length: daysToShow }, (_, i) => addDays(currentStartDate, i));
  const filteredRooms = rooms.filter(room => selectedRooms.includes(room.id));
  
  // Operating hours: 9:00 AM to 11:00 PM (14 hours = 840 minutes)
  const startHour = 9;
  const endHour = 23;
  const totalMinutes = (endHour - startHour) * 60;
  const basePixelsPerMinute = 2;
  const pixelsPerMinute = basePixelsPerMinute * zoomLevel;
  const totalHeight = totalMinutes * pixelsPerMinute;
  const snapInterval = 5;

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2500);
  };

  // Synchronized scrolling implementation
  const handleMainScroll = useCallback(() => {
    if (isScrollingRef.current || !mainScrollRef.current) return;
    
    isScrollingRef.current = true;
    
    const mainElement = mainScrollRef.current;
    const scrollLeft = mainElement.scrollLeft;
    const scrollTop = mainElement.scrollTop;
    
    // Sync horizontal scroll with headers
    if (daysHeaderRef.current) {
      daysHeaderRef.current.scrollLeft = scrollLeft;
    }
    if (roomsHeaderRef.current) {
      roomsHeaderRef.current.scrollLeft = scrollLeft;
    }
    
    // Sync vertical scroll with time column
    if (timeColumnRef.current) {
      timeColumnRef.current.scrollTop = scrollTop;
    }
    
    // Reset flag after animation frame
    requestAnimationFrame(() => {
      isScrollingRef.current = false;
    });
  }, []);

  const handleHeaderScroll = useCallback((scrollLeft: number) => {
    if (isScrollingRef.current || !mainScrollRef.current) return;
    
    isScrollingRef.current = true;
    
    // Sync main scroll with header
    mainScrollRef.current.scrollLeft = scrollLeft;
    
    // Sync other headers
    if (daysHeaderRef.current) {
      daysHeaderRef.current.scrollLeft = scrollLeft;
    }
    if (roomsHeaderRef.current) {
      roomsHeaderRef.current.scrollLeft = scrollLeft;
    }
    
    requestAnimationFrame(() => {
      isScrollingRef.current = false;
    });
  }, []);

  const handleTimeColumnScroll = useCallback((scrollTop: number) => {
    if (isScrollingRef.current || !mainScrollRef.current) return;
    
    isScrollingRef.current = true;
    
    // Sync main scroll with time column
    mainScrollRef.current.scrollTop = scrollTop;
    
    requestAnimationFrame(() => {
      isScrollingRef.current = false;
    });
  }, []);

  // Set up scroll event listeners
  useEffect(() => {
    const mainElement = mainScrollRef.current;
    const daysElement = daysHeaderRef.current;
    const roomsElement = roomsHeaderRef.current;
    const timeElement = timeColumnRef.current;

    if (!mainElement) return;

    // Main scroll handler
    const mainScrollHandler = () => handleMainScroll();
    mainElement.addEventListener('scroll', mainScrollHandler, { passive: true });

    // Header scroll handlers
    const daysScrollHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      handleHeaderScroll(target.scrollLeft);
    };
    
    const roomsScrollHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      handleHeaderScroll(target.scrollLeft);
    };

    // Time column scroll handler
    const timeScrollHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      handleTimeColumnScroll(target.scrollTop);
    };

    if (daysElement) {
      daysElement.addEventListener('scroll', daysScrollHandler, { passive: true });
    }
    if (roomsElement) {
      roomsElement.addEventListener('scroll', roomsScrollHandler, { passive: true });
    }
    if (timeElement) {
      timeElement.addEventListener('scroll', timeScrollHandler, { passive: true });
    }

    // Cleanup
    return () => {
      mainElement.removeEventListener('scroll', mainScrollHandler);
      if (daysElement) {
        daysElement.removeEventListener('scroll', daysScrollHandler);
      }
      if (roomsElement) {
        roomsElement.removeEventListener('scroll', roomsScrollHandler);
      }
      if (timeElement) {
        timeElement.removeEventListener('scroll', timeScrollHandler);
      }
    };
  }, [handleMainScroll, handleHeaderScroll, handleTimeColumnScroll, filteredRooms.length, daysToShow]);

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleRoomToggle = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleSelectAllRooms = () => {
    setSelectedRooms(rooms.map(room => room.id));
  };

  const handleSelectNoRooms = () => {
    setSelectedRooms([]);
  };

  const snapToGrid = (minutes: number): number => {
    return Math.round(minutes / snapInterval) * snapInterval;
  };

  const handleDrop = (e: React.DragEvent, roomId: string, date: string, dropY: number) => {
    e.preventDefault();

    try {
      const movieData = JSON.parse(e.dataTransfer.getData('application/json')) as Movie;

      const minutesFromStart = Math.round(dropY / pixelsPerMinute);
      const snappedMinutes = snapToGrid(minutesFromStart);
      const startTime = minutesToTime(startHour * 60 + snappedMinutes);
      const endTime = addMinutesToTime(startTime, movieData.duration);
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);
      if (endMinutes <= startMinutes || endMinutes > endHour * 60) {
        showToast('Movie would end after closing time (23:00). Please choose an earlier time.');
        return;
      }

      const hasConflict = events.some(event => {
        if (event.roomId !== roomId || event.date !== date) return false;

        const eventStartMinutes = timeToMinutes(event.startTime);
        const eventEndMinutes = timeToMinutes(event.endTime);
        const newStartMinutes = timeToMinutes(startTime);
        const newEndMinutes = timeToMinutes(endTime);

        return (
          (newStartMinutes >= eventStartMinutes && newStartMinutes < eventEndMinutes) ||
          (newEndMinutes > eventStartMinutes && newEndMinutes <= eventEndMinutes) ||
          (newStartMinutes <= eventStartMinutes && newEndMinutes >= eventEndMinutes)
        );
      });

      if (hasConflict) {
        showToast('Time slot conflict! Please choose a different time.');
        return;
      }

      const newEvent: Omit<CalendarEvent, 'id'> = {
        movieId: movieData.movieID,
        title: movieData.movieName,
        startTime,
        endTime,
        date,
        roomId,
        price: 12.99,
        color: movieData.color || '#3B82F6'
      };

      onEventCreate(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    setCurrentStartDate(prev =>
      addDays(prev, direction === 'next' ? daysToShow : -daysToShow)
    );
  };

  // Generate time markers with 24-hour format
  const timeMarkers = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    const totalMinutesFromStart = (hour - startHour) * 60;
    const position = totalMinutesFromStart * pixelsPerMinute;
    
    // Use 24-hour format (09:00, 10:00, ..., 23:00)
    const label = `${hour.toString().padStart(2, '0')}:00`;
    
    timeMarkers.push({
      hour,
      position,
      label,
      isMainHour: hour % 2 === 1 // Highlight every other hour
    });
  }

  // Calculate column width based on zoom and available space
  const minColumnWidth = 160 * zoomLevel;
  const maxColumnWidth = 300 * zoomLevel;
  const availableWidth = filteredRooms.length > 0 ? Math.max(800, window.innerWidth - 400) / (daysToShow * filteredRooms.length) : 200;
  const columnWidth = Math.max(minColumnWidth, Math.min(maxColumnWidth, availableWidth));

  return (
    <div className="flex-1 bg-secondary-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-800 to-secondary-700 border-b border-secondary-600 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Cinema Schedule</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Info size={12} className="text-secondary-400" />
                <p className="text-xs text-secondary-400">
                  Drag movies to time slots • {filteredRooms.length} theaters • Zoom: {Math.round(zoomLevel * 100)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-secondary-700/50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </Button>
              <div className="px-2 py-1 text-xs font-medium text-white min-w-[50px] text-center">
                {Math.round(zoomLevel * 100)}%
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </Button>
            </div>

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center space-x-2"
            >
              <Settings size={16} />
              <span>Settings</span>
            </Button>
            
            {/* Navigation */}
            <div className="flex items-center space-x-2 bg-secondary-700/50 rounded-lg p-1">
              <Button variant="ghost" size="sm" onClick={() => handleNavigate('prev')}>
                <ChevronLeft size={16} />
              </Button>
              <div className="px-3 py-1 text-sm font-medium text-white min-w-[180px] text-center">
                {format(currentStartDate, 'MMM d')} - {format(addDays(currentStartDate, daysToShow - 1), 'MMM d, yyyy')}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleNavigate('next')}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="flex-1 overflow-hidden bg-secondary-900">
        {filteredRooms.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-secondary-800/50 rounded-xl border border-secondary-700">
              <CalendarIcon className="h-12 w-12 text-secondary-500 mx-auto mb-4" />
              <div className="text-lg font-medium text-secondary-300 mb-2">No theaters selected</div>
              <div className="text-sm text-secondary-500 mb-4">Please select at least one theater to display the schedule</div>
              <Button onClick={() => setIsSettingsOpen(true)}>
                Open Settings
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex">
            {/* Left side: Time column */}
            <div className="flex-shrink-0 w-20 bg-secondary-800 border-r border-secondary-600 flex flex-col">
              {/* Time column header */}
              <div className="h-20 p-3 bg-secondary-800 border-b border-secondary-600 flex items-center justify-center">
                <Clock size={16} className="text-secondary-400" />
              </div>
              
              {/* Room header spacer */}
              <div className="h-16 p-2 bg-secondary-750 border-b border-secondary-600"></div>
              
              {/* Time column - scrollable with hidden scrollbar */}
              <div 
                ref={timeColumnRef}
                className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
              >
                <div className="relative" style={{ height: totalHeight }}>
                  {timeMarkers.map((marker, index) => (
                    <div
                      key={index}
                      className="absolute left-0 right-0"
                      style={{ top: marker.position }}
                    >
                      <div className={`w-full text-center py-1 text-xs font-medium border-t ${
                        marker.isMainHour 
                          ? 'text-white bg-secondary-700/50 border-secondary-500' 
                          : 'text-secondary-400 bg-secondary-800/50 border-secondary-600/50'
                      }`}>
                        {marker.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: Days + Rooms + Calendar content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Days Header - horizontally scrollable with hidden scrollbar */}
              <div 
                ref={daysHeaderRef}
                className="h-20 overflow-x-auto overflow-y-hidden bg-secondary-800 border-b border-secondary-600 scrollbar-hide"
              >
                <div className="flex h-full" style={{ minWidth: `${columnWidth * filteredRooms.length * daysToShow}px` }}>
                  {displayDays.map(day => (
                    <div 
                      key={day.toISOString()} 
                      className="flex-shrink-0 p-4 text-center border-r border-secondary-600 last:border-r-0 bg-gradient-to-b from-secondary-800 to-secondary-750 flex flex-col justify-center"
                      style={{ width: `${columnWidth * filteredRooms.length}px` }}
                    >
                      <div className="text-lg font-bold text-white">
                        {format(day, 'EEE')}
                      </div>
                      <div className="text-sm text-secondary-400">
                        {format(day, 'MMM d')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Headers - horizontally scrollable with hidden scrollbar */}
              <div 
                ref={roomsHeaderRef}
                className="h-16 overflow-x-auto overflow-y-hidden bg-secondary-750 border-b border-secondary-600 scrollbar-hide"
              >
                <div className="flex h-full" style={{ minWidth: `${columnWidth * filteredRooms.length * daysToShow}px` }}>
                  {displayDays.map(day => (
                    <div 
                      key={`rooms-${day.toISOString()}`} 
                      className="flex-shrink-0 border-r border-secondary-600 last:border-r-0"
                      style={{ width: `${columnWidth * filteredRooms.length}px` }}
                    >
                      <div className="flex h-full">
                        {filteredRooms.map(room => (
                          <div 
                            key={room.id} 
                            className="flex-shrink-0 p-2 text-center border-r border-secondary-600/50 last:border-r-0 bg-secondary-750 flex flex-col justify-center"
                            style={{ width: `${columnWidth}px` }}
                          >
                            <div className="text-sm font-semibold text-white mb-1 truncate" title={`Room ${room.number}`}>
                              Room {room.number}
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                room.type === 'IMAX' ? 'bg-blue-500/20 text-blue-400' :
                                room.type === 'VIP' ? 'bg-purple-500/20 text-purple-400' :
                                room.type === '4DX' ? 'bg-green-500/20 text-green-400' :
                                'bg-secondary-600/50 text-secondary-300'
                              }`}>
                                {room.type}
                              </span>
                              <span className="text-xs text-secondary-500">
                                {room.capacity} seats
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Content - both horizontally and vertically scrollable with premium scrollbar */}
              <div 
                ref={mainScrollRef}
                className="flex-1 overflow-auto bg-secondary-900"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(59, 130, 246, 0.8) rgba(30, 41, 59, 0.6)'
                }}
              >
                <div 
                  className="flex"
                  style={{ 
                    height: totalHeight, 
                    minWidth: `${columnWidth * filteredRooms.length * daysToShow}px`
                  }}
                >
                  {displayDays.map(day => (
                    <div 
                      key={day.toISOString()} 
                      className="flex-shrink-0 border-r border-secondary-600 last:border-r-0"
                      style={{ width: `${columnWidth * filteredRooms.length}px` }}
                    >
                      <div className="flex" style={{ height: totalHeight }}>
                        {filteredRooms.map(room => (
                          <div 
                            key={`${room.id}-${day.toISOString()}`}
                            className="flex-shrink-0 border-r border-secondary-600/30 last:border-r-0 relative bg-secondary-900/50 hover:bg-secondary-800/30 transition-colors"
                            style={{ width: `${columnWidth}px` }}
                          >
                            {/* Hour grid lines */}
                            {Array.from({ length: endHour - startHour + 1 }, (_, i) => (
                              <div
                                key={i}
                                className={`absolute left-0 right-0 border-t ${
                                  i % 2 === 0 ? 'border-secondary-700/30' : 'border-secondary-700/15'
                                }`}
                                style={{ top: i * 60 * pixelsPerMinute }}
                              />
                            ))}
                            
                            <CalendarCell
                              roomId={room.id}
                              roomName={room.name}
                              date={format(day, 'yyyy-MM-dd')}
                              events={events.filter(
                                event => 
                                  event.roomId === room.id && 
                                  event.date === format(day, 'yyyy-MM-dd')
                              )}
                              movies={movies}
                              onDrop={handleDrop}
                              onEventDelete={onEventDelete}
                              onEventClick={onEventClick}
                              totalHeight={totalHeight}
                              pixelsPerMinute={pixelsPerMinute}
                              startHour={startHour}
                              snapInterval={snapInterval}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        rooms={rooms}
        selectedRooms={selectedRooms}
        onRoomToggle={handleRoomToggle}
        onSelectAll={handleSelectAllRooms}
        onSelectNone={handleSelectNoRooms}
        daysToShow={daysToShow}
        onDaysChange={setDaysToShow}
        cinemaName={cinemaName}
        cinemaLocation={cinemaLocation}
      />

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded shadow-lg z-50 transition-all">
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;