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

    // Get all movie schedules
    async getAllMovieSchedules(): Promise<ApiResponse<Showtime[]>> {
        const response = await axiosClient.get<ApiResponse<Showtime[]>>('/api/MovieSchedule/GetAllMovieSchedules');
        return response.data;
    }

    // Get movie schedules by movieId (path param, matches your backend)
    async getMovieScheduleByMovieId(movieId: string): Promise<ApiResponse<Showtime[]>> {
        const response = await axiosClient.get<ApiResponse<Showtime[]>>(
            `/api/MovieSchedule/GetMovieSchedule/${movieId}`
        );
        return response.data;
    }

    // Get movie schedule for booking (query params)
    async getMovieScheduleForBooking(movieId: string, cinemaId: string): Promise<ApiResponse<Showtime[]>> {
        const response = await axiosClient.get<ApiResponse<Showtime[]>>(
            `/api/MovieSchedule/GetMovieScheduleForBooking`,
            { params: { movieId, cinemaId } }
        );
        return response.data;
    }

    // Add a movie schedule
    async addMovieSchedule(data: any): Promise<ApiResponse<Showtime>> {
        const response = await axiosClient.post<ApiResponse<Showtime>>('/api/MovieSchedule/AddMovieSchedule', data);
        return response.data;
    }

    // Soft delete a movie schedule
    async softDeleteMovieSchedule(id: string): Promise<ApiResponse<void>> {
        const response = await axiosClient.delete<ApiResponse<void>>(`/api/MovieSchedule/DeleteMovieSchedule`, { params: { id } });
        return response.data;
    }

    // Hard delete a movie schedule
    async hardDeleteMovieSchedule(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(
        `/api/MovieSchedule/HardDeleteMovieSchedule`, 
        { params: { scheduleId: id } }
    );
    return response.data;
}

    async getSchedulesByCinema(cinemaId: string): Promise<ApiResponse<any[]>> {
    const response = await axiosClient.get<ApiResponse<any[]>>(
        `/api/MovieSchedule/GetSchedulesByCinema`,
        { params: { cinemaId } }
    );
    return response.data;
    }

    
}

export const showtimeService = new ShowtimeService();
