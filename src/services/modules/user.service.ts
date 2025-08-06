import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { User } from '../../types/user';
import { AccountRequest } from '../types/request.types';

class UserService {
    async getAll(): Promise<ApiResponse<User[]>> {
        const response = await axiosClient.get<ApiResponse<User[]>>(API_ENDPOINTS.ACCOUNT.GET_ALL);
        return response.data;
    }

    async create(accountData: AccountRequest): Promise<ApiResponse<User>> {
        const response = await axiosClient.post<ApiResponse<User>>(API_ENDPOINTS.ACCOUNT.CREATE, accountData);
        return response.data;
    }

    async update(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
        console.log('Updating user with ID:', id, 'and data:', userData);
        const response = await axiosClient.put<ApiResponse<User>>(API_ENDPOINTS.ACCOUNT.UPDATE(id), userData);
        return response.data;
    }

    async getById(id: string): Promise<ApiResponse<User>> {
        const response = await axiosClient.get<ApiResponse<User>>(API_ENDPOINTS.ACCOUNT.GET_BY_ID(id));
        return response.data;
    }
}

export const userService = new UserService();