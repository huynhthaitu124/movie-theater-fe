export interface WorkSchedule {
  workScheduleId: string;
  cinemaid: string;  // lowercase as returned by API
  workdate: string;
  starttime: string; 
  endtime: string;
  isactive: boolean; // lowercase as returned by API
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkScheduleRequest {
  cinemaId: string;
  workdate: string;
  startTime: string;
  endTime: string;
}

export interface UpdateWorkScheduleRequest {
  workScheduleId: string;
  cinemaId: string;
  workdate: string;
  startTime: string;
  endTime: string;
}

export interface WorkScheduleFormData {
  workdate: string;
  startTime: string;
  endTime: string;
}

export interface BulkScheduleFormData {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  selectedDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}