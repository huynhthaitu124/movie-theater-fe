import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';

class MovieCinemaService {
  async getMoviesByCinema(cinemaId: string): Promise<ApiResponse<any[]>> {
    const response = await axiosClient.get<ApiResponse<any[]>>(`/api/MovieCinema/by-cinema/${cinemaId}`);
    return response.data;
  }

  async addMoviesToCinema(cinemaId: string, movieIds: string[]): Promise<ApiResponse<any>> {
    const response = await axiosClient.post<ApiResponse<any>>('/api/MovieCinema/add', {
      cinemaId,
      movieIds,
    });
    return response.data;
  }

  async removeMovieFromCinema(cinemaId: string, movieId: string): Promise<ApiResponse<any>> {
    const response = await axiosClient.delete<ApiResponse<any>>('/api/MovieCinema/delete', {
      data: { cinemaId, movieId } // property names must match backend exactly
    });
    return response.data;
  }
}

export const movieCinemaService = new MovieCinemaService();