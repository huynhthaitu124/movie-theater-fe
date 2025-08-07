import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';
import { API_ENDPOINTS } from '../api/endpoints';
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
    const response = await axiosClient.get<ApiResponse<WorkSchedule[]>>(API_ENDPOINTS.WORKSCHEDULE.GET_ALL);
    return response.data;
  }

  /**
   * Get work schedule by ID
   */
  async getWorkScheduleById(id: string): Promise<ApiResponse<WorkSchedule>> {
    const response = await axiosClient.get<ApiResponse<WorkSchedule>>(API_ENDPOINTS.WORKSCHEDULE.GET_BY_ID(id));
    return response.data;
  }

  /**
   * Get work schedules by cinema ID
   */
  async getWorkScheduleByCinemaId(cinemaId: string): Promise<ApiResponse<WorkSchedule[]>> {
    const response = await axiosClient.get<ApiResponse<WorkSchedule[]>>(API_ENDPOINTS.WORKSCHEDULE.GET_BY_CINEMA_ID(cinemaId));
    return response.data;
  }

  /**
   * Create a new work schedule
   */
  async createWorkSchedule(data: CreateWorkScheduleRequest): Promise<ApiResponse<WorkSchedule>> {
    const response = await axiosClient.post<ApiResponse<WorkSchedule>>(API_ENDPOINTS.WORKSCHEDULE.CREATE, data);
    return response.data;
  }

  /**
   * Update an existing work schedule
   */
  async updateWorkSchedule(data: UpdateWorkScheduleRequest): Promise<ApiResponse<WorkSchedule>> {
    const response = await axiosClient.put<ApiResponse<WorkSchedule>>(API_ENDPOINTS.WORKSCHEDULE.UPDATE, data);
    return response.data;
  }

  /**
   * Delete a work schedule
   */
  async deleteWorkSchedule(id: string): Promise<ApiResponse<boolean>> {
    const response = await axiosClient.delete<ApiResponse<boolean>>(API_ENDPOINTS.WORKSCHEDULE.DELETE(id));
    return response.data;
  }
}

export const workScheduleService = new WorkScheduleService();
export default workScheduleService;