import React, { useEffect, useState } from 'react';
import { movieCinemaService } from '../../services/modules/movieCinema.service';
import { movieService } from '../../services/modules/movie.service';
import { toast } from 'react-hot-toast';

interface Props {
  cinema: { cinemaid: string; cinemaname: string };
  isOpen: boolean;
  onClose: () => void;
}

const MovieCinemaManagementModal: React.FC<Props> = ({ cinema, isOpen, onClose }) => {
  const [movies, setMovies] = useState<any[]>([]);
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (cinema && isOpen) {
      setLoading(true);
      Promise.all([
        movieCinemaService.getMoviesByCinema(cinema.cinemaid)
          .then(res => setMovies(Array.isArray(res.data) ? res.data : []))
          .catch(() => setMovies([])),
        movieService.getAll()
          .then(res => setAllMovies(Array.isArray(res.data) ? res.data : []))
          .catch(() => setAllMovies([]))
      ]).finally(() => setLoading(false));
    }
  }, [cinema, isOpen]);

  const handleAddMovie = async (movieId: string) => {
    setAddingId(movieId);
    console.log('Adding movie:', movieId, "///", "Cinema ID:", cinema.cinemaid);
    try {
      await movieCinemaService.addMoviesToCinema(cinema.cinemaid, [movieId]);
      toast.success('Movie added successfully');
      const res = await movieCinemaService.getMoviesByCinema(cinema.cinemaid);
      setMovies(res.data as any[]);
    } catch (error) {
      toast.error('Failed to add movie');
    } finally {
      setAddingId(null);
    }
  };

  const handleRemoveMovie = async (movieId: string) => {
    setRemovingId(movieId);
    try {
      await movieCinemaService.removeMovieFromCinema(cinema.cinemaid, movieId);
      toast.success('Movie removed successfully');
      try {
        const res = await movieCinemaService.getMoviesByCinema(cinema.cinemaid);
        setMovies(res.data as any[]);
      } catch (err: any) {
        // If 404, treat as empty list
        if (err?.response?.status === 404) {
          setMovies([]);
        } else {
          throw err;
        }
      }
    } catch (error) {
      toast.error('Failed to remove movie');
    } finally {
      setRemovingId(null);
    }
  };

  const availableMovies = allMovies
    .filter(m => m.status !== 'INACTIVE') // Exclude INACTIVE movies
    .filter(m => !movies.some(cm => cm.movieID === m.movieID));
  const filteredAvailableMovies = availableMovies.filter(m => 
    (m.movieName || '').toLowerCase().includes(search.toLowerCase())
  );

  return isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold transition-colors"
            aria-label="Close"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold pr-8">
            Manage Movies for <span className="text-blue-300">{cinema.cinemaname}</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {/* Current Movies Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-100 flex items-center">
                <span className="bg-green-900 text-green-300 px-2 py-1 rounded-full text-sm mr-2">
                  {movies.length}
                </span>
                Current Movies
              </h3>
              
              {movies.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🎬</div>
                  <p>No movies currently showing in this cinema</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {movies.map(movie => (
                    <div key={movie.movieID} className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-[2/3] bg-gray-700 rounded-t-lg overflow-hidden">
                        {movie.image ? (
                          <img 
                            src={movie.image} 
                            alt={movie.movieName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🎬</div>
                              <p className="text-sm">No Image</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-lg text-white mb-2 line-clamp-2" title={movie.movieName}>
                          {movie.movieName}
                        </h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            movie.status === 'ACTIVE'
                              ? 'bg-green-900 text-green-300'
                              : movie.status === 'UPCOMING'
                              ? 'bg-yellow-900 text-yellow-300'
                              : 'bg-blue-900 text-blue-300'
                          }`}>
                            {movie.status === 'ACTIVE'
                              ? 'Now Showing'
                              : movie.status === 'UPCOMING'
                              ? 'Upcoming'
                              : 'Complete'}
                          </span>
                          <span className="text-xs text-gray-300">{movie.duration} min</span>
                        </div>
                        <button
                          onClick={() => handleRemoveMovie(movie.movieID)}
                          disabled={removingId === movie.movieID}
                          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            removingId === movie.movieID
                              ? 'bg-red-900 text-red-400 cursor-not-allowed'
                              : 'bg-red-800 text-red-200 hover:bg-red-700'
                          }`}
                        >
                          {removingId === movie.movieID ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Movies Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-100 flex items-center">
                  <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded-full text-sm mr-2">
                    {filteredAvailableMovies.length}
                  </span>
                  Available Movies
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {filteredAvailableMovies.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🔍</div>
                  <p>{search ? 'No movies found matching your search' : 'All movies are already added to this cinema'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredAvailableMovies.map(movie => (
                    <div key={movie.movieID} className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-[2/3] bg-gray-700 rounded-t-lg overflow-hidden">
                        {movie.image ? (
                          <img 
                            src={movie.image} 
                            alt={movie.movieName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🎬</div>
                              <p className="text-sm">No Image</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-lg text-white mb-2 line-clamp-2" title={movie.movieName}>
                          {movie.movieName}
                        </h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            movie.status === 'ACTIVE'
                              ? 'bg-green-900 text-green-300'
                              : movie.status === 'UPCOMING'
                              ? 'bg-yellow-900 text-yellow-300'
                              : 'bg-blue-900 text-blue-300'
                          }`}>
                            {movie.status === 'ACTIVE'
                              ? 'Now Showing'
                              : movie.status === 'UPCOMING'
                              ? 'Upcoming'
                              : 'Complete'}
                          </span>
                          <span className="text-xs text-gray-300">{movie.duration} min</span>
                        </div>
                        <button
                          onClick={() => handleAddMovie(movie.movieID)}
                          disabled={addingId === movie.movieId}
                          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            addingId === movie.movieId
                              ? 'bg-blue-900 text-blue-400 cursor-not-allowed'
                              : 'bg-blue-800 text-blue-200 hover:bg-blue-700'
                          }`}
                        >
                          {addingId === movie.movieId ? 'Adding...' : 'Add to Cinema'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default MovieCinemaManagementModal;