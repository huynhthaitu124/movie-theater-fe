import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Film, Monitor, Plus } from 'lucide-react';
import { CalendarEvent } from '../../../types/showtime';
import { Cinema, Room } from '../../../types/cinema';
import { Movie } from '../../../types/movie';
import MovieSidebar from '../../../components/calendar/MovieSidebar';
import CalendarGrid from '../../../components/calendar/CalendarGrid';
import EventModal from '../../../components/calendar/EventModal';
import SettingModal from '../../../components/calendar/SettingModal';
import { movieService } from '../../../services/modules/movie.service';
import { cinemaService } from '../../../services/modules/cinema.service';
import { showtimeService } from '../../../services/modules/showtime.service';
import { movieCinemaService } from '../../../services/modules/movieCinema.service';
import { useLocation, useNavigate } from 'react-router-dom';
import { roomService } from '../../../services/modules/room.service';
import { useMoviesWithColor } from '../../../utils/moviesWithColor';

const ShowtimeManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cinemaIdParam = params.get('cinemaId') || '';

  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [cinemaName, setCinemaName] = useState<string>('');
  const [cinemaLocation, setCinemaLocation] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cinemaId, setCinemaId] = useState<string>('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [daysToShow, setDaysToShow] = useState<number>(7);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [pendingShowtime, setPendingShowtime] = useState<Omit<CalendarEvent, 'id'> | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const moviesWithColor = useMoviesWithColor(movies);

  // Fetch movies and cinemas from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all cinemas
        const cinemaRes = await cinemaService.getAll();
        // Find the cinema that matches the id from the URL
        const foundCinema = cinemaRes.data.find(
          (c: any) => c.cinemaid === cinemaIdParam
        );
        if (foundCinema) {
          setCinemaId(foundCinema.cinemaid);
          setCinemaName(foundCinema.cinemaname);
          setCinemaLocation(foundCinema.location);

          // Fetch rooms for this cinema using cinemaId
          const roomsRes = await roomService.getByCinema(foundCinema.cinemaid);
          const mappedRooms = roomsRes.data.map((room: any) => ({
            id: room.roomId,
            number: room.roomnumber,
            type: room.roomtype,
            capacity: room.capacity,
            ...room,
          }));
          setRooms(mappedRooms);

          // Fetch movies for this cinema
          const movieRes = await movieCinemaService.getMoviesByCinema(foundCinema.cinemaid);
          const mappedMovies = movieRes.data.map((movie: any) => ({
            ...movie,
            movieId: movie.movieID || movie.movieId, // ensure both are mapped
          }));
          setMovies(mappedMovies);
        } else {
          setRooms([]);
          setMovies([]);
        }

        // Fetch showtimes for this cinema
        if (foundCinema) {
          const showtimeRes = await showtimeService.getSchedulesByCinema(foundCinema.cinemaid);
          setEvents(
            showtimeRes.data.map((showtime: any) => ({
              id: showtime.scheduleId,
              roomId: showtime.roomid,      // <-- fix casing
              movieId: showtime.movieid,    // <-- fix casing
              date: showtime.showdate,      // <-- fix casing
              startTime: showtime.starttime, // <-- fix casing
              endTime: showtime.endtime,     // <-- fix casing
              title: showtime.moviename || showtime.title || "Untitled",
              color: showtime.color || "#3b82f6",
              price: showtime.price ?? 0,
              status: showtime.status,
              isActive: showtime.isactive,
            }))
          );
        } else {
          setEvents([]);
        }
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cinemaIdParam]);

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2500);
  };
  // Add showtime
  const handleEventCreate = (eventData: Omit<CalendarEvent, 'id'>) => {
    const now = new Date();
    const eventDate = new Date(`${eventData.date}T${eventData.startTime}`);
    if (eventDate < now) {
      showToast("You cannot add showtime in the past!");
      return;
    }
    setPendingShowtime(eventData);
    setIsConfirmModalOpen(true);
  };

  // Delete event (hard delete showtime)
  const handleEventDelete = async (eventId: string) => {
    try {
      console.log(`Deleting event with ID: ${eventId}`);
      await showtimeService.hardDeleteMovieSchedule(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      // Optionally show success message
    } catch (err) {
      // handle error
    }
  };

  // Click event
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // Open settings modal
  const openSettingModal = () => {
    setIsSettingModalOpen(true);
  };

  // Close settings modal
  const closeSettingModal = () => {
    setIsSettingModalOpen(false);
  };

  

  // Toggle room selection
  const handleRoomToggle = (roomId: string) => {
  setSelectedRooms(prev =>
    prev.includes(roomId)
      ? prev.filter(id => id !== roomId)
      : [...prev, roomId]
  );
  // console.log(`Room ${roomId} toggled. Selected rooms:`, selectedRooms);
  // console.log(`Selected rooms count: ${selectedRooms.length}`);
};

  // Select all rooms
  const handleSelectAll = () => {
    setSelectedRooms(rooms.map(room => room.id));
  };

  // Deselect all rooms
  const handleSelectNone = () => {
    setSelectedRooms([]);
  };

  // Change days to show
  const handleDaysChange = (days: number) => {
    setDaysToShow(days);
  };

  const actuallyAddShowtime = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
      const showDate = eventData.date;
      const startTime = eventData.startTime.length === 5 ? eventData.startTime + ":00" : eventData.startTime;
      const endTime = eventData.endTime.length === 5 ? eventData.endTime + ":00" : eventData.endTime;

      const payload = {
        roomId: eventData.roomId,
        movieId: eventData.movieId,
        showDate,
        startTime,
        endTime,
        status: eventData.status || "ACTIVE",
        isActive: eventData.isActive ?? true,
      };

      Object.keys(payload).forEach(
        key => payload[key] === undefined && delete payload[key]
      );

      if (!payload.roomId || !payload.movieId) {
        alert('Missing room or movie!');
        return;
      }

      await showtimeService.addMovieSchedule(payload);

      // Refetch showtimes for this cinema and update state
      const showtimeRes = await showtimeService.getSchedulesByCinema(cinemaId);
      setEvents(
        showtimeRes.data.map((showtime: any) => ({
          id: showtime.scheduleId,
          roomId: showtime.roomid,
          movieId: showtime.movieid,
          date: showtime.showdate,
          startTime: showtime.starttime,
          endTime: showtime.endtime,
          title: showtime.moviename || showtime.title || "Untitled",
          color: showtime.color || "#3b82f6",
          price: showtime.price ?? 0,
          status: showtime.status,
          isActive: showtime.isactive,
        }))
      );
    } catch (err) {
      alert('Failed to add showtime. See console for details.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-secondary-900">
      {/* Back Button */}
      <div className="px-6 pt-4">
        <button
          onClick={() => navigate('/admin/cinemas')}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center mb-4 space-x-2"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Cinema Management
        </button>
      </div>

      {/* Compact Header */}
      <div className="bg-secondary-800 border-b border-secondary-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Showtime Management</h1>
            <p className="text-secondary-300 text-lg mt-1">
              {cinemaName && (
                <span className="font-semibold text-primary-400">{cinemaName}</span>
              )}
            </p>
            <p className="text-secondary-300 text-sm mt-1">
              Drag movies from sidebar to schedule • Use settings to customize view
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="p-4 bg-blue-500/20 rounded">
                <Film className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-secondary-400">Movies</p>
                <p className="text-sm font-semibold text-white">{movies.length}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="p-4 bg-green-500/20 rounded">
                <Monitor className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-secondary-400">Rooms</p>
                <p className="text-sm font-semibold text-white">{rooms.length}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="p-4 bg-purple-500/20 rounded">
                <Calendar className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-secondary-400">Showtimes</p>
                <p className="text-sm font-semibold text-white">{events.length}</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <MovieSidebar movies={movies} />
        <CalendarGrid
          rooms={rooms}
          movies={moviesWithColor}
          events={events}
          onEventCreate={handleEventCreate}
          onEventDelete={handleEventDelete}
          onEventClick={handleEventClick}
          cinemaName={cinemaName}
          cinemaLocation={cinemaLocation}
          cinemaId={cinemaId} // <-- Pass cinemaId
        />
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
        // movie={selectedMovie}
        // room={selectedRoom}
        // onUpdate={handleEventUpdate}
        onDelete={handleEventDelete}
      />

      {/* Settings Modal */}
      <SettingModal
        isOpen={isSettingModalOpen}
        onClose={closeSettingModal}
        selectedRooms={selectedRooms}
        onRoomToggle={handleRoomToggle}
        onSelectAll={handleSelectAll}
        onSelectNone={handleSelectNone}
        daysToShow={daysToShow}
        onDaysChange={handleDaysChange}
        cinemaName={cinemaName}
        cinemaId={cinemaId} // <-- pass cinemaId
        cinemaLocation={cinemaLocation}
      />

      {/* Confirm Modal */}
      {isConfirmModalOpen && pendingShowtime && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-secondary-800 rounded-lg p-6 w-full max-w-md shadow-lg">
      <h2 className="text-lg font-bold mb-4 text-white">Confirm Showtime</h2>
      <div className="space-y-2 text-secondary-200 text-sm">
        <div><strong>Movie:</strong> {movies.find(m => m.movieId === pendingShowtime.movieId)?.movieName || pendingShowtime.movieId}</div>
        <div><strong>Room:</strong> {rooms.find(r => r.id === pendingShowtime.roomId)?.number || pendingShowtime.roomId}</div>
        <div><strong>Date:</strong> {pendingShowtime.date}</div>
        <div><strong>Start Time:</strong> {pendingShowtime.startTime}</div>
        <div><strong>End Time:</strong> {pendingShowtime.endTime}</div>
        <div><strong>Status:</strong> {pendingShowtime.status || "ACTIVE"}</div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button
          className="px-4 py-2 rounded bg-secondary-600 text-white hover:bg-secondary-500"
          onClick={() => {
            setIsConfirmModalOpen(false);
            setPendingShowtime(null);
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-500"
          onClick={async () => {
            setIsConfirmModalOpen(false);
            if (pendingShowtime) {
              await actuallyAddShowtime(pendingShowtime);
              setPendingShowtime(null);
            }
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}

    {/* Toast */}
    {toast.visible && (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded shadow-lg z-50 transition-all">
        {toast.message}
      </div>
    )}
    </div>
  );
};

export default ShowtimeManagement;