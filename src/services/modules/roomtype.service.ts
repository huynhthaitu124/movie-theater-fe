import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { RoomTypeResponse } from '../types/request.types';

class RoomTypeService {
  async getAll(): Promise<ApiResponse<RoomTypeResponse[]>> {
    const response = await axiosClient.get<ApiResponse<RoomTypeResponse[]>>(API_ENDPOINTS.ROOMTYPE.GET_ALL);
    return response.data;
  }
}

export const roomTypeService = new RoomTypeService();