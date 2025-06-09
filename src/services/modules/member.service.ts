import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { ApiResponse } from '../types/response.types';
import { MemberRequest } from '../types/request.types';
import { Member } from '../../types/member';

class MemberService {
    async getAll(): Promise<ApiResponse<Member[]>> {
        const response = await axiosClient.get<ApiResponse<Member[]>>(API_ENDPOINTS.MEMBER.GET_ALL);
        return response.data;
    }

    async create(data: MemberRequest): Promise<ApiResponse<Member>> {
        const response = await axiosClient.post<ApiResponse<Member>>(API_ENDPOINTS.MEMBER.CREATE, data);
        return response.data;
    }

    async update(id: string, data: Partial<MemberRequest>): Promise<ApiResponse<Member>> {
        const response = await axiosClient.put<ApiResponse<Member>>(API_ENDPOINTS.MEMBER.UPDATE(id), data);
        return response.data;
    }

    async getById(id: string): Promise<ApiResponse<Member>> {
        const response = await axiosClient.get<ApiResponse<Member>>(API_ENDPOINTS.MEMBER.GET_BY_ID(id));
        return response.data;
    }

    async delete(id: string): Promise<ApiResponse<void>> {
        const response = await axiosClient.delete<ApiResponse<void>>(API_ENDPOINTS.MEMBER.DELETE(id));
        return response.data;
    }

    async deleteSoft(memberId: string): Promise<ApiResponse<Member>> {
        const response = await axiosClient.put<ApiResponse<Member>>(API_ENDPOINTS.MEMBER.DELETE_SOFT(memberId));
        return response.data;
    }

    async reactivate(memberId: string): Promise<ApiResponse<Member>> {
        const response = await axiosClient.put<ApiResponse<Member>>(API_ENDPOINTS.MEMBER.REACTIVATE(memberId));
        return response.data;
    }
}

export const memberService = new MemberService();
