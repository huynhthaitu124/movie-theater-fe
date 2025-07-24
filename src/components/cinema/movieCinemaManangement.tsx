import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building2, ArrowLeft, Loader2, Film, Plus, Trash2 } from 'lucide-react';
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
  const [selectedCity, setSelectedCity] = useState<string>('');

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
        console.log('Cinemas:', cinemaRes.data);
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

  // Extract unique cities from cinemas
  const cityOptions = Array.from(new Set(cinemas.map(c => c.city))).filter(Boolean);

  // Filter cinemas by selected city
  const filteredCinemas = selectedCity
    ? cinemas.filter(c => c.city === selectedCity)
    : cinemas;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with Navigation */}
      <div className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/admin/cinemas')}
                className="group flex items-center gap-3 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-slate-600/30 hover:border-slate-500/50 hover:shadow-lg"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to Cinema Management
              </button>
              
              <div className="flex items-center gap-4">
                {/* City Selector */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">City</span>
                  </div>
                  <select
                    value={selectedCity}
                    onChange={e => {
                      setSelectedCity(e.target.value);
                      setSelectedCinemaId(''); // Reset cinema when city changes
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-700/70 text-white border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 font-medium shadow-lg backdrop-blur-sm hover:bg-slate-700/90 min-w-[160px]"
                  >
                    <option value="">Select City</option>
                    {cityOptions.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Cinema Selector */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">Cinema</span>
                  </div>
                  <select
                    value={selectedCinemaId}
                    onChange={e => setSelectedCinemaId(e.target.value)}
                    disabled={!selectedCity}
                    className="px-4 py-2.5 rounded-xl bg-slate-700/70 text-white border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 font-medium shadow-lg backdrop-blur-sm hover:bg-slate-700/90 min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {selectedCity ? 'Select Cinema' : 'Choose city first'}
                    </option>
                    {filteredCinemas.map(c => (
                      <option key={c.cinemaid} value={c.cinemaid}>
                        {c.cinemaname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Film className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Total Movies</p>
                  <p className="text-lg font-bold text-white">{allMovies.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Film className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">In Cinema</p>
                  <p className="text-lg font-bold text-white">{cinemaMovies.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-white">Movie Management</h1>
            {cinema && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-slate-400">Managing movies for</span>
                <span className="font-semibold text-purple-400">{cinema.cinemaname}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{cinema.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-180px)]">
        {/* Sidebar: Available Movies */}
        <div className="w-1/3 bg-slate-800/40 backdrop-blur-xl border-r border-slate-700/50 flex flex-col">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-400" />
              Available Movies
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search movies..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-700/50 text-white border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-slate-400"
              />
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-slate-400">
                {filteredAvailableMovies.length} movies available
              </span>
              {!selectedCinemaId && (
                <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                  Select cinema to add movies
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-4 gap-4">
              {filteredAvailableMovies.map(movie => (
                <div
                  key={movie.movieID}
                  className="group bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 rounded-xl p-3 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col h-full min-h-[210px]"
                >
                  <div className="relative mb-3">
                    <img
                      src={movie.image}
                      alt={movie.movieName}
                      className="w-full h-24 object-cover rounded-lg shadow-md"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">
                      {movie.movieName}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{movie.movieTypes}</p>
                    <p className="text-xs text-slate-500">{movie.duration} min</p>
                  </div>
                  
                  <button
                    onClick={() => handleAddMovie(movie.movieID)}
                    disabled={addingId === movie.movieID || !selectedCinemaId}
                    className={`w-full mt-3 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      addingId === movie.movieID || !selectedCinemaId
                        ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/25 group-hover:scale-105'
                    }`}
                  >
                    {addingId === movie.movieID ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add to Cinema
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main: Movies in Cinema */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-400" />
              Movies in Cinema
            </h3>
            
            {!selectedCinemaId ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                  <Building2 className="w-10 h-10 text-slate-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">Select a Cinema</h4>
                <p className="text-slate-400 max-w-md">
                  Choose a city and cinema from the dropdowns above to view and manage its movie collection.
                </p>
              </div>
            ) : cinemaMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                  <Film className="w-10 h-10 text-slate-400" />
                </div>
                <h4 className="text-xl font-semibold text-white mb-2">No Movies Yet</h4>
                <p className="text-slate-400 max-w-md">
                  This cinema doesn't have any movies assigned. Add movies from the available collection on the left.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {cinemaMovies.map(movie => (
                  <div
                    key={movie.movieID}
                    className="group bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-slate-600/50 rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] backdrop-blur-sm flex flex-col h-full min-h-[260px]"
                  >
                    <div className="relative mb-4">
                      <div className="aspect-[3/4] bg-slate-700/50 rounded-lg overflow-hidden">
                        {movie.image ? (
                          <img
                            src={movie.image}
                            alt={movie.movieName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                        movie.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : movie.status === 'UPCOMING'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {movie.status === 'ACTIVE'
                          ? 'Active'
                          : movie.status === 'UPCOMING'
                          ? 'Soon'
                          : 'Complete'}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4 flex-1">
                      <h4 className="font-semibold text-white text-sm leading-tight line-clamp-2" title={movie.movieName}>
                        {movie.movieName}
                      </h4>
                      <p className="text-xs text-slate-400">{movie.duration} min</p>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveMovie(movie.movieID)}
                      disabled={removingId === movie.movieID}
                      className={`w-full py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        removingId === movie.movieID
                          ? 'bg-red-900/50 text-red-400 cursor-not-allowed'
                          : 'bg-red-600/80 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/25 group-hover:scale-105'
                      }`}
                    >
                      {removingId === movie.movieID ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Remove
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
    </div>
  );
};

export default MovieCinemaManangement;