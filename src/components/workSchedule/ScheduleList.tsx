import React from 'react';
import { Edit2, Trash2, Loader } from 'lucide-react';
import { Cinema } from '@/types/cinema';
import { WorkSchedule } from '@/types/workSchedule';

interface ScheduleListProps {
  schedules: WorkSchedule[];
  selectedCinema: Cinema | null;
  loading: boolean;
  saving: boolean;
  handleEditSchedule: (schedule: WorkSchedule) => void;
  handleDeleteSchedule: (id: string) => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  selectedCinema,
  loading,
  saving,
  handleEditSchedule,
  handleDeleteSchedule,
}) => {
  const filteredSchedules = selectedCinema 
    ? schedules.filter(s => s.cinemaid === selectedCinema.cinemaid && s.isactive)
    : [];

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6 mt-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">
        Schedules for {selectedCinema?.cinemaname || 'Loading...'}
      </h3>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredSchedules
                .sort((a, b) => new Date(b.workdate).getTime() - new Date(a.workdate).getTime())
                .map(schedule => (
                  <tr key={schedule.workscheduleid}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(schedule.workdate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {schedule.starttime?.substring(0, 5)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {schedule.endtime?.substring(0, 5)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300 border border-green-700">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* <button
                        onClick={() => handleEditSchedule(schedule)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                        disabled={saving}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button> */}
                      <button
                        onClick={() => handleDeleteSchedule(schedule.workscheduleid)}
                        className="text-red-400 hover:text-red-300"
                        disabled={saving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          
          {filteredSchedules.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              No schedules found for this cinema
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleList;
