import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';
import { Promotion } from '../../types/promotion';

class PromotionService {
  // Get all promotions
  async getAll(): Promise<ApiResponse<Promotion[]>> {
    const response = await axiosClient.get<ApiResponse<Promotion[]>>('/api/Promotion');
    return response.data;
  }

  // Create a new promotion
  async create(data: Promotion): Promise<ApiResponse<Promotion>> {
    const response = await axiosClient.post<ApiResponse<Promotion>>('/api/Promotion', data);
    return response.data;
  }

  // Update a promotion
  async update(data: Promotion): Promise<ApiResponse<Promotion>> {
    const response = await axiosClient.put<ApiResponse<Promotion>>('/api/Promotion', data);
    return response.data;
  }

  // Delete a promotion
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>('/api/Promotion', { params: { id } });
    return response.data;
  }
}

export const promotionService = new PromotionService();