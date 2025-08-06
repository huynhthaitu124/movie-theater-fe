import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { useNavigate } from 'react-router-dom';
import { Play, Calendar, X } from 'lucide-react';
import Button from '../../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { mockMovies } from '../../data/mockMovies';

const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [videoId, setVideoId] = useState('');
  const navigate = useNavigate();

  // Update heroContent to include trailerUrl
  const heroContent = mockMovies
    .filter(movie => movie.status === 'now-showing')
    .map(movie => ({
      id: movie.id,
      image: movie.backdropUrl,
      title: movie.title,
      description: movie.description,
      releaseDate: movie.releaseDate,
      trailerUrl: movie.trailerUrl
    }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => 
        prev === heroContent.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroContent.length]);

  const handleBooking = () => {
    const currentMovie = heroContent[currentIndex];
    navigate(`/movies`);
  };

  const handleTrailer = () => {
    const trailerUrl = heroContent[currentIndex].trailerUrl;
    const videoId = trailerUrl.split('v=')[1];
    setVideoId(videoId);
    setShowTrailer(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/fallback-movie-image.jpg';
  };

  return (
    <div className="relative h-[calc(100vh)] overflow-hidden"> {/* Removed pt-16 */}
      {/* Animated Background */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${heroContent[currentIndex].image})`,
              top: '0', // Remove negative margin
            }}
            role="img"
            aria-label={`${heroContent[currentIndex].title} poster`}
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/80 to-transparent"></div>
        </motion.div>
      </AnimatePresence>

      {/* Hero content - adjusted positioning */}
      <div className="container-custom relative z-10 h-full flex flex-col items-center justify-center pt-16"> {/* Added pt-16 here instead */}
        <AnimatePresence mode='wait'>
          <motion.h1 
            key={`title-${currentIndex}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-6"
          >
            {heroContent[currentIndex].title}
          </motion.h1>

          <motion.p 
            key={`desc-${currentIndex}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-secondary-200 text-center max-w-3xl mb-4"
          >
            {heroContent[currentIndex].description}
          </motion.p>

          <motion.p
            key={`date-${currentIndex}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-primary-400 font-semibold mb-8"
          >
            Release Date: {heroContent[currentIndex].releaseDate}
          </motion.p>
        </AnimatePresence>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <Button 
            size="lg" 
            leftIcon={<Calendar size={20} />}
            onClick={handleBooking}
            className="hover:scale-105 transition-transform"
          >
            Book Tickets
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            leftIcon={<Play size={20} />}
            onClick={handleTrailer}
            className="hover:scale-105 transition-transform"
          >
            Watch Trailer
          </Button>
        </motion.div>

        {/* Add movie indicators */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4"
        >
          {heroContent.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-primary-400 w-8' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </motion.div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && (
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
                <YouTube
                  videoId={videoId}
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
  );
};

export default Hero;