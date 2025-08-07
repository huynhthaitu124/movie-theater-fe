import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';
import { API_ENDPOINTS } from '../api/endpoints';
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
    const response = await axiosClient.get<ApiResponse<StaffWorkSchedule[]>>(API_ENDPOINTS.STAFF_WORKSCHEDULE.GET_ALL);
    return response.data;
  }

  async getById(id: string): Promise<ApiResponse<StaffWorkSchedule>> {
    const response = await axiosClient.get<ApiResponse<StaffWorkSchedule>>(API_ENDPOINTS.STAFF_WORKSCHEDULE.GET_BY_ID(id));
    return response.data;
  }

  async getByStaffId(staffId: string): Promise<ApiResponse<StaffWorkSchedule[]>> {
    const response = await axiosClient.get<ApiResponse<StaffWorkSchedule[]>>(API_ENDPOINTS.STAFF_WORKSCHEDULE.GET_BY_STAFF_ID(staffId));
    return response.data;
  }

  async create(data: CreateStaffWorkScheduleRequest): Promise<ApiResponse<StaffWorkSchedule>> {
    const response = await axiosClient.post<ApiResponse<StaffWorkSchedule>>(API_ENDPOINTS.STAFF_WORKSCHEDULE.CREATE, data);
    return response.data;
  }

  /**
   * Update an existing staff work schedule
   */
  async update(data: UpdateStaffWorkScheduleRequest): Promise<ApiResponse<StaffWorkSchedule>> {
    const response = await axiosClient.put<ApiResponse<StaffWorkSchedule>>(API_ENDPOINTS.STAFF_WORKSCHEDULE.UPDATE, data);
    return response.data;
  }

  /**
   * Delete a staff work schedule
   */
  async delete(staffId: string, workScheduleId: string): Promise<ApiResponse<boolean>> {
    const response = await axiosClient.delete<ApiResponse<boolean>>(
      API_ENDPOINTS.STAFF_WORKSCHEDULE.DELETE(staffId, workScheduleId)
    );
    return response.data;
  }
}

export const staffWorkScheduleService = new StaffWorkScheduleService();
export default staffWorkScheduleService;