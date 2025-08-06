import { useState, useCallback } from 'react';
import { Schedule, ScheduleFormData } from '../types/workSchedule';
import { Staff } from '../types/user';

// Sample staff data - replace with API call in production
const SAMPLE_STAFF: Staff[] = [
  {
    id: '1',
    accountId: 'acc1',
    displayName: 'John Smith',
    email: 'john@cinema.com',
    phone: '+1 234 567 8901',
    role: 'Manager',
    department: 'Management',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-06-10')
  },
  {
    id: '2',
    accountId: 'acc2',
    displayName: 'Sarah Johnson',
    email: 'sarah@cinema.com',
    phone: '+1 234 567 8902',
    role: 'Cashier',
    department: 'Box Office',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-05-15')
  },
  {
    id: '3',
    accountId: 'acc3',
    displayName: 'Mike Wilson',
    email: 'mike@cinema.com',
    phone: '+1 234 567 8903',
    role: 'Projectionist',
    department: 'Technical',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-07-01')
  },
  {
    id: '4',
    accountId: 'acc4',
    displayName: 'Emily Davis',
    email: 'emily@cinema.com',
    phone: '+1 234 567 8904',
    role: 'Usher',
    department: 'Operations',
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-08-01')
  },
  {
    id: '5',
    accountId: 'acc5',
    displayName: 'David Brown',
    email: 'david@cinema.com',
    phone: '+1 234 567 8905',
    role: 'Security',
    department: 'Security',
    createdAt: new Date('2023-04-12'),
    updatedAt: new Date('2023-09-01')
  },
  {
    id: '6',
    accountId: 'acc6',
    displayName: 'Lisa Anderson',
    email: 'lisa@cinema.com',
    phone: '+1 234 567 8906',
    role: 'Cleaner',
    department: 'Maintenance',
    createdAt: new Date('2023-02-28'),
    updatedAt: new Date('2023-08-15')
  }
];

// Sample schedules data - replace with API call in production
const SAMPLE_SCHEDULES: Schedule[] = [
  {
    id: '1',
    staffId: '1',
    cinemaId: '1',
    workdate: '2025-08-06',
    starttime: '09:00',
    endtime: '17:00',
    role: 'Manager',
    notes: 'Opening shift management'
  },
  {
    id: '2',
    staffId: '2',
    cinemaId: '1',
    workdate: '2025-08-06',
    starttime: '10:00',
    endtime: '18:00',
    role: 'Cashier',
    notes: 'Box office duties'
  },
  {
    id: '3',
    staffId: '3',
    cinemaId: '2',
    workdate: '2025-08-07',
    starttime: '14:00',
    endtime: '22:00',
    role: 'Projectionist'
  },
  {
    id: '4',
    staffId: '4',
    cinemaId: '3',
    workdate: '2025-08-05',
    starttime: '12:00',
    endtime: '20:00',
    role: 'Usher',
    notes: 'Afternoon shift'
  },
  {
    id: '5',
    staffId: '5',
    cinemaId: '1',
    workdate: '2025-08-08',
    starttime: '16:00',
    endtime: '00:00',
    role: 'Security',
    notes: 'Evening security'
  }
];

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>(SAMPLE_SCHEDULES);
  const [staff] = useState<Staff[]>(SAMPLE_STAFF);

  // Add a single schedule without staff assignment
  const addSchedule = useCallback((newScheduleData: Omit<Schedule, 'id' | 'staffId' | 'role'>) => {
    const schedule: Schedule = {
      ...newScheduleData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      staffId: '', // Empty staffId to be assigned later
      role: '' // Empty role to be filled when staff is assigned
    };
    
    setSchedules(prev => [...prev, schedule]);
    return schedule;
  }, []);

  // Add multiple schedules at once without staff assignment
  const addMultipleSchedules = useCallback((scheduleData: Omit<Schedule, 'id' | 'staffId' | 'role'>, count: number) => {
    const newSchedules = Array.from({ length: count }).map(() => ({
      ...scheduleData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      staffId: '', // Empty staffId to be assigned later
      role: '' // Empty role to be filled when staff is assigned
    } as Schedule));
    
    setSchedules(prev => [...prev, ...newSchedules]);
    return newSchedules;
  }, []);

  // Update an existing schedule
  const updateSchedule = useCallback((id: string, updatedSchedule: Partial<Schedule>) => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.id === id) {
        // If staffId is being updated, also update the role
        if (updatedSchedule.staffId && updatedSchedule.staffId !== schedule.staffId) {
          const assignedStaff = staff.find(s => s.id === updatedSchedule.staffId);
          return { 
            ...schedule, 
            ...updatedSchedule,
            role: assignedStaff?.role || schedule.role
          };
        }
        return { ...schedule, ...updatedSchedule };
      }
      return schedule;
    }));
  }, [staff]);

  // Delete a schedule
  const deleteSchedule = useCallback((id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
  }, []);

  // Get schedules for a specific date
  const getSchedulesForDate = useCallback((date: string) => {
    return schedules.filter(schedule => schedule.workdate === date);
  }, [schedules]);

  // Get schedules for a week starting from the given date
  const getSchedulesForWeek = useCallback((startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.workdate);
      return scheduleDate >= startDate && scheduleDate <= endDate;
    });
  }, [schedules]);

  // Get schedules for a specific cinema
  const getSchedulesForCinema = useCallback((cinemaId: string) => {
    return schedules.filter(schedule => schedule.cinemaId === cinemaId);
  }, [schedules]);

  // Check for staff schedule conflicts
  const checkConflict = useCallback((staffId: string, date: string, startTime: string, endTime: string, excludeId?: string) => {
    const daySchedules = schedules.filter(s => 
      s.staffId === staffId && 
      s.workdate === date && 
      s.id !== excludeId
    );

    return daySchedules.some(schedule => {
      const newStart = new Date(`${date}T${startTime}`);
      const newEnd = new Date(`${date}T${endTime}`);
      const existingStart = new Date(`${schedule.workdate}T${schedule.starttime}`);
      const existingEnd = new Date(`${schedule.workdate}T${schedule.endtime}`);

      return (newStart < existingEnd && newEnd > existingStart);
    });
  }, [schedules]);

  return {
    schedules,
    staff,
    addSchedule,
    addMultipleSchedules,
    updateSchedule,
    deleteSchedule,
    getSchedulesForDate,
    getSchedulesForWeek,
    getSchedulesForCinema,
    checkConflict
  };
};
