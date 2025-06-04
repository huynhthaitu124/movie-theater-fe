import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { MovieCategory } from '../../types/movie';

class MovieCategoryService {
    async getByMovie(movieId: string): Promise<ApiResponse<MovieCategory[]>> {
        const response = await axiosClient.get<ApiResponse<MovieCategory[]>>(API_ENDPOINTS.MOVIE_CATEGORY.GET_BY_MOVIE(movieId));
        return response.data;
    }

    async add(movieId: string, categoryId: string): Promise<ApiResponse<MovieCategory>> {
        const response = await axiosClient.post<ApiResponse<MovieCategory>>(API_ENDPOINTS.MOVIE_CATEGORY.ADD, { movieId, categoryId });
        return response.data;
    }

    async delete(movieId: string, categoryId: string): Promise<ApiResponse<void>> {
        const response = await axiosClient.delete<ApiResponse<void>>(`${API_ENDPOINTS.MOVIE_CATEGORY.DELETE}/${movieId}/${categoryId}`);
        return response.data;
    }
}

export const movieCategoryService = new MovieCategoryService();
