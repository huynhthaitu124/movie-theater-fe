import React, { useState, useEffect } from 'react';
import { Calendar, CalendarDays, Loader, CalendarRange } from 'lucide-react';
import StaffLayout from '@/components/layout/StaffLayout';
import { toast } from 'react-hot-toast';
import { workScheduleService } from '@/services/modules/workSchedule.service';
import { staffService } from '@/services/modules/staff.service';
import { staffWorkScheduleService } from '@/services/modules/staffWorkSchedule.service';
import { useAuth } from '@/contexts/AuthContext';
import { WorkSchedule as WorkScheduleType } from '@/types/workSchedule';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, formatDistanceToNow } from 'date-fns';

const WorkSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<WorkScheduleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { currentUser } = useAuth();

  // Fetch staff work schedules
  useEffect(() => {
    const fetchStaffSchedules = async () => {
      if (!currentUser?.accountid) {
        toast.error('User information not available');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching staff data for account ID:', currentUser.accountid);
        
        // Step 1: Get the staff record associated with the current account
        const staffResponse = await staffService.getAll();
        
        if (!staffResponse.data) {
          toast.error('No staff information found for your account');
          setLoading(false);
          return;
        }
        
        const currentUserStaff = staffResponse.data.find(staff => 
          staff.accountId === currentUser.accountid
        );

        console.log('Current user staff record:', currentUserStaff);

        if (!currentUserStaff || !currentUserStaff.staffid) {
          toast.error('No staff record found for your account');
          setLoading(false);
          return;
        }

        const staffId = currentUserStaff.staffid;
        console.log('Found staff ID:', staffId);
        
        // Step 2: Get the work schedules assigned to this staff - FIX THE API CALL
        try {
          console.log('Fetching work schedules for staff ID:', staffId);
          const staffWorkSchedulesResponse = await staffWorkScheduleService.getByStaffId(staffId);
          
          if (!staffWorkSchedulesResponse.data) {
            console.log('No work schedules found for staff ID:', staffId);
            setSchedules([]);
            setLoading(false);
            return;
          }
          
          console.log('Staff work schedules response:', staffWorkSchedulesResponse);
          
          // Check the structure of the response and handle accordingly
          if (Array.isArray(staffWorkSchedulesResponse.data)) {
            // If it's an array of staff work schedules
            if (staffWorkSchedulesResponse.data.length === 0) {
              console.log('No work schedules found for staff ID');
              setSchedules([]);
              setLoading(false);
              return;
            }
            
            // Step 3: Get full details of each work schedule
            const workScheduleIds = staffWorkSchedulesResponse.data.map(sws => sws.workscheduleid);
            console.log('Work schedule IDs:', workScheduleIds);
            
            // Fetch all schedules and filter
            const allSchedulesResponse = await workScheduleService.getAllWorkSchedules();
            
            if (allSchedulesResponse.data) {
              const filteredSchedules = allSchedulesResponse.data.filter(
                schedule => workScheduleIds.includes(schedule.workscheduleid)
              );
              console.log('Filtered schedules:', filteredSchedules);
              setSchedules(filteredSchedules);
            } else {
              setSchedules([]);
            }
          } else {
            // Handle non-array response (possibly direct work schedules)
            console.log('Unexpected response format:', staffWorkSchedulesResponse.data);
            toast.error('Unexpected data format from server');
            setSchedules([]);
          }
        } catch (error) {
          console.error('Error fetching staff work schedules:', error);
          toast.error('Failed to fetch your work schedules');
          setSchedules([]);
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching work schedules:', error);
        toast.error('Failed to fetch your work schedules');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffSchedules();
  }, [currentUser]);

  const navigateMonth = (direction: number) => {
    if (direction === 0) {
      setCurrentDate(new Date()); // Reset to today
    } else {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + direction);
        return newDate;
      });
    }
  };

  // Generate calendar days
  const calendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const days = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const daySchedules = schedules.filter(s => s.workdate === dateStr);
      return { date, schedules: daySchedules };
    });

    return days;
  };

  // Get day of week for first day of month (0-6, 0 is Sunday)
  const firstDayOfMonth = () => {
    return getDay(startOfMonth(currentDate));
  };

  // Format time (HH:MM:SS -> HH:MM)
  const formatTime = (time?: string) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  return (
    <StaffLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Calendar className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">My Work Schedule</h1>
                  <p className="text-gray-400">View your assigned work schedules</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden mb-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <button
                onClick={() => navigateMonth(-1)}
                className="text-gray-400 hover:text-white"
              >
                &lt; Previous
              </button>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-white">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                  onClick={() => navigateMonth(0)}
                  className="text-sm px-2 py-1 bg-blue-600 rounded text-white hover:bg-blue-700"
                >
                  Today
                </button>
              </div>
              <button
                onClick={() => navigateMonth(1)}
                className="text-gray-400 hover:text-white"
              >
                Next &gt;
              </button>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-px border-b border-gray-700">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={i} className="p-2 text-center text-gray-400 font-medium bg-gray-800">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="flex justify-center items-center p-16">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-400">Loading your schedule...</span>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-px bg-gray-700">
                {/* Empty cells for days before the 1st of month */}
                {Array(firstDayOfMonth()).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[120px] bg-gray-800 opacity-50"></div>
                ))}

                {/* Actual calendar days */}
                {calendarDays().map(({ date, schedules: daySchedules }) => {
                  const isToday = isSameDay(date, new Date());
                  const hasSchedule = daySchedules.length > 0;

                  return (
                    <div 
                      key={date.toString()} 
                      className={`min-h-[120px] bg-gray-800 p-2 relative ${
                        isToday ? 'ring-2 ring-blue-500 ring-inset' : ''
                      }`}
                    >
                      <div className={`flex items-center justify-center w-7 h-7 rounded-full mb-1 ${
                        isToday ? 'bg-blue-600 text-white' : 'text-gray-300'
                      }`}>
                        {format(date, 'd')}
                      </div>
                      
                      {hasSchedule ? (
                        <div className="space-y-1 mt-1">
                          {daySchedules.map(schedule => (
                            <div 
                              key={schedule.workScheduleId} 
                              className="bg-blue-900/40 border border-blue-800 rounded p-1 text-xs text-white"
                            >
                              <div className="font-medium">
                                {formatTime(schedule.starttime)} - {formatTime(schedule.endtime)}
                              </div>
                              {schedule.cinemaName && (
                                <div className="text-gray-300 text-xs truncate">
                                  {schedule.cinemaName}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-xs text-gray-500">No shifts</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Schedules List */}
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarDays className="text-blue-400 w-5 h-5" />
              <h2 className="text-xl font-semibold text-white">Upcoming Shifts</h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {schedules
                  .filter(s => new Date(s.workdate) >= new Date())
                  .sort((a, b) => new Date(a.workdate).getTime() - new Date(b.workdate).getTime())
                  .slice(0, 5) // Show only next 5 upcoming shifts
                  .map(schedule => (
                    <div 
                      key={schedule.workScheduleId}
                      className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-white">
                          {format(new Date(schedule.workdate), 'EEEE, MMMM d, yyyy')}
                        </div>
                        <div className="text-blue-400">
                          {formatTime(schedule.starttime)} - {formatTime(schedule.endtime)}
                        </div>
                        {schedule.cinemaName && (
                          <div className="text-sm text-gray-400 mt-1">
                            {schedule.cinemaName}
                          </div>
                        )}
                      </div>
                      <div className="bg-blue-900/40 px-3 py-1 rounded-full text-xs text-blue-300 border border-blue-800">
                        {new Date(schedule.workdate).toLocaleDateString() === new Date().toLocaleDateString()
                          ? 'Today'
                          : formatDistanceToNow(schedule.workdate)}
                      </div>
                    </div>
                  ))}

                {schedules.filter(s => new Date(s.workdate) >= new Date()).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No upcoming shifts scheduled</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default WorkSchedule;