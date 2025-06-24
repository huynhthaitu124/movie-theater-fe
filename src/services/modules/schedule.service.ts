import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { Schedule } from '../../types/schedule';

class ScheduleService {
  async getAll(): Promise<ApiResponse<Schedule[]>> {
    const response = await axiosClient.get<ApiResponse<Schedule[]>>(
      API_ENDPOINTS.MOVIE_SCHEDULE.GET_ALL
    );
    return response.data;
  }

  async create(data: Omit<Schedule, 'scheduleId'>): Promise<ApiResponse<Schedule>> {
    const response = await axiosClient.post<ApiResponse<Schedule>>(
      API_ENDPOINTS.MOVIE_SCHEDULE.CREATE,
      data
    );
    return response.data;
  }

  async update(id: string, data: Partial<Omit<Schedule, 'scheduleId'>>): Promise<ApiResponse<Schedule>> {
    const response = await axiosClient.put<ApiResponse<Schedule>>(
      API_ENDPOINTS.MOVIE_SCHEDULE.UPDATE(id),
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(
      API_ENDPOINTS.MOVIE_SCHEDULE.DELETE(id)
    );
    return response.data;
  }

  async getByMovie(movieId: string): Promise<ApiResponse<Schedule[]>> {
    const response = await axiosClient.get<ApiResponse<Schedule[]>>(
      API_ENDPOINTS.MOVIE_SCHEDULE.GET_BY_MOVIE(movieId)
    );
    return response.data;
  }

  async getForBooking(): Promise<ApiResponse<Schedule[]>> {
    const response = await axiosClient.get<ApiResponse<Schedule[]>>(
      API_ENDPOINTS.MOVIE_SCHEDULE.GET_FOR_BOOKING
    );
    return response.data;
  }
}

export const scheduleService = new ScheduleService();
