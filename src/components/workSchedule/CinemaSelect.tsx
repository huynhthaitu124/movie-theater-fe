import React from 'react';
import { Loader } from 'lucide-react';
import { Cinema } from '@/types/cinema';

interface CinemaSelectProps {
  cinemas: Cinema[];
  selectedCinema: Cinema | null;
  loading: boolean;
  onChange: (cinemaId: string) => void;
}

const CinemaSelect: React.FC<CinemaSelectProps> = ({
  cinemas,
  selectedCinema,
  loading,
  onChange,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select Cinema
      </label>
      {loading && cinemas.length === 0 ? (
        <div className="flex items-center space-x-2">
          <Loader className="w-4 h-4 text-blue-400 animate-spin" />
          <span className="text-gray-400">Loading cinemas...</span>
        </div>
      ) : (
        <select
          value={selectedCinema?.cinemaid || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-64 px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {cinemas.map(cinema => (
            <option key={cinema.cinemaid} value={cinema.cinemaid}>
              {cinema.cinemaname}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CinemaSelect;
