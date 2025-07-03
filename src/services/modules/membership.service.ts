import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';
import { Membership } from '../../types/membership';

class MembershipService {
  // Get all memberships
  async getAll(): Promise<ApiResponse<Membership[]>> {
    const response = await axiosClient.get<ApiResponse<Membership[]>>('/api/Membership');
    return response.data;
  }

  // Get membership by ID
  async getById(id: string): Promise<ApiResponse<Membership>> {
    const response = await axiosClient.get<ApiResponse<Membership>>(`/api/Membership/GetMembershipById`, { params: { id } });
    return response.data;
  }

  // Create a new membership
  async create(data: Membership): Promise<ApiResponse<Membership>> {
    const response = await axiosClient.post<ApiResponse<Membership>>('/api/Membership/CreateMembership', data);
    return response.data;
  }

  // Update a membership
  async update(data: Membership): Promise<ApiResponse<Membership>> {
    const response = await axiosClient.put<ApiResponse<Membership>>('/api/Membership/UpdateMembership', data);
    return response.data;
  }

  // Delete a membership by ID
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>(`/api/Membership/DeleteMembership/${id}`);
    return response.data;
  }

  // Reactivate a membership (usually needs an ID in body or params, adjust if needed)
  async reactivate(id: string): Promise<ApiResponse<Membership>> {
    const response = await axiosClient.post<ApiResponse<Membership>>('/api/Membership/ReActiveMembership', { id });
    return response.data;
  }
}

export const membershipService = new MembershipService();