import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { CategoryRequest } from '../types/request.types';
import { Category } from '../../types/category';

class CategoryService {
    async getAll(): Promise<ApiResponse<Category[]>> {
        const response = await axiosClient.get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORY.GET_ALL);
        return response.data;
    }

    async getById(id: string): Promise<ApiResponse<Category>> {
        const response = await axiosClient.get<ApiResponse<Category>>(API_ENDPOINTS.CATEGORY.GET_BY_ID(id));
        return response.data;
    }

    async create(data: CategoryRequest): Promise<ApiResponse<Category>> {
        const response = await axiosClient.post<ApiResponse<Category>>(API_ENDPOINTS.CATEGORY.CREATE, data);
        return response.data;
    }

    async update(id: string, data: CategoryRequest): Promise<ApiResponse<Category>> {
        const response = await axiosClient.put<ApiResponse<Category>>(API_ENDPOINTS.CATEGORY.UPDATE + `/${id}`, data);
        return response.data;
    }

    async delete(id: string): Promise<ApiResponse<void>> {
        const response = await axiosClient.delete<ApiResponse<void>>(API_ENDPOINTS.CATEGORY.DELETE(id));
        return response.data;
    }
}

export const categoryService = new CategoryService();
