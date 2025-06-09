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
        const response = await axiosClient.post<ApiResponse<Movie>>(API_ENDPOINTS.MOVIE.CREATE, data);
        return response.data;
    }

    async update(id: string, data: MovieRequest): Promise<ApiResponse<Movie>> {
        const response = await axiosClient.put<ApiResponse<Movie>>(API_ENDPOINTS.MOVIE.UPDATE, { ...data, id });
        return response.data;
    }
}

export const movieService = new MovieService();
