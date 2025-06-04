import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, AlertCircle, Film } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';

interface Movie {
  id: string;
  title: string;
  genre: string[];
  duration: number;
  releaseDate: string;
  status: 'now-showing' | 'coming-soon';
  rating: number;
  posterUrl: string;
}

const MovieList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);

  // Mock data
  const movies: Movie[] = [
    {
      id: 'MOV001',
      title: 'The Dark Universe',
      genre: ['Action', 'Sci-Fi'],
      duration: 142,
      releaseDate: '2024-03-15',
      status: 'now-showing',
      rating: 4.5,
      posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'
    },
    // Add more movies...
  ];

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement delete API call
      setShowDeleteModal(false);
      setSelectedMovie(null);
    } catch (error) {
      console.error('Failed to delete movie:', error);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="bg-secondary-800 rounded-lg overflow-hidden shadow-md">
              <div className="aspect-[2/3] relative">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    movie.status === 'now-showing' 
                      ? 'bg-success-500 text-white' 
                      : 'bg-primary-500 text-white'
                  }`}>
                    {movie.status === 'now-showing' ? 'Now Showing' : 'Coming Soon'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{movie.title}</h3>
                <div className="space-y-2 text-sm text-secondary-300">
                  <p>Duration: {movie.duration} min</p>
                  <p>Rating: {movie.rating.toFixed(1)}/5.0</p>
                  <p>Release: {new Date(movie.releaseDate).toLocaleDateString()}</p>
                  <div className="flex flex-wrap gap-1">
                    {movie.genre.map((g, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-secondary-700 rounded-full text-xs"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => navigate(`/admin/movies/edit/${movie.id}`)}
                    className="p-2 text-primary-500 hover:bg-secondary-700 rounded-full"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMovie(movie.id);
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