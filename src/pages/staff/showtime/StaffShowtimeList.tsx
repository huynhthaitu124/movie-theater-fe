import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../components/layout/StaffLayout';
import { showtimeService } from '../../../services/modules/showtime.service';

const StaffShowtimeList: React.FC = () => {
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShowtimes();
  }, []);

  const fetchShowtimes = async () => {
    try {
      setIsLoading(true);
      const response = await showtimeService.getAll();
      setShowtimes(response.data);
    } catch (err) {
      setError('Failed to fetch showtimes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Showtimes</h1>
        {error && (
          <div className="bg-error-900/50 text-error-300 p-4 rounded-lg flex items-center">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <span className="text-primary-500">Loading...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {showtimes.map((showtime, i) => (
              <div key={i} className="bg-secondary-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-white font-medium">{showtime.movieName}</p>
                  <p className="text-secondary-400 text-sm">Room: {showtime.roomName}</p>
                  <p className="text-secondary-400 text-sm">Start: {showtime.startTime}</p>
                  <p className="text-secondary-400 text-sm">End: {showtime.endTime}</p>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="px-2 py-1 rounded-full bg-primary-500 text-white text-xs">
                    {showtime.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default StaffShowtimeList;