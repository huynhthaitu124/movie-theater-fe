import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle, Save, X, Plus, Trash2, Eye } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { movieService } from '../../../services/modules/movie.service';
import { cloudinaryService } from '../../../services/modules/cloudinary.service';

interface MovieFormData {
  movieName: string;
  description: string;
  actor: string;
  director: string;
  productionCompany: string;
  duration: number;
  image: File | null;
  trailer: string;
  minimumAge: number;
  dubbing: boolean;
  movieTypes: string;
  subtitleID: string;
  movieLanguage: string;
  status: string;
}

const AddEditMovie: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentActor, setCurrentActor] = useState('');
  const [currentGenre, setCurrentGenre] = useState('');
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<MovieFormData>({
    movieName: '',
    description: '',
    actor: '',
    director: '',
    productionCompany: '',
    duration: 0,
    image: null,
    trailer: '',
    minimumAge: 13,
    dubbing: false,
    movieTypes: '',
    subtitleID: '',
    movieLanguage: '',
    status: 'INACTIVE'
  });

  const commonGenres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
  ];

  const languages = [
    'English', 'Vietnamese', 'Chinese', 'Japanese', 'Korean',
    'French', 'Spanish', 'German', 'Italian', 'Russian'
  ];

  const ageRatings = [
    { value: 0, label: 'All Ages (G)' },
    { value: 13, label: 'Teen 13+ (PG-13)' },
    { value: 16, label: 'Mature 16+ (R)' },
    { value: 18, label: 'Adults Only 18+ (NC-17)' }
  ];

  // Fetch movie data in edit mode
  useEffect(() => {
    const fetchMovie = async () => {
      if (!isEditMode || !id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const res = await movieService.getAll();
        const movie = res.data.find((m: any) => m.movieID === id);
        
        if (movie) {
          setFormData({
            movieName: movie.movieName || '',
            description: movie.description || '',
            actor: movie.actor || '',
            director: movie.director || '',
            productionCompany: movie.productionCompany || '',
            duration: movie.duration || 0,
            image: null,
            trailer: movie.trailer || '',
            minimumAge: movie.minimumAge || 13,
            dubbing: movie.dubbing || false,
            movieTypes: Array.isArray(movie.movieTypes) ? movie.movieTypes.join(',') : (movie.movieTypes || ''),
            subtitleID: movie.subtitleID || '',
            movieLanguage: movie.movieLanguage || '',
            status: movie.status || 'INACTIVE'
          });
          setImagePreview(movie.image);
        } else {
          setError('Movie not found');
          navigate('/admin/movies');
        }
      } catch (err) {
        setError('Failed to fetch movie data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [id, isEditMode, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addActor = () => {
    if (currentActor.trim()) {
      const currentActors = formData.actor ? formData.actor.split(', ') : [];
      if (!currentActors.includes(currentActor.trim())) {
        setFormData({
          ...formData,
          actor: [...currentActors, currentActor.trim()].join(', ')
        });
      }
      setCurrentActor('');
    }
  };

  const removeActor = (actorToRemove: string) => {
    const actors = formData.actor.split(', ').filter(actor => actor !== actorToRemove);
    setFormData({ ...formData, actor: actors.join(', ') });
  };

  const addGenre = () => {
    if (currentGenre && !formData.movieTypes.includes(currentGenre)) {
      const genres = formData.movieTypes ? formData.movieTypes.split(',') : [];
      const updatedGenres = [...genres, currentGenre].filter(Boolean);
      setFormData({
        ...formData,
        movieTypes: updatedGenres.join(',')
      });
      setCurrentGenre('');
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setFormData({
      ...formData,
      movieTypes: formData.movieTypes
        .split(',')
        .filter(genre => genre !== genreToRemove)
        .join(',')
    });
  };

  const validateForm = () => {
    if (!formData.movieName.trim()) return 'Movie name is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.director.trim()) return 'Director is required';
    if (formData.duration <= 0) return 'Duration must be greater than 0';
    if (formData.movieTypes.length === 0) return 'At least one genre is required';
    if (!formData.movieLanguage) return 'Language is required';
    
    // Validate YouTube URL
    if (formData.trailer && !formData.trailer.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
      return 'Please enter a valid YouTube URL';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.trailer.trim()) {
      setError('Trailer URL is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let imageUrl = imagePreview || '';
      // If a new image file is selected, upload to Cloudinary
      if (formData.image instanceof File && formData.image) {
        const uploadRes = await cloudinaryService.upload(formData.image);
        imageUrl = uploadRes.url;
      }

      // Build payload and omit subtitleID if empty/null
      const payload: any = {
        movieName: formData.movieName,
        description: formData.description,
        actor: formData.actor,
        director: formData.director,
        productionCompany: formData.productionCompany,
        duration: Number(formData.duration),
        image: imageUrl,
        trailer: formData.trailer,
        minimumAge: Number(formData.minimumAge),
        dubbing: Boolean(formData.dubbing),
        movieTypes: formData.movieTypes,
        movieLanguage: formData.movieLanguage,
        status: formData.status,
      };
      if (formData.subtitleID && formData.subtitleID.trim() !== '') {
        payload.subtitleID = formData.subtitleID;
      }

      console.log(payload); // Debug: check the payload before sending

      if (isEditMode && id) {
        await movieService.update(id, payload);
        setSuccess('Movie updated successfully!');
      } else {
        await movieService.create(payload);
        setSuccess('Movie created successfully!');
      }

      setTimeout(() => {
        navigate('/admin/movies');
      }, 2000);

    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to save movie');
    } finally {
      setIsLoading(false);
    }
  };

  const getActorsList = () => {
    return formData.actor ? formData.actor.split(', ').filter(Boolean) : [];
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="text-secondary-300 hover:text-white mr-4 p-2 rounded-lg hover:bg-secondary-700 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isEditMode ? 'Edit Movie' : 'Add New Movie'}
              </h1>
              <p className="text-secondary-300 mt-1">
                {isEditMode ? 'Update movie information' : 'Create a new movie entry'}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              type="button"
            >
              <X size={18} className="mr-2" />
              Cancel
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-500 text-green-300 rounded-lg flex items-center">
            <div className="w-5 h-5 mr-3 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image Upload */}
            <div className="lg:col-span-1">
              <div className="bg-secondary-800 rounded-xl p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-white mb-4">Movie Poster</h3>
                
                <div className="space-y-4">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-secondary-700 border-2 border-dashed border-secondary-600">
                    {imagePreview ? (
                      <div className="relative w-full h-full group">
                        <img
                          src={imagePreview}
                          alt="Movie poster preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => document.getElementById('image-upload')?.click()}
                            className="text-white hover:text-primary-400"
                          >
                            <Eye size={24} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-secondary-400">
                        <Upload size={32} className="mb-2" />
                        <p className="text-sm text-center">Click to upload poster</p>
                        <p className="text-xs text-center mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer w-full inline-flex items-center justify-center px-4 py-2 border border-secondary-600 rounded-lg text-secondary-300 hover:border-primary-500 hover:text-primary-400 transition-colors"
                  >
                    <Upload size={18} className="mr-2" />
                    {imagePreview ? 'Change Poster' : 'Upload Poster'}
                  </label>
                  
                  <p className="text-xs text-secondary-400">
                    Recommended: 500×750px, Max: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-secondary-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Movie Name *"
                      name="movieName"
                      value={formData.movieName}
                      onChange={(e) => setFormData({ ...formData, movieName: e.target.value })}
                      placeholder="Enter movie title"
                      required
                    />
                  </div>
                  
                  <Input
                    label="Director *"
                    name="director"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    placeholder="Enter director name"
                    required
                  />
                  
                  <Input
                    label="Production Company"
                    name="productionCompany"
                    value={formData.productionCompany}
                    onChange={(e) => setFormData({ ...formData, productionCompany: e.target.value })}
                    placeholder="Enter production company"
                  />
                  
                  <Input
                    label="Duration (minutes) *"
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    placeholder="Enter duration"
                    min="1"
                    required
                  />
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary-300">
                      Language *
                    </label>
                    <select
                      value={formData.movieLanguage}
                      onChange={(e) => setFormData({ ...formData, movieLanguage: e.target.value })}
                      className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      required
                    >
                      <option value="">Select language</option>
                      {languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary-300">
                      Age Rating
                    </label>
                    <select
                      value={formData.minimumAge}
                      onChange={(e) => setFormData({ ...formData, minimumAge: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      {ageRatings.map(rating => (
                        <option key={rating.value} value={rating.value}>
                          {rating.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-secondary-300">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500 resize-none"
                      placeholder="Enter movie description..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Cast & Crew */}
              <div className="bg-secondary-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Cast & Crew</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary-300">
                      Cast Members
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={currentActor}
                        onChange={(e) => setCurrentActor(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addActor())}
                        placeholder="Enter actor name"
                        className="flex-1 px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={addActor}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    
                    {getActorsList().length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {getActorsList().map((actor, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-700 text-secondary-200"
                          >
                            {actor}
                            <button
                              type="button"
                              onClick={() => removeActor(actor)}
                              className="ml-2 text-secondary-400 hover:text-red-400"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="bg-secondary-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Genres *</h3>
                
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <select
                      value={currentGenre}
                      onChange={(e) => setCurrentGenre(e.target.value)}
                      className="flex-1 px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Select a genre</option>
                      {commonGenres
                        .filter(genre => !formData.movieTypes.includes(genre))
                        .map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={addGenre}
                      disabled={!currentGenre}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-secondary-600 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  {formData.movieTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.movieTypes.split(',').map((genre, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-600 text-white"
                        >
                          {genre}
                          <button
                            type="button"
                            onClick={() => removeGenre(genre)}
                            className="ml-2 text-primary-200 hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Settings */}
              <div className="bg-secondary-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Additional Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Trailer URL (YouTube)"
                    name="trailer"
                    value={formData.trailer}
                    onChange={(e) => setFormData({ ...formData, trailer: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  
                  <Input
                    label="Subtitle ID"
                    name="subtitleID"
                    value={formData.subtitleID}
                    onChange={(e) => setFormData({ ...formData, subtitleID: e.target.value })}
                    placeholder="Auto-generated if empty"
                  />
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary-300">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="INACTIVE">Inactive</option>
                      <option value="ACTIVE">Now Showing</option>
                      <option value="UPCOMING">Upcoming</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="dubbing"
                      checked={formData.dubbing}
                      onChange={(e) => setFormData({ ...formData, dubbing: e.target.checked })}
                      className="w-4 h-4 text-primary-600 bg-secondary-700 border-secondary-600 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="dubbing" className="text-sm font-medium text-secondary-300">
                      Has Dubbing Available
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="px-8"
                >
                  <Save size={18} className="mr-2" />
                  {isEditMode ? 'Update Movie' : 'Create Movie'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddEditMovie;