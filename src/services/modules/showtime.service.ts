import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { Showtime } from '../../types/showtime';

class ShowtimeService {
    async getAll(): Promise<ApiResponse<Showtime[]>> {
        const response = await axiosClient.get<ApiResponse<Showtime[]>>(API_ENDPOINTS.SHOWTIME.GET_ALL);
        return response.data;
    }

    async create(data: Omit<Showtime, 'id'>): Promise<ApiResponse<Showtime>> {
        const response = await axiosClient.post<ApiResponse<Showtime>>(API_ENDPOINTS.SHOWTIME.CREATE, data);
        return response.data;
    }

    async createMany(showtimes: Omit<Showtime, 'id'>[]): Promise<ApiResponse<Showtime[]>> {
        const response = await axiosClient.post<ApiResponse<Showtime[]>>(API_ENDPOINTS.SHOWTIME.CREATE_MANY, showtimes);
        return response.data;
    }

    async update(id: string, data: Partial<Omit<Showtime, 'id'>>): Promise<ApiResponse<Showtime>> {
        const response = await axiosClient.put<ApiResponse<Showtime>>(API_ENDPOINTS.SHOWTIME.UPDATE(id), data);
        return response.data;
    }

    async delete(id: string): Promise<ApiResponse<void>> {
        const response = await axiosClient.delete<ApiResponse<void>>(API_ENDPOINTS.SHOWTIME.DELETE(id));
        return response.data;
    }

    async getByMovie(movieId: string): Promise<ApiResponse<Showtime[]>> {
        const response = await axiosClient.get<ApiResponse<Showtime[]>>(API_ENDPOINTS.SHOWTIME.GET_BY_MOVIE(movieId));
        return response.data;
    }
}

export const showtimeService = new ShowtimeService();
