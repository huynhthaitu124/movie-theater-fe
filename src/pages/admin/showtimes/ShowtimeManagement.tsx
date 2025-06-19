import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Clock, Building2, Settings2, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { mockLocations } from '../../../data/mockCinemas';
import { mockMovies } from '../../../data/mockMovies';
import { Showtime } from '../../../types/showtime';
import { Movie } from '../../../types/movie';
import ShowtimeManagementModal from '../../../components/modals/ShowtimeManagementModal';
import DeleteConfirmationModal from '../../../components/modals/DeleteConfirmationModal';
import MultipleShowtimeModal from '../../../components/modals/MultipleShowtimeModal';
import { useSearchParams } from 'react-router-dom';
import { showtimeService } from '../../../services/modules/showtime.service';
import { movieService } from '../../../services/modules/movie.service';

const ShowtimeManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get('movieId');

  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<string>(movieId || '');
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [isMultipleModalOpen, setIsMultipleModalOpen] = useState(false);
  const [selectedMovieForMultiple, setSelectedMovieForMultiple] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchShowtimes = async () => {
      setIsLoading(true);
      try {
        const response = await showtimeService.getAll();
        setShowtimes(response.data);
      } catch (err) {
        setError('Failed to load showtimes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowtimes();
  }, []);

  // Filter showtimes based on selection
  const filteredShowtimes = showtimes.filter(showtime => {
    const matchesMovie = !selectedMovie || showtime.movieId === selectedMovie;
    const matchesCinema = !selectedCinema || showtime.cinemaId === selectedCinema;
    const matchesRoom = !selectedRoom || showtime.roomId === selectedRoom;
    return matchesMovie && matchesCinema && matchesRoom;
  });

  const handleSaveShowtime = async (data: Partial<Showtime>) => {
    try {
      if (selectedShowtime) {
        // Update existing showtime
        const response = await showtimeService.update(selectedShowtime.id, data);
        if (response.data) {
          setShowtimes(prev => prev.map(st => 
            st.id === selectedShowtime.id ? response.data : st
          ));
        }
      } else {
        const movie = mockMovies.find(m => m.movieID === data.movieId);
        const cinema = mockLocations
          .flatMap(l => l.cinemas)
          .find(c => c.id === data.cinemaId);
        const room = cinema?.rooms.find(r => r.id === data.roomId);

        const response = await showtimeService.create({
          ...data,
          status: 'scheduled',
          movie,
          cinema,
          room,
          availableSeats: room?.capacity || 0,
          totalSeats: room?.capacity || 0,
          format: room?.type.toUpperCase() as Showtime['format']
        } as Omit<Showtime, 'id'>);

        if (response.data) {
          setShowtimes(prev => [...prev, response.data]);
        }
      }
      setIsModalOpen(false);
      setSelectedShowtime(null);
    } catch (err) {
      setError('Failed to save showtime. Please try again.');
    }
  };

  const handleDeleteShowtime = async () => {
    if (selectedShowtime) {
      try {
        await showtimeService.delete(selectedShowtime.id);
        setShowtimes(prev => prev.filter(st => st.id !== selectedShowtime.id));
        setShowDeleteModal(false);
        setSelectedShowtime(null);
      } catch (err) {
        setError('Failed to delete showtime. Please try again.');
      }
    }
  };

  const handleSaveMultipleShowtimes = async (entries: any[]) => {
    try {
      const newShowtimes = entries.flatMap(entry => 
        entry.times.map((time: string) => {
          const startDateTime = new Date(`${entry.date}T${time}`);
          const endDateTime = new Date(
            startDateTime.getTime() + 
            (selectedMovieForMultiple?.duration || 0) * 60000
          );

          const cinema = mockLocations
            .flatMap(l => l.cinemas)
            .find(c => c.id === entry.cinemaId);
          const room = cinema?.rooms.find(r => r.id === entry.roomId);

          return {
            movieId: selectedMovieForMultiple?.movieID || '',
            cinemaId: entry.cinemaId,
            roomId: entry.roomId,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            price: entry.price,
            status: 'scheduled' as const,
            movie: selectedMovieForMultiple,
            cinema,
            room,
            format: room?.type.toUpperCase() as Showtime['format'],
            availableSeats: room?.capacity || 0,
            totalSeats: room?.capacity || 0
          };
        })
      );

      const response = await showtimeService.createMany(newShowtimes as Omit<Showtime, 'id'>[]);
      if (response.data) {
        setShowtimes(prev => [...prev, ...response.data]);
      }
      setIsMultipleModalOpen(false);
      setSelectedMovieForMultiple(null);
    } catch (err) {
      setError('Failed to create showtimes. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin h-10 w-10 text-primary-500" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center p-4 bg-error-500/10 rounded-lg">
            <AlertCircle className="w-6 h-6 text-error-500 mr-3" />
            <span className="text-error-500 font-medium">{error}</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <h1 className="text-2xl font-bold text-white">Showtime Management</h1>
          <div className="flex gap-4">
            {/* Single Showtime Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-secondary-700 text-white rounded-lg hover:bg-secondary-600 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Add Single Showtime
            </motion.button>

            {/* Multiple Showtimes Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const movie = mockMovies.find(m => m.movieID === selectedMovie);
                if (movie) {
                  setSelectedMovieForMultiple(movie);
                  setIsMultipleModalOpen(true);
                }
              }}
              disabled={!selectedMovie}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} className="mr-2" />
              Add Multiple Showtimes
            </motion.button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <select
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            className="bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="">All Movies</option>
            {mockMovies.map(movie => (
              <option key={movie.movieID} value={movie.movieID}>{movie.movieName}</option>
            ))}
          </select>

          {/* Cinema Filter */}
          <select
            value={selectedCinema}
            onChange={(e) => {
              setSelectedCinema(e.target.value);
              setSelectedRoom('');
            }}
            className="bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="">All Cinemas</option>
            {mockLocations.flatMap(location => 
              location.cinemas.map(cinema => (
                <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
              ))
            )}
          </select>

          {/* Room Filter */}
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
            disabled={!selectedCinema}
          >
            <option value="">All Rooms</option>
            {selectedCinema && mockLocations
              .flatMap(l => l.cinemas)
              .find(c => c.id === selectedCinema)
              ?.rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
          </select>
        </motion.div>

        {/* Showtimes Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredShowtimes.map((showtime) => (
              <motion.div
                key={showtime.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-secondary-800 rounded-lg p-4 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {showtime.movie?.movieName}
                    </h3>
                    <p className="text-sm text-secondary-400">
                      {showtime.movie?.duration} minutes
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-secondary-700 rounded-lg"
                      onClick={() => {
                        setSelectedShowtime(showtime);
                        setIsModalOpen(true);
                      }}
                    >
                      <Settings2 size={18} className="text-secondary-400" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-error-500/20 rounded-lg"
                      onClick={() => {
                        setSelectedShowtime(showtime);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 size={18} className="text-error-500" />
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                    <span>
                      {new Date(showtime.startTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-primary-500" />
                    <span>
                      {new Date(showtime.startTime).toLocaleTimeString()} - 
                      {new Date(showtime.endTime).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Building2 className="w-4 h-4 mr-2 text-primary-500" />
                    <span>
                      {showtime.cinema?.name} - {showtime.room?.name}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-secondary-700">
                  <span className="text-sm font-medium text-white">Price</span>
                  <motion.span 
                    whileHover={{ scale: 1.05 }}
                    className="text-primary-500"
                  >
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(showtime.price)}
                  </motion.span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Modals */}
        <ShowtimeManagementModal
          showtime={selectedShowtime || undefined}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedShowtime(null);
          }}
          onSave={handleSaveShowtime}
        />

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedShowtime(null);
          }}
          onConfirm={handleDeleteShowtime}
          title="Delete Showtime"
          message="Are you sure you want to delete this showtime? This action cannot be undone."
        />

        {selectedMovieForMultiple && (
          <MultipleShowtimeModal
            movie={selectedMovieForMultiple}
            isOpen={isMultipleModalOpen}
            onClose={() => {
              setIsMultipleModalOpen(false);
              setSelectedMovieForMultiple(null);
            }}
            onSave={handleSaveMultipleShowtimes}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ShowtimeManagement;