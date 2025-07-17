import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Film, Plus, Trash2 } from 'lucide-react';
import { cinemaService } from '../../services/modules/cinema.service';
import { movieService } from '../../services/modules/movie.service';
import { movieCinemaService } from '../../services/modules/movieCinema.service';
import { toast } from 'react-hot-toast';

const MovieCinemaManangement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cinemaIdParam = params.get('cinemaId') || '';

  const [cinemas, setCinemas] = useState<any[]>([]);
  const [cinema, setCinema] = useState<any>(null);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>(cinemaIdParam);
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [cinemaMovies, setCinemaMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch all cinemas and all movies on mount
  useEffect(() => {
    const fetchCinemasAndMovies = async () => {
      setLoading(true);
      try {
        const [cinemaRes, moviesRes] = await Promise.all([
          cinemaService.getAll(),
          movieService.getAll()
        ]);
        setCinemas(Array.isArray(cinemaRes.data) ? cinemaRes.data : []);
        setAllMovies(Array.isArray(moviesRes.data) ? moviesRes.data : []);
      } catch (err) {
        setCinemas([]);
        setAllMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCinemasAndMovies();
  }, []);

  // Fetch selected cinema and its movies
  useEffect(() => {
    if (!selectedCinemaId) {
      setCinema(null);
      setCinemaMovies([]);
      return;
    }
    setLoading(true);
    const fetchCinemaMovies = async () => {
      try {
        const foundCinema = cinemas.find((c: any) => c.cinemaid === selectedCinemaId);
        setCinema(foundCinema);
        if (foundCinema) {
          const cinemaMoviesRes = await movieCinemaService.getMoviesByCinema(foundCinema.cinemaid);
          setCinemaMovies(Array.isArray(cinemaMoviesRes.data) ? cinemaMoviesRes.data : []);
        } else {
          setCinemaMovies([]);
        }
      } catch {
        setCinema(null);
        setCinemaMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCinemaMovies();
  }, [selectedCinemaId, cinemas]);

  // Add movie to cinema
  const handleAddMovie = async (movieId: string) => {
    setAddingId(movieId);
    try {
      await movieCinemaService.addMoviesToCinema(selectedCinemaId, [movieId]);
      toast.success('Movie added to cinema');
      // Refresh cinema movies
      const res = await movieCinemaService.getMoviesByCinema(selectedCinemaId);
      setCinemaMovies(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to add movie');
    } finally {
      setAddingId(null);
    }
  };

  // Remove movie from cinema
  const handleRemoveMovie = async (movieId: string) => {
    setRemovingId(movieId);
    try {
      await movieCinemaService.removeMovieFromCinema(selectedCinemaId, movieId);
      toast.success('Movie removed from cinema');
      // Refresh cinema movies
      const res = await movieCinemaService.getMoviesByCinema(selectedCinemaId);
      setCinemaMovies(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to remove movie');
    } finally {
      setRemovingId(null);
    }
  };

  // Filter available movies (not already in cinema)
  const availableMovies = allMovies
    .filter(m => m.status !== 'INACTIVE')
    .filter(m => !cinemaMovies.some(cm => cm.movieID === m.movieID));
  const filteredAvailableMovies = availableMovies.filter(m =>
    (m.movieName || '').toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="px-6 pt-4 flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate('/admin/cinemas')}
          className="group flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-600/30 hover:border-slate-500/50"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Cinema Management
        </button>
        {/* Cinema Selector */}
        <div className="flex items-center gap-2 ml-4">
          <span className="text-white text-sm font-medium">Cinema:</span>
          <div className="relative group">
            <select
              value={selectedCinemaId}
              onChange={e => setSelectedCinemaId(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 rounded-lg bg-secondary-700 text-white border border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition font-semibold shadow hover:border-primary-400"
            >
              <option value="" disabled>
                Select Cinema
              </option>
              {cinemas.map(c => (
                <option key={c.cinemaid} value={c.cinemaid}>
                  {c.cinemaname}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 group-hover:text-primary-300 transition">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-secondary-800 border-b border-secondary-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Movie Management</h1>
            <p className="text-secondary-300 text-sm mt-1">
              {cinema && (
                <span className="font-semibold text-primary-400">{cinema.cinemaname}</span>
              )}
            </p>
            <p className="text-secondary-300 text-sm mt-1">
              Add or remove movies for this cinema
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-500/20 rounded">
                <Film className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-secondary-400">Total Movies</p>
                <p className="text-sm font-semibold text-white">{allMovies.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-green-500/20 rounded">
                <Film className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-secondary-400">In Cinema</p>
                <p className="text-sm font-semibold text-white">{cinemaMovies.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Available Movies */}
        <div className="w-80 bg-secondary-800 border-r border-secondary-600 h-full overflow-y-auto flex-shrink-0 shadow-xl">
          <div className="p-4 border-b border-secondary-600 bg-gradient-to-r from-secondary-800 to-secondary-750">
            <h2 className="text-lg font-bold text-white mb-2">Available Movies</h2>
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded bg-secondary-700 text-white border border-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="text-xs text-secondary-500 mt-2">
              {filteredAvailableMovies.length} available
            </div>
          </div>
          <div className="p-4 grid grid-cols-3 gap-2">
            {filteredAvailableMovies.map(movie => (
              <div
                key={movie.movieID}
                className="bg-secondary-700/60 border border-secondary-600 rounded-lg p-2 flex flex-col items-center"
              >
                <img
                  src={movie.image}
                  alt={movie.movieName}
                  className="w-10 h-14 object-cover rounded shadow mb-1"
                  draggable={false}
                />
                <div className="w-full min-w-0 text-center">
                  <div className="font-semibold text-white text-xs truncate">{movie.movieName}</div>
                  <div className="text-[10px] text-secondary-400 truncate">{movie.movieTypes}</div>
                  <div className="text-[10px] text-secondary-500">{movie.duration} min</div>
                </div>
                <button
                  onClick={() => handleAddMovie(movie.movieID)}
                  disabled={addingId === movie.movieID || !selectedCinemaId}
                  className={`mt-1 p-1 rounded bg-primary-600 text-white hover:bg-primary-500 transition text-xs ${
                    addingId === movie.movieID || !selectedCinemaId ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Add to Cinema"
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main: Movies in Cinema */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-lg font-bold text-white mb-4">Movies in this Cinema</h3>
          {!selectedCinemaId ? (
            <div className="text-center py-16 text-secondary-400">
              <div className="text-4xl mb-2">🏢</div>
              <p>Please select a cinema to manage its movies.</p>
            </div>
          ) : cinemaMovies.length === 0 ? (
            <div className="text-center py-16 text-secondary-400">
              <div className="text-4xl mb-2">🎬</div>
              <p>No movies currently assigned to this cinema.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {cinemaMovies.map(movie => (
                <div
                  key={movie.movieID}
                  className="bg-secondary-800 border border-secondary-700 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center p-2"
                  style={{ minWidth: 0 }}
                >
                  <div className="w-24 h-36 bg-secondary-700 rounded-md overflow-hidden flex items-center justify-center mb-2">
                    {movie.image ? (
                      <img
                        src={movie.image}
                        alt={movie.movieName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-secondary-500 text-3xl">🎬</div>
                    )}
                  </div>
                  <div className="w-full flex-1 flex flex-col items-center">
                    <h4
                      className="font-semibold text-white text-xs text-center mb-1 truncate w-full"
                      title={movie.movieName}
                    >
                      {movie.movieName}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium mb-1 ${
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
                    <span className="text-[10px] text-secondary-400 mb-2">{movie.duration} min</span>
                  </div>
                  <button
                    onClick={() => handleRemoveMovie(movie.movieID)}
                    disabled={removingId === movie.movieID}
                    className={`w-full py-1 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                      removingId === movie.movieID
                        ? 'bg-red-900 text-red-400 cursor-not-allowed'
                        : 'bg-red-800 text-red-200 hover:bg-red-700'
                    }`}
                  >
                    {removingId === movie.movieID ? 'Removing...' : (
                      <>
                        <Trash2 size={14} /> Remove
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCinemaManangement;