import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { RatingRequest } from '../types/request.types';

interface Rating {
    id: string;
    movieId: string;
    accountId: string;
    score: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export class RatingService {
    async getAll(): Promise<ApiResponse<Rating[]>> {
        const response = await axiosClient.get<ApiResponse<Rating[]>>(API_ENDPOINTS.RATING.GET_ALL);
        return response.data;
    }

    async getByMovieAndAccount(movieId: string, accountId: string): Promise<ApiResponse<Rating>> {
        const response = await axiosClient.get<ApiResponse<Rating>>(API_ENDPOINTS.RATING.GET_BY_MOVIE_AND_ACCOUNT(movieId, accountId));
        return response.data;
    }

    async create(data: RatingRequest): Promise<ApiResponse<Rating>> {
        const response = await axiosClient.post<ApiResponse<Rating>>(API_ENDPOINTS.RATING.CREATE, data);
        return response.data;
    }

    async update(movieId: string, accountId: string, data: Partial<RatingRequest>): Promise<ApiResponse<Rating>> {
        const response = await axiosClient.put<ApiResponse<Rating>>(
            API_ENDPOINTS.RATING.UPDATE_BY_MOVIE_AND_ACCOUNT(movieId, accountId), 
            data
        );
        return response.data;
    }

    async delete(movieId: string, accountId: string): Promise<ApiResponse<void>> {
        const response = await axiosClient.delete<ApiResponse<void>>(
            API_ENDPOINTS.RATING.DELETE_BY_MOVIE_AND_ACCOUNT(movieId, accountId)
        );
        return response.data;
    }
}
