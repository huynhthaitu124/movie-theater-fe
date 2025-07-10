import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';
import { Invoice, InvoiceRequest } from '../../types/invoice';

class InvoiceService {
  async getAll(): Promise<ApiResponse<Invoice[]>> {
    const response = await axiosClient.get<ApiResponse<Invoice[]>>('/api/Invoice');
    return response.data;
  }

  async getById(invoiceId: string): Promise<ApiResponse<Invoice>> {
    const response = await axiosClient.get<ApiResponse<Invoice>>(`/api/Invoice/${invoiceId}`);
    return response.data;
  }

  async getByAccountId(accountId: string): Promise<ApiResponse<Invoice[]>> {
    const response = await axiosClient.get<ApiResponse<Invoice[]>>(`/api/Invoice/account/${accountId}`);
    return response.data;
  }

  async create(data: InvoiceRequest): Promise<ApiResponse<Invoice>> {
    const response = await axiosClient.post<ApiResponse<Invoice>>('/api/Invoice', data);
    return response.data;
  }

  async update(invoiceId: string, data: InvoiceRequest): Promise<ApiResponse<Invoice>> {
    const response = await axiosClient.put<ApiResponse<Invoice>>(`/api/Invoice/${invoiceId}`, data);
    return response.data;
  }

  async delete(invoiceId: string): Promise<ApiResponse<any>> {
    const response = await axiosClient.delete<ApiResponse<any>>(`/api/Invoice/${invoiceId}`);
    return response.data;
  }
}

export const invoiceService = new InvoiceService();