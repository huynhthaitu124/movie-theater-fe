import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

interface MovieFormData {
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  genre: string[];
  status: 'now-showing' | 'coming-soon';
  rating: number;
  poster: File | null;
  posterUrl: string;
  director: string;
  cast: string[];
  language: string;
}

const AddEditMovie: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    description: '',
    duration: 0,
    releaseDate: '',
    genre: [],
    status: 'coming-soon',
    rating: 0,
    poster: null,
    posterUrl: '',
    director: '',
    cast: [],
    language: ''
  });

  const genres = [
      'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
      'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
      'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
    ];
  
    const mockMovies = [
      {
        id: '1',
        title: 'Sample Movie',
        description: 'Sample description',
        duration: 120,
        releaseDate: '2024-01-01',
        genre: ['Action', 'Adventure'],
        status: 'now-showing' as const,
        rating: 4.5,
        posterUrl: 'https://example.com/poster.jpg',
        director: 'John Doe',
        cast: ['Actor 1', 'Actor 2'],
        language: 'English'
      }
    ];

  useEffect(() => {
    if (isEditMode) {
      // Fetch movie data for editing
      const fetchMovie = async () => {
        try {
          // TODO: Replace with actual API call
          const movie = mockMovies.find(m => m.id === id);
          if (movie) {
            setFormData({
              ...formData,
              ...movie,
              poster: null
            });
            setPosterPreview(movie.posterUrl);
          }
        } catch (error) {
          setError('Failed to fetch movie data');
        }
      };
      fetchMovie();
    }
  }, [id]);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, poster: file });
      const reader = new FileReader();
      reader.onload = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenreChange = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }));
  };

  const handleCastChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const castList = e.target.value.split('\n').filter(Boolean);
    setFormData(prev => ({
      ...prev,
      cast: castList
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.duration) {
        throw new Error('Please fill in all required fields');
      }

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      navigate('/admin/movies', {
        state: { message: `Movie ${isEditMode ? 'updated' : 'added'} successfully` }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save movie');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-secondary-300 hover:text-white mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? 'Edit Movie' : 'Add New Movie'}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-accent-900 text-accent-300 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-secondary-800 rounded-lg p-6">
            {/* Poster Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Movie Poster
              </label>
              <div className="flex items-center space-x-6">
                <div className="w-48 h-72 rounded-lg overflow-hidden bg-secondary-700">
                  {posterPreview ? (
                    <img
                      src={posterPreview}
                      alt="Poster preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary-400">
                      <Upload size={24} />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="hidden"
                    id="poster-upload"
                  />
                  <label
                    htmlFor="poster-upload"
                    className="cursor-pointer inline-block px-4 py-2 border border-secondary-600 rounded-lg text-secondary-300 hover:border-primary-500 hover:text-primary-500"
                  >
                    Choose Poster
                  </label>
                  <p className="text-sm text-secondary-400">
                    Recommended size: 500x750px
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Duration (minutes)"
                type="number"
                name="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                required
              />

              <Input
                label="Release Date"
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                required
              />
            </div>

            {/* Genres */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-300">
                Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreChange(genre)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.genre.includes(genre)
                        ? 'bg-primary-500 text-white'
                        : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-300">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  status: e.target.value as 'now-showing' | 'coming-soon'
                })}
                className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="coming-soon">Coming Soon</option>
                <option value="now-showing">Now Showing</option>
              </select>
            </div>

            {/* Additional Information */}
            <Input
              label="Director"
              name="director"
              value={formData.director}
              onChange={(e) => setFormData({ ...formData, director: e.target.value })}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-300">
                Cast (one per line)
              </label>
              <textarea
                value={formData.cast.join('\n')}
                onChange={handleCastChange}
                rows={4}
                className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                placeholder="Enter cast members (one per line)"
              />
            </div>

            <Input
              label="Language"
              name="language"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              {isEditMode ? 'Update Movie' : 'Add Movie'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddEditMovie;