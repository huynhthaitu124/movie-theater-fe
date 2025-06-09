import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { StaffRequest, StaffResponse } from '../types/request.types';
import { Employee } from '../../types/employee';

class StaffService {
    async getAll(): Promise<ApiResponse<Employee[]>> {
        const response = await axiosClient.get<ApiResponse<Employee[]>>(API_ENDPOINTS.STAFF.GET_ALL);
        return response.data;
    }

    async create(data: StaffRequest): Promise<ApiResponse<Employee>> {
        const response = await axiosClient.post<ApiResponse<Employee>>(API_ENDPOINTS.STAFF.CREATE, data);
        return response.data;
    }

    async update(id: string, data: Partial<StaffRequest>): Promise<ApiResponse<Employee>> {
        const response = await axiosClient.put<ApiResponse<Employee>>(API_ENDPOINTS.STAFF.UPDATE(id), data);
        return response.data;
    }

    async getById(id: string): Promise<ApiResponse<Employee>> {
        const response = await axiosClient.get<ApiResponse<Employee>>(API_ENDPOINTS.STAFF.GET_BY_ID(id));
        return response.data;
    }

    async getByAccountId(accountId: string): Promise<ApiResponse<Employee>> {
        const response = await axiosClient.get<ApiResponse<Employee>>(API_ENDPOINTS.STAFF.GET_BY_ACCOUNT_ID(accountId));
        return response.data;
    }

    async delete(id: string): Promise<ApiResponse<void>> {
        const response = await axiosClient.delete<ApiResponse<void>>(API_ENDPOINTS.STAFF.DELETE(id));
        return response.data;
    }

    async deleteSoft(staffId: string): Promise<ApiResponse<StaffResponse>> {
        const response = await axiosClient.put<ApiResponse<StaffResponse>>(API_ENDPOINTS.STAFF.DELETE_SOFT(staffId));
        return response.data;
    }

    async reactivate(staffId: string): Promise<ApiResponse<StaffResponse>> {
        const response = await axiosClient.put<ApiResponse<StaffResponse>>(API_ENDPOINTS.STAFF.REACTIVATE(staffId));
        return response.data;
    }
}

export const staffService = new StaffService();
