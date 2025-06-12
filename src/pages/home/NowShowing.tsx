import React, { useState } from 'react';
import { Calendar, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { mockMovies } from '../../data/mockMovies';
import 'swiper/css';
import 'swiper/css/navigation';

const NowShowing: React.FC = () => {
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const nowShowingMovies = mockMovies.filter(movie => movie.status === 'now-showing');

  const handleMovieClick = (movieId: string) => {
    navigate(`/movies/${movieId}`);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-secondary-50 to-white dark:from-secondary-900 dark:to-secondary-800">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
        >
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 mb-2">
              Now Showing
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400">
              Check out the latest movies playing in our theaters
            </p>
          </div>
          <Link to="/movies">
            <Button 
              variant="ghost" 
              className="mt-4 md:mt-0 hover:scale-105 transition-all duration-300"
            >
              View All Movies
            </Button>
          </Link>
        </motion.div>

        <div className="relative group">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={32}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            navigation={{
              prevEl: '.swiper-button-prev',
              nextEl: '.swiper-button-next',
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="px-4 py-4"
          >
            {nowShowingMovies.map((movie) => (
              <SwiperSlide key={movie.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="card overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-secondary-800 relative"
                  onMouseEnter={() => setHoveredMovie(movie.id)}
                  onMouseLeave={() => setHoveredMovie(null)}
                >
                  <div className="relative aspect-[2/3]">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/fallback-movie-poster.jpg';
                      }}
                    />
                    {/* Overlay content */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 pointer-events-none
                        ${hoveredMovie === movie.id ? '!opacity-100 !pointer-events-auto' : ''}`}
                      style={{ transition: 'opacity 300ms ease-in-out' }}
                    >
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <h3 className="text-xl font-bold text-white mb-2">{movie.title}</h3>
                        <p className="text-gray-200 mb-4 line-clamp-3">{movie.description}</p>
                        
                        <div className="flex items-center space-x-4 text-white mb-4">
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1 text-primary-400" />
                            <span>{movie.duration} min</span>
                          </div>
                          <div className="flex items-center">
                            <Star size={16} className="mr-1 text-yellow-400" />
                            <span>{movie.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => handleMovieClick(movie.id)}
                          fullWidth
                          className="bg-primary-600 hover:bg-primary-500 transform hover:scale-105 transition-all duration-300"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Base content - Always visible when not hovered */}
                  <div 
                    className={`p-4 transition-opacity duration-300 absolute bottom-0 left-0 right-0 bg-white dark:bg-secondary-800
                      ${hoveredMovie === movie.id ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                  >
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2 line-clamp-1">
                      {movie.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {movie.genre.slice(0, 3).map((genre, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-secondary-600 dark:text-secondary-400">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{movie.duration} min</span>
                      </div>
                      <div className="flex items-center">
                        <Star size={14} className="mr-1 text-yellow-500" />
                        <span>{movie.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-6 hover:scale-110">
            <ChevronLeft size={28} />
          </button>
          <button className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-6 hover:scale-110">
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default NowShowing;