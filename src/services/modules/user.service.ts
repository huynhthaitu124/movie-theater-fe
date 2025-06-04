import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { User } from '../../types/user';

export class UserService {
    async getAllUsers(): Promise<ApiResponse<User[]>> {
        const response = await axiosClient.get<ApiResponse<User[]>>(API_ENDPOINTS.ACCOUNT.GET_ALL);
        return response.data;
    }

    async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> {
        const response = await axiosClient.post<ApiResponse<User>>(API_ENDPOINTS.ACCOUNT.CREATE, userData);
        return response.data;
    }

    async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
        const response = await axiosClient.put<ApiResponse<User>>(API_ENDPOINTS.ACCOUNT.UPDATE, userData);
        return response.data;
    }
}