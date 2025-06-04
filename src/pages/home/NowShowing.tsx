import React, { useState } from 'react';
import { Calendar, Clock, Star, Film } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Movie } from '../../types';
import { movies } from '../../data/mockData';

const NowShowing: React.FC = () => {
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const nowShowingMovies = movies.filter(movie => movie.status === 'now-showing');

  const handleBookTicket = (movieId: string) => {
    navigate(`/book/${movieId}`);
  };

  return (
    <section className="py-16 bg-secondary-50 dark:bg-secondary-900">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
              Now Showing
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400">
              Check out the latest movies playing in our theaters
            </p>
          </div>
          <Link to="/movies">
            <Button variant="ghost" className="mt-4 md:mt-0">
              View All Movies
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {nowShowingMovies.map((movie) => (
            <div
              key={movie.id}
              className="card card-hover"
              onMouseEnter={() => setHoveredMovie(movie.id)}
              onMouseLeave={() => setHoveredMovie(null)}
            >
              <div className="relative overflow-hidden" style={{ height: '400px' }}>
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/70 to-transparent transition-opacity duration-300 ${
                    hoveredMovie === movie.id ? 'opacity-100' : 'opacity-0'
                  }`}
                ></div>
                <div
                  className={`absolute inset-0 flex flex-col justify-end p-6 transition-opacity duration-300 ${
                    hoveredMovie === movie.id ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <h3 className="text-xl font-bold text-white mb-2">{movie.title}</h3>
                  <p className="text-secondary-200 mb-4 line-clamp-3">{movie.description}</p>
                  
                  <div className="flex items-center space-x-4 text-white mb-4">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1 text-primary-400" />
                      <span>{movie.duration} min</span>
                    </div>
                    <div className="flex items-center">
                      <Star size={16} className="mr-1 text-primary-400" />
                      <span>{movie.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleBookTicket(movie.id)}
                    fullWidth
                  >
                    Book Now
                  </Button>
                </div>
              </div>
              
              {/* Movie info (visible by default) */}
              <div className={`p-4 ${hoveredMovie === movie.id ? 'hidden' : 'block'}`}>
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                  {movie.title}
                </h3>
                <div className="flex items-center text-secondary-500 dark:text-secondary-400 mb-2">
                  <Clock size={16} className="mr-1" />
                  <span className="mr-4">{movie.duration} min</span>
                  <Star size={16} className="mr-1 text-yellow-500" />
                  <span>{movie.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center text-secondary-500 dark:text-secondary-400 mb-4">
                  <Calendar size={16} className="mr-1" />
                  <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.categories.slice(0, 3).map((genre, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NowShowing;