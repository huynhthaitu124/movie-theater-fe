import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';
import { WorkSchedule } from '@/types';

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

class WorkScheduleService {
  /**
   * Get all work schedules
   */
  async getAllWorkSchedules(): Promise<ApiResponse<WorkSchedule[]>> {
    const response = await axiosClient.get<ApiResponse<WorkSchedule[]>>('/api/Workschedule/AllWorkschedule');
    return response.data;
  }

  /**
   * Get work schedule by ID
   */
  async getWorkScheduleById(id: string): Promise<ApiResponse<WorkSchedule>> {
    const response = await axiosClient.get<ApiResponse<WorkSchedule>>(`/api/Workschedule/GetWorkschedule/${id}`);
    return response.data;
  }

  /**
   * Get work schedules by cinema ID
   */
  async getWorkScheduleByCinemaId(cinemaId: string): Promise<ApiResponse<WorkSchedule[]>> {
    const response = await axiosClient.get<ApiResponse<WorkSchedule[]>>(`/api/Workschedule/GetWorkscheduleByCinemaId/${cinemaId}`);
    return response.data;
  }

  /**
   * Create a new work schedule
   */
  async createWorkSchedule(data: CreateWorkScheduleRequest): Promise<ApiResponse<WorkSchedule>> {
    const response = await axiosClient.post<ApiResponse<WorkSchedule>>('/api/Workschedule/CreateWorkschedule', data);
    return response.data;
  }

  /**
   * Update an existing work schedule
   */
  async updateWorkSchedule(data: UpdateWorkScheduleRequest): Promise<ApiResponse<WorkSchedule>> {
    const response = await axiosClient.put<ApiResponse<WorkSchedule>>('/api/Workschedule/UpdateWorkschedule', data);
    return response.data;
  }

  /**
   * Delete a work schedule
   */
  async deleteWorkSchedule(id: string): Promise<ApiResponse<boolean>> {
    const response = await axiosClient.delete<ApiResponse<boolean>>(`/api/Workschedule/Workschedule/${id}`);
    return response.data;
  }
}

export const workScheduleService = new WorkScheduleService();
export default workScheduleService;