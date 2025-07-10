import React, { useEffect, useState } from 'react';
import { Film, Calendar, Activity, Ticket as TicketIcon } from 'lucide-react';
import StaffLayout from '../layout/StaffLayout';
import { movieService } from '../../services/modules/movie.service';
import { showtimeService } from '../../services/modules/showtime.service';

const StaffDashboard: React.FC = () => {
  const [movieCount, setMovieCount] = useState<number>(0);
  const [showtimeCount, setShowtimeCount] = useState<number>(0);

  useEffect(() => {
    // Fetch total movies (active only)
    movieService.getAll().then(res => {
      const activeMovies = (res.data || []).filter((movie: any) => movie.status !== 'INACTIVE');
      setMovieCount(activeMovies.length || 0);
    });
    // Fetch total showtimes
    showtimeService.getAll?.().then(res => {
      setShowtimeCount(res.data?.length || 0);
    });
  }, []);

  return (
    <StaffLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Staff Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-secondary-800 rounded-lg p-6 shadow-md flex items-center">
            <div className="p-3 bg-secondary-700 rounded-full mr-4">
              <Film size={28} className="text-primary-400" />
            </div>
            <div>
              <p className="text-secondary-400 text-sm font-medium mb-1">Active Movies</p>
              <h3 className="text-2xl font-bold text-white">{movieCount}</h3>
            </div>
          </div>
          <div className="bg-secondary-800 rounded-lg p-6 shadow-md flex items-center">
            <div className="p-3 bg-secondary-700 rounded-full mr-4">
              <Calendar size={28} className="text-green-400" />
            </div>
            <div>
              <p className="text-secondary-400 text-sm font-medium mb-1">Showtimes</p>
              <h3 className="text-2xl font-bold text-white">{showtimeCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-secondary-800 rounded-lg p-6 shadow-md mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Upcoming Showtimes</h2>
            <span className="text-xs px-2 py-1 bg-secondary-700 rounded-full text-secondary-300">Today</span>
          </div>
          <div className="space-y-4">
            {/* Example static data, replace with real showtimes if needed */}
            {[
              { time: "14:00", movie: "The Dark Universe", room: "Grand Theater", bookings: "82/120" },
              { time: "16:30", movie: "Last Summer in Paris", room: "Premium Hall", bookings: "45/80" },
              { time: "19:00", movie: "Midnight Heist", room: "Intimate Screening", bookings: "32/50" },
              { time: "21:30", movie: "The Dark Universe", room: "Grand Theater", bookings: "114/120" },
            ].map((showtime, i) => (
              <div key={i} className="flex items-center p-3 rounded-lg hover:bg-secondary-700 transition-colors">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 bg-secondary-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium">{showtime.time}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{showtime.movie}</p>
                  <p className="text-secondary-400 text-sm">{showtime.room}</p>
                </div>
                <div className="flex items-center text-secondary-300">
                  <Activity size={16} className="mr-1" />
                  <span>{showtime.bookings}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffDashboard;