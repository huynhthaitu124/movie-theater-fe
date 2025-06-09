import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Star } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import { mockMovies } from '../../data/mockMovies';

const Movies: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Get unique genres from mock data
  const genres = ['all', ...new Set(mockMovies.flatMap(movie => movie.genre))];

  const filteredMovies = mockMovies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || movie.genre.includes(selectedGenre);
    const matchesStatus = selectedStatus === 'all' || movie.status === selectedStatus;
    return matchesSearch && matchesGenre && matchesStatus;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Movies</h1>
          
          {/* Search and Filters */}
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white w-full md:w-64"
              />
            </div>
            
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white"
            >
              {genres.map(genre => (
                <option key={genre.toLowerCase()} value={genre.toLowerCase()}>
                  {genre}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="now-showing">Now Showing</option>
              <option value="coming-soon">Coming Soon</option>
            </select>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="bg-secondary-800 rounded-lg overflow-hidden shadow-lg">
              <div className="relative aspect-[2/3]">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm line-clamp-3">{movie.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{movie.title}</h3>
                <div className="flex items-center justify-between text-secondary-300 mb-4">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    <span>{movie.duration} min</span>
                  </div>
                  <div className="flex items-center">
                    <Star size={16} className="mr-1" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(`/book/${movie.id}`)}
                  fullWidth
                >
                  Book Ticket
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Movies;