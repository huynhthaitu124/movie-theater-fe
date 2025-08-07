import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';
import { ComboProduct } from '../../types/combo';

export interface ComboProductRequest {
  comboId: string;
  productId: string;
  quantity: number;
}

export interface UpdateComboProductRequest extends ComboProductRequest {
  comboProductId: string;
}

class ComboProductService {
  /**
   * Get all combo products
   */
  async getAll(): Promise<ApiResponse<ComboProduct[]>> {
    const response = await axiosClient.get<ApiResponse<ComboProduct[]>>('/api/ComboProduct');
    return response.data;
  }

  /**
   * Get combo product by ID
   */
  async getById(id: string): Promise<ApiResponse<ComboProduct>> {
    const response = await axiosClient.get<ApiResponse<ComboProduct>>(`/api/ComboProduct/GetComboById/${id}`);
    return response.data;
  }

  /**
   * Create a new combo product
   */
  async create(data: ComboProductRequest): Promise<ApiResponse<ComboProduct>> {
    const response = await axiosClient.post<ApiResponse<ComboProduct>>('/api/ComboProduct', data);
    return response.data;
  }

  /**
   * Update an existing combo product
   */
  async update(data: UpdateComboProductRequest): Promise<ApiResponse<ComboProduct>> {
    const response = await axiosClient.put<ApiResponse<ComboProduct>>('/api/ComboProduct', data);
    return response.data;
  }

  /**
   * Delete a combo product
   */
  async delete(comboId: string, productId: string): Promise<ApiResponse<boolean>> {
  const response = await axiosClient.delete<ApiResponse<boolean>>(
    `/api/ComboProduct?comboId=${comboId}&productId=${productId}`
  );
  return response.data;
}
}

export const comboProductService = new ComboProductService();
export default comboProductService;