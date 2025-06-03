import React from 'react';
import { Calendar, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Movie } from '../../types';
import { movies } from '../../data/mockData';

const ComingSoon: React.FC = () => {
  const comingSoonMovies = movies.filter(movie => movie.status === 'coming_soon');

  return (
    <section className="py-16 bg-white dark:bg-secondary-800">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
              Coming Soon
            </h2>
            <p className="text-secondary-600 dark:text-secondary-400">
              Exciting new releases on the horizon
            </p>
          </div>
          <Link to="/movies">
            <Button variant="ghost" className="mt-4 md:mt-0">
              View All Upcoming
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {comingSoonMovies.map((movie) => (
            <div key={movie.id} className="flex flex-col md:flex-row bg-secondary-50 dark:bg-secondary-900 rounded-lg overflow-hidden shadow-card">
              <div className="md:w-1/3 h-64 md:h-auto">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:w-2/3 p-6 flex flex-col">
                <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                  {movie.title}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 mb-4 line-clamp-3">
                  {movie.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center text-secondary-500 dark:text-secondary-400">
                    <Calendar size={16} className="mr-1" />
                    <span>{new Date(movie.releaseDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-secondary-500 dark:text-secondary-400">
                    <Clock size={16} className="mr-1" />
                    <span>{movie.duration} min</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genre.map((genre, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                
                <div className="mt-auto flex gap-2">
                  <Link to={`/movies/${movie.id}`} className="flex-1">
                    <Button fullWidth variant="secondary" leftIcon={<Eye size={16} />}>
                      Details
                    </Button>
                  </Link>
                  <Button fullWidth variant="accent">
                    Set Reminder
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;