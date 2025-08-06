import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Users, Loader, Search, X, Check, ChevronLeft, ChevronRight, Clock, ArrowLeft } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'react-hot-toast';
import { staffService } from '@/services/modules/staff.service';
import { workScheduleService } from '@/services/modules/workSchedule.service';
import { staffWorkScheduleService } from '@/services/modules/staffWorkSchedule.service';
import { Employee } from '@/types/employee';
import { WorkSchedule } from '@/types/workSchedule';
import { StaffWorkSchedule } from '@/types/staffWorkSchedule';
import CinemaSelect from '@/components/workSchedule/CinemaSelect';
import { Cinema } from '@/types/cinema';
import { cinemaService } from '@/services/modules/cinema.service';
import { useLocation, useNavigate } from 'react-router-dom';

const StaffScheduleManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCinemaId } = location.state || {};

  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [staff, setStaff] = useState<Employee[]>([]);
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);
  const [staffWorkSchedules, setStaffWorkSchedules] = useState<StaffWorkSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Add this state near your other state variables
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteData, setDeleteData] = useState<{staffId: string, scheduleId: string, staffName: string} | null>(null);
  
  // For search and filtering
  const [staffSearch, setStaffSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // For selection
  const [selectedStaff, setSelectedStaff] = useState<Employee[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<WorkSchedule[]>([]);
  
  // For view mode
  const [viewMode, setViewMode] = useState<'assign' | 'view'>('view');

  // For calendar navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch cinemas on component mount
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        const response = await cinemaService.getAll();
        if (response.data && Array.isArray(response.data)) {
          setCinemas(response.data);
          if (response.data.length > 0) {
            setSelectedCinema(response.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching cinemas:', error);
        toast.error('Failed to fetch cinemas');
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, []);

  // Fetch data when selected cinema changes
  useEffect(() => {
    if (!selectedCinema) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch work schedules for the selected cinema
        const schedulesResponse = await workScheduleService.getWorkScheduleByCinemaId(selectedCinema.cinemaid);
        if (schedulesResponse.data) {
          setWorkSchedules(schedulesResponse.data);
        }
        
        // Fetch all staff using the staff service
        const staffResponse = await staffService.getAll();
        if (staffResponse.data) {
          console.log('Fetched staff:', staffResponse.data);
          setStaff(staffResponse.data);
        } else {
          console.warn('No staff data returned');
          setStaff([]);
        }
        
        // Fetch existing staff work schedules
        const staffWorkSchedulesResponse = await staffWorkScheduleService.getAll();
        if (staffWorkSchedulesResponse.data) {
          setStaffWorkSchedules(staffWorkSchedulesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedCinema]);

  // Use selectedCinemaId to pre-select the cinema when component loads
  useEffect(() => {
    if (selectedCinemaId && cinemas.length > 0) {
      const cinema = cinemas.find(c => c.cinemaid === selectedCinemaId);
      if (cinema) {
        setSelectedCinema(cinema);
      }
    }
  }, [cinemas, selectedCinemaId]);

  // Filter work schedules by date
  const filteredWorkSchedules = dateFilter 
    ? workSchedules.filter(ws => ws.workdate === dateFilter && ws.cinemaid === selectedCinema?.cinemaid)
    : workSchedules.filter(ws => ws.cinemaid === selectedCinema?.cinemaid);

  // Filter staff by search query
  const filteredStaff = staffSearch
    ? staff.filter(s => 
        s.fullName?.toLowerCase().includes(staffSearch.toLowerCase()) ||
        s.email?.toLowerCase().includes(staffSearch.toLowerCase())
      )
    : staff;

  // Check if a staff member is assigned to a work schedule
  const isStaffAssigned = (staffId: string, scheduleId: string) => {
    return staffWorkSchedules.some(
      sws => sws.staffId === staffId && sws.workScheduleId === scheduleId
    );
  };

  // Toggle staff selection
  const toggleStaffSelection = (staffMember: Employee) => {
    if (selectedStaff.some(s => s.staffid === staffMember.staffid)) {
      setSelectedStaff(selectedStaff.filter(s => s.staffid !== staffMember.staffid));
    } else {
      setSelectedStaff([...selectedStaff, staffMember]);
    }
  };

  // Toggle schedule selection
  const toggleScheduleSelection = (schedule: WorkSchedule) => {
    if (selectedSchedules.some(s => s.workscheduleid === schedule.workscheduleid)) {
      setSelectedSchedules(selectedSchedules.filter(s => s.workscheduleid !== schedule.workscheduleid));
    } else {
      setSelectedSchedules([...selectedSchedules, schedule]);
    }
  };

  // Assign selected staff to selected schedules
  const assignStaffToSchedules = async () => {
    if (selectedStaff.length === 0 || selectedSchedules.length === 0) {
      toast.error('Please select at least one staff member and one schedule');
      return;
    }
    
    setSaving(true);
    let successCount = 0;
    let failCount = 0;
    
    try {
      // For each combination of staff and schedule
      for (const staff of selectedStaff) {
        for (const schedule of selectedSchedules) {
          // Check if assignment already exists
          const alreadyAssigned = isStaffAssigned(staff.staffid, schedule.workscheduleid);
          
          if (!alreadyAssigned) {
            try {
              // Create new assignment
              const createData = {
                staffId: staff.staffid, // Use the correct property name
                workScheduleId: schedule.workscheduleid // Use the correct property name
              };
              
              const response = await staffWorkScheduleService.create(createData);
              
              if (response.data) {
                successCount++;
                // Add to local state
                setStaffWorkSchedules(prev => [...prev, response.data as unknown as StaffWorkSchedule]);
              }
            } catch (error) {
              console.error('Error assigning staff to schedule:', error);
              failCount++;
            }
          }
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully assigned ${successCount} schedule(s)`);
      }
      
      if (failCount > 0) {
        toast.error(`Failed to assign ${failCount} schedule(s)`);
      }
      
      // Clear selections
      setSelectedStaff([]);
      setSelectedSchedules([]);
      
      // Switch back to view mode
      setViewMode('view');
    } catch (error) {
      console.error('Error in assignment process:', error);
      toast.error('An error occurred during assignment');
    } finally {
      setSaving(false);
    }
  };

  // Remove staff from a schedule
  const removeStaffFromSchedule = (staffId: string, scheduleId: string) => {
    const staffMember = staff.find(s => s.staffid === staffId);
    
    if (!staffMember) {
      toast.error('Staff member not found');
      return;
    }
    
    setDeleteData({
      staffId,
      scheduleId,
      staffName: staffMember.displayName || 'Unknown staff'
    });
    setShowDeleteModal(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format time for display (e.g., "08:00:00" to "8:00 AM")
  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    const calendarDays: Date[] = [];
    for (let i = 0; i < 42; i++) { // 6 rows of 7 days
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      calendarDays.push(day);
    }
    
    return calendarDays;
  };

  // Add this helper function to format date for comparison
  const formatDateForComparison = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Add this navigation function
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

  // Add this component within your StaffScheduleManagement component
  const DeleteConfirmationModal = () => {
    if (!showDeleteModal || !deleteData) return null;
    
    const staffMember = staff.find(s => s.staffid === deleteData.staffId);
    const schedule = workSchedules.find(s => s.workscheduleid === deleteData.scheduleId);

    const handleConfirmDelete = async () => {
      if (!deleteData) return;
      
      try {
        setSaving(true);
        
        const response = await staffWorkScheduleService.delete(deleteData.staffId, deleteData.scheduleId);
        
        if (response.status === 200) {
          // Remove from local state - filter out the matching assignment
          setStaffWorkSchedules(prev => 
            prev.filter(sws => !(sws.staffid === deleteData.staffId && sws.workscheduleid === deleteData.scheduleId))
          );
          toast.success('Assignment removed successfully');
        } else {
          toast.error('Failed to remove assignment');
        }
      } catch (error) {
        console.error('Error removing staff from schedule:', error);
        toast.error('Failed to remove assignment');
      } finally {
        setSaving(false);
        setShowDeleteModal(false);
        setDeleteData(null);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Confirm Removal</h2>
          
          <p className="text-gray-300 mb-6">
            Are you sure you want to remove <span className="font-semibold text-white">{deleteData.staffName}</span> from the {schedule ? formatDate(schedule.workdate) : ''} schedule?
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteData(null);
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              disabled={saving}
            >
              {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header - Modify to include back button */}
          <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/admin/workSchedule')}
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 mr-3"
                  title="Back to Work Schedule Manager"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Staff Schedule Manager</h1>
                  <p className="text-gray-400">Assign staff to work schedules</p>
                </div>
              </div>
              <div>
                {viewMode === 'view' ? (
                  <button
                    onClick={() => setViewMode('assign')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign Staff</span>
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setViewMode('view');
                        setSelectedStaff([]);
                        setSelectedSchedules([]);
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={assignStaffToSchedules}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                      disabled={saving || selectedStaff.length === 0 || selectedSchedules.length === 0}
                    >
                      {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>Assign Selected</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Cinema Selection */}
          <CinemaSelect 
            cinemas={cinemas}
            selectedCinema={selectedCinema}
            loading={loading}
            onChange={(cinemaId) => {
              const selected = cinemas.find(c => c.cinemaid === cinemaId);
              if (selected) {
                setSelectedCinema(selected);
              }
            }}
          />

          {/* Main Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : viewMode === 'assign' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Staff Selection Panel */}
              <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Select Staff</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search staff..."
                      className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-y-auto max-h-96">
                  {filteredStaff.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">No staff found</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {filteredStaff.map(staffMember => (
                        <div
                          key={staffMember.staffid}
                          className={`flex flex-col items-center p-3 rounded-md cursor-pointer text-center ${
                            selectedStaff.some(s => s.staffid === staffMember.staffid)
                              ? 'bg-blue-800 border border-blue-600'
                              : 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
                          }`}
                          onClick={() => toggleStaffSelection(staffMember)}
                        >
                          <div className={`w-5 h-5 rounded-sm mb-2 flex items-center justify-center ${
                            selectedStaff.some(s => s.staffid === staffMember.staffid)
                              ? 'bg-blue-500'
                              : 'bg-gray-500'
                          }`}>
                            {selectedStaff.some(s => s.staffid === staffMember.staffid) && (
                              <Check className="text-white w-4 h-4" />
                            )}
                          </div>
                          <div className="truncate w-full">
                            <p className="text-white font-medium text-sm truncate">{staffMember.displayName}</p>
                            <p className="text-gray-400 text-xs truncate">{staffMember.position}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 bg-gray-700 p-3 rounded-md border border-gray-600">
                  <p className="text-white">
                    {selectedStaff.length} staff member{selectedStaff.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>

              {/* Schedule Selection Panel with Calendar Grid */}
              <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold text-white">Select Work Schedules</h2>
                    <span className="text-sm text-gray-400">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => navigateMonth(-1)} 
                      className="p-1 rounded-md hover:bg-gray-700"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => navigateMonth(0)} 
                      className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-white"
                    >
                      Today
                    </button>
                    <button 
                      onClick={() => navigateMonth(1)} 
                      className="p-1 rounded-md hover:bg-gray-700"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center font-medium text-gray-300 py-1 bg-gray-700 rounded-md">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="overflow-y-auto max-h-[500px]">
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays().map((date, index) => {
                      // Format date for comparison with work schedule dates
                      const dateStr = formatDateForComparison(date);
                      const daySchedules = workSchedules.filter(s => s.workdate === dateStr && s.cinemaid === selectedCinema?.cinemaid);
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                      const isToday = formatDateForComparison(new Date()) === dateStr;
                      
                      return (
                        <div 
                          key={index}
                          className={`min-h-24 p-2 border ${isToday ? 'ring-2 ring-blue-500' : ''} 
                            ${isCurrentMonth 
                              ? 'border-gray-600 bg-gray-700' 
                              : 'border-gray-700 bg-gray-800 text-gray-500'}`
                          }
                        >
                          <div className={`text-sm font-medium mb-1 ${isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>
                            {date.getDate()}
                          </div>
                          
                          <div className="space-y-1">
                            {daySchedules.map(schedule => {
                              // Find all staff assigned to this schedule
                              const assignedStaffIds = staffWorkSchedules
                                .filter(sws => sws.workScheduleId === schedule.workscheduleid)
                                .map(sws => sws.staffId);
                              
                              const assignedStaffCount = assignedStaffIds.length;
                              
                              return (
                                <div
                                  key={schedule.workscheduleid}
                                  onClick={() => toggleScheduleSelection(schedule)}
                                  className={`p-2 rounded-md text-xs cursor-pointer ${
                                    selectedSchedules.some(s => s.workscheduleid === schedule.workscheduleid)
                                      ? 'bg-blue-700 border border-blue-600'
                                      : 'bg-blue-900 border border-blue-700 hover:bg-blue-800'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center">
                                      <Clock className="w-3 h-3 text-blue-400 mr-1" />
                                      {selectedSchedules.some(s => s.workscheduleid === schedule.workscheduleid) && (
                                        <Check className="w-3 h-3 text-blue-300 mr-1" />
                                      )}
                                    </div>
                                    <span className="text-xs text-blue-300">
                                      {assignedStaffCount > 0 ? `${assignedStaffCount} staff` : ''}
                                    </span>
                                  </div>
                                  <div className="text-blue-300 font-medium">
                                    {schedule.starttime?.substring(0, 5) || 'N/A'} - {schedule.endtime?.substring(0, 5) || 'N/A'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-4 bg-gray-700 p-3 rounded-md border border-gray-600">
                  <p className="text-white">
                    {selectedSchedules.length} schedule{selectedSchedules.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Current Staff Assignments</h2>
                <input
                  type="date"
                  className="bg-gray-700 text-white px-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              
              {/* Staff schedule table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Staff
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredWorkSchedules.map(schedule => {
                      // Find all staff assigned to this schedule
                      const assignedStaffIds = staffWorkSchedules
                        .filter(sws => sws.workscheduleid === schedule.workscheduleid)
                        .map(sws => sws.staffid);
                      
                      const assignedStaff = staff.filter(s => assignedStaffIds.includes(s.staffid));
                      
                      return assignedStaff.length > 0 ? (
                        <tr key={schedule.workscheduleid}>
                          <td className="px-6 py-4 whitespace-nowrap text-white">
                            {formatDate(schedule.workdate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-white">
                            {formatTime(schedule.starttime)} - {formatTime(schedule.endtime)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {assignedStaff.map(staffMember => (
                                <div key={staffMember.staffid} className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded-md">
                                  <div>
                                    <p className="text-white">{staffMember.displayName}</p>
                                    <p className="text-xs text-gray-400">{staffMember.email}</p>
                                  </div>
                                  <button
                                    onClick={() => removeStaffFromSchedule(staffMember.staffid, schedule.workscheduleid)}
                                    className="text-red-400 hover:text-red-300"
                                    disabled={saving}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setViewMode('assign');
                                setSelectedSchedules([schedule]);
                              }}
                              className="text-blue-400 hover:text-blue-300"
                              disabled={saving}
                            >
                              Add Staff
                            </button>
                          </td>
                        </tr>
                      ) : null;
                    })}
                  </tbody>
                </table>
                
                {filteredWorkSchedules.filter(schedule => {
                  const assignedStaffIds = staffWorkSchedules
                    .filter(sws => sws.workScheduleId === schedule.workScheduleId)
                    .map(sws => sws.staffId);
                  return assignedStaffIds.length > 0;
                }).length === 0 && (
                  <p className="text-gray-400 text-center py-10">
                    No staff assignments found for the selected criteria
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add the delete confirmation modal */}
      <DeleteConfirmationModal />
    </AdminLayout>
  );
};

export default StaffScheduleManagement;