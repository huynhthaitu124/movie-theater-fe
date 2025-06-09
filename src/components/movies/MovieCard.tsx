import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar } from 'lucide-react';
import Button from '../common/Button';

interface MovieCardProps {
  id: string;
  title: string;
  poster: string;
  duration: string;
  releaseDate: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  id, 
  title, 
  poster, 
  duration, 
  releaseDate 
}) => {
  const navigate = useNavigate();

  const handleBookTicket = () => {
    navigate(`/book/${id}`);
  };

  return (
    <div className="bg-secondary-800 rounded-lg overflow-hidden shadow-md">
      <img 
        src={poster} 
        alt={title} 
        className="w-full h-[400px] object-cover"
      />
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="space-y-2">
          <div className="flex items-center text-secondary-400">
            <Clock size={16} className="mr-2" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center text-secondary-400">
            <Calendar size={16} className="mr-2" />
            <span>{releaseDate}</span>
          </div>
        </div>
        <Button 
          onClick={handleBookTicket}
          className="w-full"
        >
          Book Ticket
        </Button>
      </div>
    </div>
  );
};

export default MovieCard;