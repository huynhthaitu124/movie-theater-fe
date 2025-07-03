// movie.service.ts - Updated to handle file uploads properly
import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { MovieRequest } from '../types/request.types';
import { Movie } from '../../types/movie';

class MovieService {
    async getAll(): Promise<ApiResponse<Movie[]>> {
        const response = await axiosClient.get<ApiResponse<Movie[]>>(API_ENDPOINTS.MOVIE.GET_ALL);
        return response.data;
    }

    async create(data: MovieRequest): Promise<ApiResponse<Movie>> {
        const response = await axiosClient.post<ApiResponse<Movie>>(
            API_ENDPOINTS.MOVIE.CREATE,
            data // send as JSON, not FormData
        );
        return response.data;
    }

    async update(id: string, data: MovieRequest): Promise<ApiResponse<Movie>> {
        const response = await axiosClient.put<ApiResponse<Movie>>(
            API_ENDPOINTS.MOVIE.UPDATE,
            { movieId: id, ...data } // <-- use movieId, not id
        );
        return response.data;
    }
}

export const movieService = new MovieService();