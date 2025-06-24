import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { CinemaCreateDto, CinemaResponse } from '../types/request.types';

class CinemaService {
  async getAll(): Promise<ApiResponse<CinemaResponse[]>> {
    const response = await axiosClient.get<ApiResponse<CinemaResponse[]>>(API_ENDPOINTS.CINEMA.GET_ALL);
    return response.data;
  }

  async create(data: CinemaCreateDto): Promise<ApiResponse<CinemaResponse>> {
    const response = await axiosClient.post<ApiResponse<CinemaResponse>>(API_ENDPOINTS.CINEMA.CREATE, data);
    return response.data;
  }

  async update(id: string, data: Partial<CinemaCreateDto>): Promise<ApiResponse<CinemaResponse>> {
    const updateData = {
      cinemaid: id,
      cinemaname: data.cinemaname,
      address: data.address,
      city: data.city,
      phone: data.phone,
      email: data.email,
      totalroom: data.totalroom,
      opentime: data.opentime,
      closetime: data.closetime,
      status: data.status,
      isactive: data.isactive
    };
    
    const response = await axiosClient.put<ApiResponse<CinemaResponse>>(
      API_ENDPOINTS.CINEMA.UPDATE,
      updateData
    );
    return response.data;
  }

  async updateTotalRooms(id: string, totalroom: number): Promise<ApiResponse<CinemaResponse>> {
    try {
      // First get the current cinema data
      const currentCinema = await this.getAll().then(res => 
        res.data.find(cinema => cinema.cinemaid === id)
      );

      if (!currentCinema) {
        throw new Error('Cinema not found');
      }

      // Update with all required fields
      const updateData = {
        cinemaid: id,
        cinemaname: currentCinema.cinemaname,
        address: currentCinema.address,
        city: currentCinema.city,
        phone: currentCinema.phone,
        email: currentCinema.email,
        totalroom: totalroom, // Update only this value
        opentime: currentCinema.opentime,
        closetime: currentCinema.closetime,
        status: currentCinema.status,
        isactive: currentCinema.isactive
      };

      console.log('Updating cinema total rooms with data:', updateData);
      
      const response = await axiosClient.put<ApiResponse<CinemaResponse>>(
        API_ENDPOINTS.CINEMA.UPDATE,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating cinema total rooms:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(
      `${API_ENDPOINTS.CINEMA.DELETE}?cinemaId=${id}`
    );
    return response.data;
  }
}

export const cinemaService = new CinemaService();