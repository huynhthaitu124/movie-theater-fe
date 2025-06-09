import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { Role } from '../../types/role';
import { RoleRequest } from '../types/request.types';

class RoleService {
    async getAll(): Promise<ApiResponse<Role[]>> {
        const response = await axiosClient.get<ApiResponse<Role[]>>(API_ENDPOINTS.ROLE.GET_ALL);
        return response.data;
    }

    async getById(id: string): Promise<ApiResponse<Role>> {
        const response = await axiosClient.get<ApiResponse<Role>>(API_ENDPOINTS.ROLE.GET_BY_ID(id));
        return response.data;
    }

    async create(data: RoleRequest): Promise<ApiResponse<Role>> {
        const response = await axiosClient.post<ApiResponse<Role>>(API_ENDPOINTS.ROLE.CREATE, data);
        return response.data;
    }

    async update(id: string, data: Partial<RoleRequest>): Promise<ApiResponse<Role>> {
        const response = await axiosClient.put<ApiResponse<Role>>(API_ENDPOINTS.ROLE.UPDATE, { ...data, id });
        return response.data;
    }

    async delete(id: string): Promise<ApiResponse<void>> {
        const response = await axiosClient.delete<ApiResponse<void>>(API_ENDPOINTS.ROLE.DELETE(id));
        return response.data;
    }
}

export const roleService = new RoleService();
