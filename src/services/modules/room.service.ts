import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { RoomCreateDto, RoomResponse } from '../types/request.types';

class RoomService {
  async getAll(): Promise<ApiResponse<RoomResponse[]>> {
    const response = await axiosClient.get<ApiResponse<RoomResponse[]>>(API_ENDPOINTS.ROOM.GET_ALL);
    console.log('Room API response:', response.data); // Add logging
    return response.data;
  }

  async create(data: RoomCreateDto): Promise<ApiResponse<RoomResponse>> {
    console.log('Creating room with data:', data); // Add logging
    const response = await axiosClient.post<ApiResponse<RoomResponse>>(
      API_ENDPOINTS.ROOM.CREATE,
      data
    );
    return response.data;
  }

  async update(roomId: string, data: Partial<RoomCreateDto>): Promise<ApiResponse<RoomResponse>> {
    const updateData = {
      roomId: roomId,
      ...data
    };
    
    console.log('Updating room with data:', updateData);
    
    const response = await axiosClient.put<ApiResponse<RoomResponse>>(
      API_ENDPOINTS.ROOM.UPDATE,
      updateData
    );
    return response.data;
  }

  async delete(roomId: string): Promise<ApiResponse<void>> {
    // Change query parameter to use capital 'I' in roomId to match API
    const response = await axiosClient.delete<ApiResponse<void>>(
      `${API_ENDPOINTS.ROOM.DELETE}?roomId=${roomId}`
    );
    console.log('Delete room request:', roomId); // Add logging
    return response.data;
  }
}

export const roomService = new RoomService();