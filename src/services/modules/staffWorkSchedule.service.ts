import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';
import { StaffWorkSchedule } from '../../types/staffWorkSchedule';

export interface CreateStaffWorkScheduleRequest {
  staffId: string;
  workScheduleId: string;
}

export interface UpdateStaffWorkScheduleRequest {
  staffWorkScheduleId: string;
  staffId: string;
  workScheduleId: string;
}

class StaffWorkScheduleService {
  /**
   * Get all staff work schedules
   */
  async getAll(): Promise<ApiResponse<StaffWorkSchedule[]>> {
    const response = await axiosClient.get<ApiResponse<StaffWorkSchedule[]>>('/api/StaffWorkschedule/GetAll');
    return response.data;
  }

  async getById(id: string): Promise<ApiResponse<StaffWorkSchedule>> {
    const response = await axiosClient.get<ApiResponse<StaffWorkSchedule>>(`/api/StaffWorkschedule/GetById/${id}`);
    return response.data;
  }

  async getByStaffId(staffId: string): Promise<ApiResponse<StaffWorkSchedule[]>> {
    const response = await axiosClient.get<ApiResponse<StaffWorkSchedule[]>>(`/api/StaffWorkschedule/GetWorkscheduleByStaffId/${staffId}`);
    return response.data;
  }

  async create(data: CreateStaffWorkScheduleRequest): Promise<ApiResponse<StaffWorkSchedule>> {
    const response = await axiosClient.post<ApiResponse<StaffWorkSchedule>>('/api/StaffWorkschedule/Create', data);
    return response.data;
  }

  /**
   * Update an existing staff work schedule
   */
  async update(data: UpdateStaffWorkScheduleRequest): Promise<ApiResponse<StaffWorkSchedule>> {
    const response = await axiosClient.put<ApiResponse<StaffWorkSchedule>>('/api/StaffWorkschedule/Update', data);
    return response.data;
  }

  /**
   * Delete a staff work schedule
   */
  async delete(staffId: string, workScheduleId: string): Promise<ApiResponse<boolean>> {
    const response = await axiosClient.delete<ApiResponse<boolean>>(
      `/api/StaffWorkschedule/Delete?staffId=${staffId}&workscheduleid=${workScheduleId}`
    );
    return response.data;
  }
}

export const staffWorkScheduleService = new StaffWorkScheduleService();
export default staffWorkScheduleService;