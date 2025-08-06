import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CalendarDays, Loader, Users } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { toast } from 'react-hot-toast';
import { workScheduleService } from '@/services/modules/workSchedule.service';
import { cinemaService } from '@/services/modules/cinema.service';
import WorkScheduleCalendar from '@/components/workSchedule/WorkScheduleCalendar';
import ScheduleList from '@/components/workSchedule/ScheduleList';
import ScheduleModal from '@/components/workSchedule/ScheduleModal';
import CinemaSelect from '@/components/workSchedule/CinemaSelect';
import { useNavigate } from 'react-router-dom';
import { WorkSchedule, WorkScheduleFormData, BulkScheduleFormData, CreateWorkScheduleRequest, UpdateWorkScheduleRequest } from '@/types/workSchedule';
import { Cinema } from '@/types/cinema';

const WorkScheduleManagement: React.FC = () => {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
  const [formData, setFormData] = useState<WorkScheduleFormData>({
    workdate: '',
    startTime: '08:00',
    endTime: '17:00'
  });
  const [bulkFormData, setBulkFormData] = useState<BulkScheduleFormData>({
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '17:00',
    selectedDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    }
  });

  const navigate = useNavigate();

  // Fetch cinemas from API
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        const response = await cinemaService.getAll();
        if (response.data && Array.isArray(response.data)) {
          setCinemas(response.data);
          // Set the first cinema as the selected one if available
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

  // Fetch work schedules when selected cinema changes
  useEffect(() => {
    const fetchWorkSchedules = async () => {
      if (!selectedCinema) return;
      
      try {
        setLoading(true);
        const response = await workScheduleService.getWorkScheduleByCinemaId(selectedCinema.cinemaid);
        
        if (response.data) {
          setSchedules(response.data);
        } else {
          setSchedules([]);
          console.warn('No work schedules returned from API');
        }
      } catch (error) {
        console.error('Error fetching work schedules:', error);
        toast.error('Failed to fetch work schedules');
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCinema) {
      fetchWorkSchedules();
    }
  }, [selectedCinema]);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setFormData({
      workdate: formatDate(new Date()),
      startTime: '08:00',
      endTime: '17:00'
    });
    setShowModal(true);
  };

  const handleCreateBulkSchedule = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    setBulkFormData({
      startDate: formatDate(today),
      endDate: formatDate(nextWeek),
      startTime: '08:00',
      endTime: '17:00',
      selectedDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      }
    });
    setShowBulkModal(true);
  };

  const handleEditSchedule = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      workdate: schedule.workdate,
      startTime: schedule.starttime?.substring(0, 5),
      endTime: schedule.endtime?.substring(0, 5)
    });
    setShowModal(true);
  };

  const handleSaveBulkSchedule = async () => {
    if (!selectedCinema) {
      toast.error('No cinema selected');
      return;
    }

    try {
      setSaving(true);
      
      // Fix timezone issues by ensuring dates are in local time
      const createDateWithLocalTime = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);  // Month is 0-indexed in JS Date
      };
      
      const startDate = createDateWithLocalTime(bulkFormData.startDate);
      const endDate = createDateWithLocalTime(bulkFormData.endDate);
      
      
      const dayMap: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
      };

      const selectedDayNumbers = Object.entries(bulkFormData.selectedDays)
        .filter(([_, selected]) => selected)
        .map(([day]) => dayMap[day]);
      

      const current = new Date(startDate);
      const createdSchedules: WorkSchedule[] = [];
      
      while (current <= endDate) {
        const currentDay = current.getDay();
        const currentDateStr = formatDate(current);
        
        if (selectedDayNumbers.includes(currentDay)) {
          // Create schedule for this date
          
          // Check if schedule already exists for this date
          const existingSchedule = schedules.find(s => 
            s.cinemaId === selectedCinema.cinemaid && 
            s.workdate === currentDateStr && 
            s.isActive
          );

          if (!existingSchedule) {
            const scheduleData: CreateWorkScheduleRequest = {
              cinemaId: selectedCinema.cinemaid,
              workdate: currentDateStr,
              startTime: bulkFormData.startTime + ':00',
              endTime: bulkFormData.endTime + ':00'
            };
            
            try {
              const response = await workScheduleService.createWorkSchedule(scheduleData);
              if (response.data) {
                createdSchedules.push(response.data as unknown as WorkSchedule);
              }
            } catch (error) {
              console.error(`Error creating schedule for date ${currentDateStr}:`, error);
            }
          }
        }
        
        // Advance to next day while preserving the time
        const nextDay = new Date(current);
        nextDay.setDate(current.getDate() + 1);
        current.setTime(nextDay.getTime());
      }

      if (createdSchedules.length > 0) {
        // Reload all schedules to ensure consistency
        if (selectedCinema) {
          const refreshResponse = await workScheduleService.getWorkScheduleByCinemaId(selectedCinema.cinemaid);
          if (refreshResponse.data) {
            setSchedules(refreshResponse.data);
          }
        }
        toast.success(`Created ${createdSchedules.length} schedules successfully`);
      } else {
        toast.success('No new schedules created');
      }

      setShowBulkModal(false);
    } catch (error) {
      console.error('Error creating bulk schedules:', error);
      toast.error('Failed to create schedules');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedCinema) {
      toast.error('No cinema selected');
      return;
    }

    try {
      setSaving(true);
      
      if (editingSchedule) {
        // Update existing schedule
        const updateData: UpdateWorkScheduleRequest = {
          workScheduleId: editingSchedule.workScheduleId,
          cinemaId: selectedCinema.cinemaid,
          workdate: formData.workdate,
          startTime: formData.startTime + ':00',
          endTime: formData.endTime + ':00'
        };
        
        const response = await workScheduleService.updateWorkSchedule(updateData);
        if (response.data) {
          setSchedules(prev => prev.map(s => 
            s.workScheduleId === editingSchedule.workScheduleId ? response.data as unknown as WorkSchedule : s
          ));
          toast.success('Schedule updated successfully');
        }
      } else {
        // Create new schedule
        const createData: CreateWorkScheduleRequest = {
          cinemaId: selectedCinema.cinemaid,
          workdate: formData.workdate,
          startTime: formData.startTime + ':00',
          endTime: formData.endTime + ':00'
        };
        
        const response = await workScheduleService.createWorkSchedule(createData);
        if (response.data) {
          setSchedules(prev => [...prev, response.data as unknown as WorkSchedule]);
          toast.success('Schedule created successfully');
        }
      }
  
      setShowModal(false);
      setEditingSchedule(null);
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
        setSaving(true);
        
        // Optimistically update the UI
        setSchedules(prev => prev.filter(s => s.workScheduleId !== scheduleId));
        
        // Make the API call
        const response = await workScheduleService.deleteWorkSchedule(scheduleId);
        
        if (response.data) {
          toast.success('Schedule deleted successfully');
        } else {
          // If the operation didn't succeed, refresh to get accurate data
          if (selectedCinema) {
            const refreshResponse = await workScheduleService.getWorkScheduleByCinemaId(selectedCinema.cinemaid);
            if (refreshResponse.data) {
              setSchedules(refreshResponse.data);
            }
          }
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
        toast.error('This schedule cannot be deleted because staff are assigned to it');
        
        // Refresh to restore accurate data after error
        if (selectedCinema) {
          try {
            const refreshResponse = await workScheduleService.getWorkScheduleByCinemaId(selectedCinema.cinemaid);
            if (refreshResponse.data) {
              setSchedules(refreshResponse.data);
            }
          } catch (refreshError) {
            console.error('Error refreshing schedules:', refreshError);
          }
        }
      } finally {
        setSaving(false);
      }
  };

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


  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Calendar className="w-8 h-8 text-blue-400" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Work Schedule Manager</h1>
                  <p className="text-gray-400">Manage cinema work schedules</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {/* Add Staff Schedule button here */}
                <button
                  onClick={() => navigate('/admin/staffSchedule')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Manage Staff Schedules</span>
                </button>
                
                <button
                  onClick={handleCreateBulkSchedule}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  disabled={!selectedCinema || saving}
                >
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                  <span>Bulk Create</span>
                </button>
                <button
                  onClick={handleCreateSchedule}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  disabled={!selectedCinema || saving}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Schedule</span>
                </button>
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

          {/* Calendar */}
          <WorkScheduleCalendar 
            currentDate={currentDate}
            navigateMonth={navigateMonth}
            schedules={schedules}
            selectedCinema={selectedCinema}
            saving={saving}
            handleEditSchedule={handleEditSchedule}
            handleDeleteSchedule={handleDeleteSchedule}
          />

          {/* Schedule List */}
          <ScheduleList 
            schedules={schedules}
            selectedCinema={selectedCinema}
            loading={loading}
            saving={saving}
            handleEditSchedule={handleEditSchedule}
            handleDeleteSchedule={handleDeleteSchedule}
          />

          {/* Modals */}
          <ScheduleModal 
            showModal={showModal}
            showBulkModal={showBulkModal}
            editingSchedule={editingSchedule}
            selectedCinema={selectedCinema}
            formData={formData}
            bulkFormData={bulkFormData}
            saving={saving}
            setFormData={setFormData}
            setBulkFormData={setBulkFormData}
            setShowModal={setShowModal}
            setShowBulkModal={setShowBulkModal}
            handleSaveSchedule={handleSaveSchedule}
            handleSaveBulkSchedule={handleSaveBulkSchedule}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default WorkScheduleManagement;