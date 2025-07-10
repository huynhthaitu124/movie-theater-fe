import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import StaffLayout from '../../../components/layout/StaffLayout';
import { Movie } from '../../../types/movie';
import { movieService } from '../../../services/modules/movie.service';

const StaffMovieList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'UPCOMING'>('ALL');

  useEffect(() => {
    fetchMovies();
  }, []);

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

  const filteredMovies = movies
    .filter(movie => {
      if (statusFilter === 'ALL') return true;
      return movie.status === statusFilter;
    })
    .filter(movie =>
      movie.movieName && movie.movieName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <StaffLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Movies</h1>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center bg-secondary-800 rounded-lg px-4 py-2 w-full md:w-96">
            <Search size={20} className="text-secondary-400" />
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-white ml-2 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE' | 'UPCOMING')}
            className="bg-secondary-800 text-white rounded-lg px-4 py-2 border border-secondary-700 focus:outline-none"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Now Showing</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {error && (
          <div className="bg-error-900/50 text-error-300 p-4 rounded-lg flex items-center">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <span className="text-primary-500">Loading...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <div key={movie.movieID} className="bg-secondary-800 rounded-lg overflow-hidden shadow-md">
                <div className="aspect-[2/3] relative">
                  <img
                    src={movie.image || '/images/placeholder.jpg'}
                    alt={movie.movieName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      movie.status === 'ACTIVE'
                        ? 'bg-success-500 text-white'
                        : movie.status === 'UPCOMING'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-primary-500 text-white'
                    }`}>
                      {movie.status === 'ACTIVE'
                        ? 'Now Showing'
                        : movie.status === 'UPCOMING'
                        ? 'Upcoming'
                        : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{movie.movieName}</h3>
                  <div className="space-y-2 text-sm text-secondary-300">
                    <p>Duration: {movie.duration} min</p>
                    {typeof movie.minimumAge === 'number' && <p>Age Rating: {movie.minimumAge}+</p>}
                    <p>Language: {movie.movieLanguage}</p>
                    <p>Release: {movie.createdAt ? new Date(movie.createdAt).toLocaleDateString() : ''}</p>
                    <div className="flex flex-wrap gap-1">
                      {movie.movieTypes && movie.movieTypes.split(',').map((type, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 bg-secondary-700 rounded-full text-xs"
                        >
                          {type.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffMovieList;