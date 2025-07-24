import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';

class AccountMemberShipService {
  // GET: Get all member accounts
  async getAll(): Promise<ApiResponse<any[]>> {
    const response = await axiosClient.get<ApiResponse<any[]>>('/api/AccountMemberShip');
    return response.data;
  }

  // PUT: Update member account info
  async update(data: any): Promise<ApiResponse<any>> {
    const response = await axiosClient.put<ApiResponse<any>>('/api/AccountMemberShip', data);
    return response.data;
  }

  // GET: Get member info by ID
  async getById(accMemId: string): Promise<ApiResponse<any>> {
    const response = await axiosClient.get<ApiResponse<any>>(`/api/AccountMemberShip/GetAccountMembershipById?id=${accMemId}`);
    return response.data;
  }

  // POST: Create new member account
  async create(data: any): Promise<ApiResponse<any>> {
    const response = await axiosClient.post<ApiResponse<any>>('/api/AccountMemberShip/CreateAccountMembership', data);
    return response.data;
  }

  // DELETE: Delete member account by ID
  async delete(accMemId: string): Promise<ApiResponse<any>> {
    const response = await axiosClient.delete<ApiResponse<any>>(`/api/AccountMemberShip/DeleteAccountMember/${accMemId}`);
    return response.data;
  }

  // PUT: Reactivate member account by account ID
  async reactivate(accId: string): Promise<ApiResponse<any>> {
    const response = await axiosClient.put<ApiResponse<any>>(`/api/AccountMemberShip/ReaciveAccountMembership/${accId}`);
    return response.data;
  }

  // PUT: Promote member account (rank up)
  async promote(data: any): Promise<ApiResponse<any>> {
    const response = await axiosClient.put<ApiResponse<any>>('/api/AccountMemberShip/PromoteAccountMembership', data);
    return response.data;
  }

  // PUT: Revoke member rank by account ID
  async revokeRank(accountId: string): Promise<ApiResponse<any>> {
    const response = await axiosClient.put<ApiResponse<any>>(`/api/AccountMemberShip/RevokeAccountMembershipRank/${accountId}`);
    return response.data;
  }
}

export const accountMemberShipService = new AccountMemberShipService();