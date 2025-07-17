import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';
import { PromotionType } from '../../types/promotion';

class PromotionTypeService {
  // Get all promotions
  async getAll(): Promise<ApiResponse<PromotionType[]>> {
    const response = await axiosClient.get<ApiResponse<PromotionType[]>>('/api/PromotionType/GetAllPromotionTypes');
    return response.data;
  }

  // Create a new promotion
  async create(data: PromotionType): Promise<ApiResponse<PromotionType>> {
    const response = await axiosClient.post<ApiResponse<PromotionType>>('/api/PromotionType/CreatePromotionType', data);
    return response.data;
  }

  // Update a promotion
  async update(data: PromotionType): Promise<ApiResponse<PromotionType>> {
    const response = await axiosClient.put<ApiResponse<PromotionType>>('/api/PromotionType/UpdatePromotionType', data);
    return response.data;
  }

  // Delete a promotion
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>('/api/PromotionType/DeletePromotionType', { params: { id } });
    return response.data;
  }
}

export const promotionTypeService = new PromotionTypeService();