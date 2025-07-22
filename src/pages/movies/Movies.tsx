import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Star, Info, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import { movieService } from '../../services/modules/movie.service';
import { Movie } from '../../types/movie';

const Movies: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const response = await movieService.getAll();
        setMovies(response.data);
      } catch (err) {
        setError('Failed to fetch movies');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Genres lấy từ dữ liệu thực tế
  const genres = ['all', ...Array.from(new Set(movies.flatMap(movie => movie.movieTypes || [])))];

  const filteredMovies = movies
    .filter(movie => movie.status !== 'INACTIVE') // Don't show INACTIVE movies
    .filter(movie => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        (movie.movieName && movie.movieName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGenre = selectedGenre === 'all' || (movie.movieTypes && movie.movieTypes.includes(selectedGenre));
      // Status filter: "now-showing" = ACTIVE, "coming-soon" = UPCOMING, "all" = all except INACTIVE
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'now-showing' && movie.status === 'ACTIVE') ||
        (selectedStatus === 'coming-soon' && movie.status === 'UPCOMING');
      return matchesSearch && matchesGenre && matchesStatus;
    });

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-secondary-900 to-secondary-800"
      >
        <div className="container mx-auto px-4 py-8">
          {/* Header and Search Section */}
          <div className="space-y-6 mb-8">
            <motion.h1 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-4xl font-bold text-white"
            >
              Discover Movies
            </motion.h1>

            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-secondary-800/50 backdrop-blur-sm border border-secondary-700 rounded-xl text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>

              {/* Filter Button (Mobile) */}
              <Button
                className="lg:hidden"
                variant="secondary"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={20} className="mr-2" />
                Filters
              </Button>

              {/* Desktop Filters */}
              <div className="hidden lg:flex gap-4">

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 bg-secondary-800/50 backdrop-blur-sm border border-secondary-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="now-showing">Now Showing</option>
                  <option value="coming-soon">Upcoming</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="lg:hidden space-y-4 overflow-hidden"
                >

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary-800/50 backdrop-blur-sm border border-secondary-700 rounded-xl text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="now-showing">Now Showing</option>
                    <option value="coming-soon">Upcoming</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-secondary-400">
              Showing {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'}
            </p>
          </div>

          {/* Movies Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            <AnimatePresence>
              {filteredMovies.map((movie) => (
                <motion.div
                  key={movie.movieID}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className="bg-secondary-800/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl"
                >
                  <div 
                    className="relative aspect-[2/3] cursor-pointer group"
                    onClick={() => navigate(`/movies/${movie.movieID}`)}
                  >
                    {/* Status Tag */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        movie.status === 'ACTIVE'
                          ? 'bg-green-500/80 text-white'
                          : movie.status === 'UPCOMING'
                          ? 'bg-yellow-500/80 text-white'
                          : 'bg-blue-500/80 text-white'
                      }`}>
                        {movie.status === 'ACTIVE'
                          ? 'Now Showing'
                          : movie.status === 'UPCOMING'
                          ? 'Upcoming'
                          : 'Inactive'}
                      </span>
                    </div>

                    <img
                      src={movie.image}
                      alt={movie.movieName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/fallback-movie-poster.jpg'; // Add a fallback image
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <p className="text-white text-sm line-clamp-3">{movie.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-white hover:text-primary-400 cursor-pointer line-clamp-2"
                        onClick={() => navigate(`/movies/${movie.movieID}`)}
                    >
                      {movie.movieName}
                    </h3>

                    <div className="flex items-center justify-between text-secondary-300">
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        <span>{movie.duration} min</span>
                      </div>
                      <div className="flex items-center">
                        <Star size={16} className="mr-1 text-yellow-500" />
                        <span>1</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate(`/movies/${movie.movieID}`)}
                      fullWidth
                      leftIcon={<Info size={18} />}
                      className="bg-primary-600 hover:bg-primary-500 text-white transition-all duration-300 rounded-xl py-3"
                    >
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* No Results */}
          {filteredMovies.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-secondary-400 text-lg">No movies found matching your criteria</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </Layout>
  );
};

export default Movies;