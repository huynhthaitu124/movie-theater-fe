import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../components/layout/StaffLayout';
import { showtimeService } from '../../../services/modules/showtime.service';
import { movieService } from '../../../services/modules/movie.service';
import { cinemaService } from '../../../services/modules/cinema.service';
import { roomService } from '../../../services/modules/room.service';
import { Movie } from '../../../types/movie';
import { Cinema } from '../../../types/cinema';
import { CalendarRange, Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Film, Building, Info, Search, X } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

interface ShowtimeWithDetails {
  scheduleid: string;
  roomid: string;
  roomnumber: string;
  movieid: string;
  cinemaid: string;
  showdate: string;
  starttime: string;
  endtime: string;
  status: string;
  // Extended properties with details
  movieName?: string;
  movieImage?: string;
  cinemaName?: string;
  cinemaAddress?: string;
  roomName?: string;
}

const StaffShowtimeList: React.FC = () => {
  const [showtimes, setShowtimes] = useState<ShowtimeWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  
  // Filters
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Calendar state
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  useEffect(() => {
    fetchCinemas();
  }, []);

  // Fetch only cinemas initially
  const fetchCinemas = async () => {
    try {
      setIsLoading(true);
      const cinemasRes = await cinemaService.getAll();
      
      if (cinemasRes.data) {
        setCinemas(cinemasRes.data);
        console.log('Fetched cinemas:', cinemasRes.data);
      }
    } catch (err) {
      console.error('Error fetching cinemas:', err);
      toast.error('Failed to fetch cinemas');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when cinema is selected
  useEffect(() => {
    if (selectedCinema) {
      fetchDataForCinema(selectedCinema);
    } else {
      // Clear data when no cinema is selected
      setShowtimes([]);
      setMovies([]);
      setRooms([]);
    }
  }, [selectedCinema]);

  const fetchDataForCinema = async (cinemaId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all required data in parallel for the selected cinema
      const [showtimeRes, moviesRes, roomsRes] = await Promise.all([
        showtimeService.getAllMovieSchedules(),
        movieService.getAll(),
        roomService.getByCinema(cinemaId)
      ]);

      // Store movies and rooms in state for lookup
      if (moviesRes.data) setMovies(moviesRes.data);
      if (roomsRes.data) setRooms(roomsRes.data);

      console.log('Fetched movies:', moviesRes.data);
      console.log('Fetched rooms for cinema:', roomsRes.data);

      if (showtimeRes.data) {
        // Filter showtimes for the selected cinema and enhance with details
        const cinemaShowtimes = showtimeRes.data.filter(showtime => 
          showtime.cinemaid === cinemaId
        );
        
        // Enhance showtimes with movie and room details
        const enhancedShowtimes = cinemaShowtimes.map(showtime => {
          const movie = moviesRes.data?.find(m => m.movieID === showtime.movieid);
          const room = roomsRes.data?.find(r => r.roomid === showtime.roomid);
          const cinema = cinemas.find(c => c.cinemaid === showtime.cinemaid);
          
          return {
            ...showtime,
            movieName: movie?.movieName || 'Unknown Movie',
            movieImage: movie?.image || '',
            cinemaName: cinema?.cinemaname || 'Unknown Cinema',
            cinemaAddress: cinema?.address || '',
            roomName: room?.roomname || `Room ${showtime.roomnumber}`
          };
        });
        
        setShowtimes(enhancedShowtimes);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch showtimes and related data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter showtimes based on search query
  const filteredShowtimes = showtimes.filter(showtime => {
    if (!searchQuery.trim()) return true;
    
    // Case-insensitive search for movie name
    return showtime.movieName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Navigate to previous week
  const previousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  // Navigate to next week
  const nextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  // Generate week days
  const weekDays = [...Array(7)].map((_, i) => addDays(currentWeekStart, i));

  // Group showtimes by day, room and time
  const getShowtimesByDay = (day: Date) => {
    return filteredShowtimes.filter(showtime => {
      const showtimeDate = parseISO(showtime.showdate);
      return isSameDay(showtimeDate, day);
    }).sort((a, b) => {
      // Sort by room first, then by start time
      if (a.roomnumber !== b.roomnumber) {
        return parseInt(a.roomnumber) - parseInt(b.roomnumber);
      }
      return a.starttime.localeCompare(b.starttime);
    });
  };

  // Add this function to clear search
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  return (
    <StaffLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <CalendarRange className="mr-2" /> Showtime Calendar
          </h1>
        </div>

        {/* Cinema selection must come first */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Select Cinema
          </h2>
          
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <select
              className="bg-gray-700 text-white rounded-md pl-10 pr-8 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCinema}
              onChange={e => setSelectedCinema(e.target.value)}
            >
              <option value="">Select a cinema...</option>
              {cinemas.map(cinema => (
                <option key={cinema.cinemaid} value={cinema.cinemaid}>
                  {cinema.cinemaname}
                </option>
              ))}
            </select>
          </div>
          
          {!selectedCinema && (
            <div className="mt-4 bg-blue-900/30 text-blue-300 p-4 rounded-lg flex items-center">
              <Info className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>Please select a cinema to view showtimes</p>
            </div>
          )}
        </div>

        {selectedCinema && (
          <>
            {/* Replace the movie dropdown with search input */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-700 text-white rounded-md pl-10 pr-10 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                    onClick={clearSearch}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Week navigation */}
              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                <button 
                  onClick={previousWeek}
                  className="p-2 rounded-full hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-gray-300">
                  {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
                </span>
                
                <button 
                  onClick={nextWeek}
                  className="p-2 rounded-full hover:bg-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Search indicator - shows when a search is active */}
            {searchQuery.trim() && (
              <div className="mb-4 bg-blue-900/30 text-blue-300 p-2 px-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Film className="w-4 h-4 mr-2" />
                  <p>Showing results for: <span className="font-medium">"{searchQuery}"</span></p>
                </div>
                <button 
                  onClick={clearSearch}
                  className="text-blue-300 hover:text-white flex items-center"
                >
                  <X className="w-4 h-4 mr-1" /> Clear
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-900/50 text-red-300 p-4 rounded-lg flex items-center">
                <Info className="w-5 h-5 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {/* Calendar header */}
                <div className="grid grid-cols-7 border-b border-gray-700">
                  {weekDays.map((day, i) => (
                    <div key={i} className="text-center p-3 border-r border-gray-700 last:border-r-0">
                      <p className="text-gray-400 text-xs">{format(day, 'EEE')}</p>
                      <p className="font-medium">{format(day, 'd')}</p>
                    </div>
                  ))}
                </div>
                
                {/* Showtime cells */}
                <div className="grid grid-cols-7 min-h-[500px]">
                  {weekDays.map((day, dayIndex) => {
                    const dayShowtimes = getShowtimesByDay(day);
                    // Group showtimes by room
                    const roomGroups = dayShowtimes.reduce((acc, showtime) => {
                      const roomId = showtime.roomid;
                      if (!acc[roomId]) acc[roomId] = [];
                      acc[roomId].push(showtime);
                      return acc;
                    }, {} as Record<string, ShowtimeWithDetails[]>);
                    
                    return (
                      <div 
                        key={dayIndex} 
                        className={`border-r border-gray-700 last:border-r-0 p-2 overflow-y-auto max-h-[600px] ${
                          isSameDay(day, new Date()) ? 'bg-blue-900/20' : ''
                        }`}
                      >
                        {dayShowtimes.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                            No showtimes
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {Object.entries(roomGroups).map(([roomId, roomShowtimes]) => {
                              const room = rooms.find(r => r.roomid === roomId);
                              return (
                                <div key={roomId} className="bg-gray-700/50 rounded-lg p-2">
                                  <div className="text-xs font-medium text-gray-300 mb-2 border-b border-gray-600 pb-1">
                                    {room?.roomname || `Room ${roomShowtimes[0]?.roomnumber}`}
                                  </div>
                                  <div className="space-y-2">
                                    {roomShowtimes.map((showtime, i) => (
                                      <div 
                                        key={i} 
                                        className={`p-2 rounded-md ${
                                          showtime.status === 'ACTIVE' 
                                            ? 'bg-green-900/20 border border-green-800' 
                                            : 'bg-yellow-900/20 border border-yellow-800'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 mb-1">
                                          <div className="w-8 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                            {showtime.movieImage && (
                                              <img 
                                                src={showtime.movieImage} 
                                                alt={showtime.movieName} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                  const target = e.target as HTMLImageElement;
                                                  target.src = 'https://via.placeholder.com/80x120?text=No+Image';
                                                }} 
                                              />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate" title={showtime.movieName}>
                                              {showtime.movieName}
                                            </p>
                                            <div className="flex items-center text-xs text-gray-300">
                                              <Clock className="w-3 h-3 mr-1" />
                                              <span>{showtime.starttime} - {showtime.endtime}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffShowtimeList;