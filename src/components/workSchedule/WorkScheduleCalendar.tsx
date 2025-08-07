import React from 'react';
import { Clock, Edit2, Trash2 } from 'lucide-react';
import { Cinema } from '@/types/cinema';
import { WorkSchedule } from '@/types/workSchedule';

interface CalendarProps {
  currentDate: Date;
  navigateMonth: (direction: number) => void;
  schedules: WorkSchedule[];
  selectedCinema: Cinema | null;
  saving: boolean;
  handleEditSchedule: (schedule: WorkSchedule) => void;
  handleDeleteSchedule: (id: string) => void;
}

const WorkScheduleCalendar: React.FC<CalendarProps> = ({
  currentDate,
  navigateMonth,
  schedules,
  selectedCinema,
  saving,
  handleEditSchedule,
  handleDeleteSchedule,
}) => {
  // Helper functions
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getSchedulesForDate = (date: Date) => {
  if (!selectedCinema) return [];
  
  const dateStr = formatDate(date);
  
  // Return ALL schedules matching this date, not just the first one
  const matchingSchedules = schedules.filter(s => {
    const match = s.cinemaid === selectedCinema.cinemaid && 
                 s.workdate === dateStr && 
                 s.isactive;
    
    return match;
  });
  
  
  return matchingSchedules;
};

  // Generate calendar grid
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  React.useEffect(() => {
    
    // Check for schedules in the current month/year
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    
    const currentMonthSchedules = schedules.filter(s => 
      s.workdate.startsWith(`${year}-${monthStr}`)
    );
    
  }, [schedules, currentDate]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 text-gray-400 hover:bg-gray-700 rounded-md hover:text-white"
          >
            ←
          </button>
          <button
            onClick={() => navigateMonth(0)} // Reset to current month
            className="px-3 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 text-gray-400 hover:bg-gray-700 rounded-md hover:text-white"
          >
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Days of week header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-400 bg-gray-700">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const daySchedules = getSchedulesForDate(day);
          const isCurrentMonth = day.getMonth() === currentMonth;
          const isToday = formatDate(day) === formatDate(today);
          
          return (
            <div
              key={index}
              className={`min-h-24 p-2 border border-gray-600 ${
                isCurrentMonth ? 'bg-gray-800' : 'bg-gray-700'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? 'text-white' : 'text-gray-500'
              }`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {daySchedules.map(schedule => (
                  <div 
                    key={schedule.workscheduleid} 
                    className="bg-blue-900 border border-blue-700 rounded-md p-2 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <div className="flex space-x-1">
                        {/* <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="text-blue-400 hover:text-blue-300"
                          disabled={saving}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button> */}
                        <button
                          onClick={() => handleDeleteSchedule(schedule.workscheduleid)}
                          className="text-red-400 hover:text-red-300"
                          disabled={saving}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-blue-300 font-medium">
                      {/* Check API response to use correct property names */}
                      {schedule.starttime?.substring(0, 5) || 'N/A'} - {schedule.endtime?.substring(0, 5) || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkScheduleCalendar;
