import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Film, ArrowLeft, Play, X } from 'lucide-react';
import YouTube from 'react-youtube';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import { movieService } from '../../services/modules/movie.service';
import { Movie } from '../../types/movie';

const MovieDetails: React.FC = () => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        // Fetch all movies from API and find the one with matching ID
        const response = await movieService.getAll();
        // Only allow ACTIVE or UPCOMING movies to be shown
        const foundMovie = response.data.find(
          m => m.movieID === id && m.status !== 'INACTIVE'
        );
        if (foundMovie) {
          setMovie(foundMovie);
        } else {
          setError('Movie not found or is inactive');
        }
      } catch (err) {
        setError('Failed to load movie details');
        console.error('Error fetching movie:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  const handleTrailer = () => {
    if (movie?.trailer) {
      setShowTrailer(true);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !movie) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">{error || 'Movie not found'}</h1>
            <Button onClick={() => navigate('/movies')}>Back to Movies</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-secondary-900">
        {/* Enhanced Back Button */}
        <div className="container mx-auto px-4 py-6 relative z-20">
          <Button
            onClick={() => navigate('/movies')}
            variant="secondary"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 font-medium"
            size="sm"
          >
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Back to Movies
          </Button>
        </div>

        {/* Hero Section with Backdrop */}
        <div 
          className="relative h-[60vh] bg-cover bg-center -mt-16"
          style={{ backgroundImage: `url(${movie.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/80 to-transparent" />
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 -mt-48 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Movie Poster */}
            <div className="lg:w-1/3">
              <img 
                src={movie.image} 
                alt={movie.movieName}
                className="rounded-xl shadow-2xl w-full max-w-[300px] mx-auto"
              />
            </div>

            {/* Movie Info */}
            <div className="lg:w-2/3">
              <h1 className="text-4xl font-bold text-white mb-4">{movie.movieName}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-secondary-300">
                  <Clock size={20} className="mr-2" />
                  <span>{movie.duration} minutes</span>
                </div>
                {movie.minimumAge && (
                  <div className="flex items-center text-secondary-300">
                    <span>{movie.minimumAge}+</span>
                  </div>
                )}
                {movie.movieLanguage && (
                  <div className="flex items-center text-secondary-300">
                    <Film size={20} className="mr-2" />
                    <span>{movie.movieLanguage}</span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Overview</h2>
                <p className="text-secondary-300 leading-relaxed">
                  {movie.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {movie.movieTypes && movie.movieTypes.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Genre</h2>
                    <div className="flex flex-wrap gap-2">
                      {movie.movieTypes.split(',').map((type, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-secondary-800 text-secondary-300 rounded-full text-sm"
                        >
                          {type.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Status</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      movie.status === 'ACTIVE'
                        ? 'bg-green-900 text-green-300'
                        : movie.status === 'UPCOMING'
                        ? 'bg-yellow-900 text-yellow-300'
                        : 'bg-blue-900 text-blue-300'
                    }`}
                  >
                    {movie.status === 'ACTIVE'
                      ? 'Now Showing'
                      : movie.status === 'UPCOMING'
                      ? 'Upcoming'
                      : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {movie.director && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Director</h2>
                    <p className="text-secondary-300">{movie.director}</p>
                  </div>
                )}
                {movie.productionCompany && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Production</h2>
                    <p className="text-secondary-300">{movie.productionCompany}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                {movie.status === 'ACTIVE' && (
                  <Button
                    onClick={() => navigate(`/book/${movie.movieID}`)}
                    size="lg"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-8"
                  >
                    Book Tickets
                  </Button>
                )}
                {movie.trailer && (
                  <Button
                    onClick={handleTrailer}
                    variant="secondary"
                    size="lg"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20"
                  >
                    <Play size={20} className="text-primary-400" />
                    Watch Trailer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trailer Modal */}
        <AnimatePresence>
          {showTrailer && movie.trailer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-4xl mx-4"
              >
                <button
                  onClick={() => setShowTrailer(false)}
                  className="absolute -top-12 right-0 text-white hover:text-primary-400 transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="relative pt-[56.25%]">
                  {/* Extract video ID from various YouTube URL formats */}
                  <YouTube
                    videoId={movie.trailer.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|v\/|embed\/)|\.be\/)([^"&?\s]{11})/)?.[1]}
                    opts={{
                      width: '100%',
                      height: '100%',
                      playerVars: {
                        autoplay: 1,
                        modestbranding: 1,
                        rel: 0,
                      },
                    }}
                    className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden"
                    onEnd={() => setShowTrailer(false)}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default MovieDetails;