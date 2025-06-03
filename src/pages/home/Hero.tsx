import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar } from 'lucide-react';
import Button from '../../components/common/Button';

const Hero: React.FC = () => {
  return (
    <div className="relative">
      {/* Hero background image */}
      <div className="absolute inset-0 z-0 bg-secondary-900">
        <div 
          className="h-full w-full bg-cover bg-center opacity-40"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/80 to-transparent"></div>
      </div>

      {/* Hero content */}
      <div className="container-custom relative z-10 py-20 md:py-28 lg:py-32 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-6 animate-slide-up">
          Experience Movies <span className="text-primary-400">Like Never Before</span>
        </h1>
        <p className="text-xl text-secondary-200 text-center max-w-3xl mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Immerse yourself in stunning visuals and premium sound with the latest blockbusters and timeless classics.
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Button 
            size="lg" 
            leftIcon={<Calendar size={20} />}
            onClick={() => {}}
          >
            Book Tickets
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            leftIcon={<Play size={20} />}
            onClick={() => {}}
          >
            Watch Trailers
          </Button>
        </div>
        
        <div className="mt-16 w-full overflow-hidden">
          <div className="flex justify-center">
            <div className="flex space-x-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center space-x-2">
                <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">4K</span>
                </div>
                <span className="text-white font-medium">Ultra HD</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">3D</span>
                </div>
                <span className="text-white font-medium">Experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-12 w-12 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">VIP</span>
                </div>
                <span className="text-white font-medium">Seating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;