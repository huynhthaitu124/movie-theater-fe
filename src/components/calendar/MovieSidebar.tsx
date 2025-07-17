import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Grip, Film } from 'lucide-react';
import { Movie } from '../../types';
import { formatDuration } from '../../utils/timeUtils';
import { useMoviesWithColor } from '../../utils/moviesWithColor';

interface MovieSidebarProps {
  movies: Movie[];
}

const MovieSidebar: React.FC<MovieSidebarProps> = ({ movies }) => {
  const moviesWithColor = useMoviesWithColor(movies);

  const handleDragStart = (e: React.DragEvent, movie: Movie) => {
    // Set the data transfer with proper format
    e.dataTransfer.setData('application/json', JSON.stringify(movie));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Create a custom drag image to avoid flickering
    const dragImage = document.createElement('div');
    dragImage.innerHTML = `
      <div style="
        background: linear-gradient(135deg, ${movie.color || '#3B82F6'} 0%, ${movie.color || '#3B82F6'}dd 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(4px);
        min-width: 200px;
        text-align: center;
      ">
        📽️ ${movie.movieName}
        <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">
          ${formatDuration(movie.duration)} • ${movie.movieTypes}
        </div>
      </div>
    `;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    dragImage.style.pointerEvents = 'none';
    
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 100, 30);
    
    // Clean up the drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 100);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Clean up any remaining drag artifacts
    e.preventDefault();
  };

  return (
    <div className="w-72 bg-secondary-800 border-r border-secondary-600 h-full overflow-y-auto flex-shrink-0 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-secondary-600 bg-gradient-to-r from-secondary-800 to-secondary-750">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <Film className="h-5 w-5 text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Available Movies</h2>
            <p className="text-xs text-secondary-400">Drag to schedule showtimes</p>
          </div>
        </div>
        {/* <div className="text-xs text-secondary-500 bg-secondary-700/50 rounded-lg p-2">
          💡 Tip: Movies automatically snap to 5-minute intervals when dropped
        </div> */}
      </div>
      
      {/* Movies List */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {moviesWithColor.map((movie, index) => (
            <motion.div
              key={movie.movieID}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              draggable
              onDragStart={(e) => handleDragStart(e, movie)}
              className="group relative bg-secondary-700/50 border border-secondary-600 rounded-xl p-2 cursor-grab active:cursor-grabbing hover:shadow-xl hover:shadow-black/20 transition-all duration-300 hover:border-primary-500/50 hover:bg-secondary-700 hover:-translate-y-1 select-none flex flex-col"
              style={{ borderLeftColor: movie.color, borderLeftWidth: '4px', minWidth: 0 }}
            >
              <div className="relative flex-shrink-0 mb-1">
                <img
                  src={movie.image}
                  alt={movie.movieName}
                  className="w-12 h-18 object-cover rounded-md shadow-md group-hover:shadow-lg transition-shadow pointer-events-none mx-auto"
                  draggable={false}
                />
                {/* <div 
                  className="absolute inset-0 rounded-md opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none"
                  style={{ backgroundColor: movie.color }}
                /> */}
              </div>
              <div className="flex-1 min-w-0 pointer-events-none">
                <h3 className="font-semibold text-white text-xs leading-tight group-hover:text-primary-400 transition-colors truncate text-center">
                  {movie.movieName}
                </h3>
                <div className="flex items-center justify-center text-[10px] text-secondary-400 mt-1">
                  <Clock size={10} className="mr-1" />
                  {formatDuration(movie.duration)}
                </div>
              </div>
              <div 
                className="h-1 rounded-full opacity-60 group-hover:opacity-80 transition-opacity mt-1"
                style={{ backgroundColor: movie.color }}
              />
              
              {/* Drag indicator overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-secondary-600 bg-secondary-750">
        <div className="text-xs text-secondary-500 text-center">
          {movies.length} movies available for scheduling
        </div>
      </div>
    </div>
  );
};

export default MovieSidebar;