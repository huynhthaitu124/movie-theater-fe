import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';
import { Combo } from '@/types/combo';

export interface ComboRequest {
  comboName: string;
  price: number;
  description?: string;
  image?: string;
  isActive?: boolean;
}

export interface UpdateComboRequest extends ComboRequest {
  comboId: string;
}

class ComboService {
  /**
   * Get all combos
   */
  async getAll(): Promise<ApiResponse<Combo[]>> {
    const response = await axiosClient.get<ApiResponse<Combo[]>>('/api/Combo');
    return response.data;
  }

  /**
   * Get combo by ID
   */
  async getById(id: string): Promise<ApiResponse<Combo>> {
  try {
    // Try with the correct endpoint name from your Swagger docs
    const response = await axiosClient.get<ApiResponse<Combo>>(`/api/Combo/GetComboById?id=${id}`);
    console.log('Combo by ID response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in getById:', error);
    throw error;
  }
}

  /**
   * Create a new combo
   */
  async create(data: ComboRequest): Promise<ApiResponse<Combo>> {
    const response = await axiosClient.post<ApiResponse<Combo>>('/api/Combo/CreateCombo', data);
    return response.data;
  }

  /**
   * Update an existing combo
   */
  async update(data: UpdateComboRequest): Promise<ApiResponse<Combo>> {
    const response = await axiosClient.put<ApiResponse<Combo>>('/api/Combo/UpdateCombo', data);
    return response.data;
  }

  /**
   * Delete a combo by changing its status
   */
  async deleteByChangeStatus(id: string): Promise<ApiResponse<boolean>> {
    const response = await axiosClient.delete<ApiResponse<boolean>>(`/api/Combo/DeleteComboByChangeStatus?id=${id}`);
    return response.data;
  }

  /**
   * Permanently delete a combo
   */
  async delete(id: string): Promise<ApiResponse<boolean>> {
    const response = await axiosClient.delete<ApiResponse<boolean>>(`/api/Combo/DeleteCombo?id=${id}`);
    return response.data;
  }

  /**
   * Reactivate a previously deactivated combo
   */
  async reactivate(id: string): Promise<ApiResponse<Combo>> {
    const response = await axiosClient.post<ApiResponse<Combo>>(`/api/Combo/ReActiveCombo/${id}`);
    return response.data;
  }
}

export const comboService = new ComboService();
export default comboService;