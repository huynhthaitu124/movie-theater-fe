import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, AlertCircle, Calendar, Loader2 } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';
import { Movie } from '../../../types/movie';
import { movieService } from '../../../services/modules/movie.service';

const MovieList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const response = await movieService.getAll();
      console.log('Fetched movies:', response);
      setMovies(response.data);
    } catch (err) {
      setError('Failed to fetch movies');
      console.error('Error fetching movies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMovies = movies
    .filter(movie => movie.status === 'ACTIVE')
    .filter(movie =>
      movie.movieName && movie.movieName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement delete API call when the endpoint is ready
      setShowDeleteModal(false);
      setSelectedMovie(null);
      // After successful deletion, refresh the movie list
      await fetchMovies();
    } catch (error) {
      console.error('Failed to delete movie:', error);
      setError('Failed to delete movie');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Movie Management</h1>
          <Button
            onClick={() => navigate('/admin/movies/add')}
            className="flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Movie
          </Button>
        </div>

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

        {error && (
          <div className="bg-error-900/50 text-error-300 p-4 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
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
                        : 'bg-primary-500 text-white'
                    }`}>
                      {movie.status === 'ACTIVE' ? 'Now Showing' : 'Coming Soon'}
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

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => navigate(`/admin/movies/edit/${movie.movieID}`)}
                      className="p-2 text-primary-500 hover:bg-secondary-700 rounded-full"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMovie(movie.movieID);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-accent-500 hover:bg-secondary-700 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-secondary-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center text-accent-500 mb-4">
                <AlertCircle size={24} className="mr-2" />
                <h3 className="text-lg font-medium">Confirm Delete</h3>
              </div>
              <p className="text-secondary-300 mb-6">
                Are you sure you want to delete this movie? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="accent"
                  onClick={() => selectedMovie && handleDelete(selectedMovie)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MovieList;