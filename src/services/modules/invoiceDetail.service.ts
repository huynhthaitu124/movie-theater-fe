import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';
import { InvoiceDetail, InvoiceDetailRequest } from '../../types/invoiceDetail';

class InvoiceDetailService {
  async getAll(): Promise<ApiResponse<InvoiceDetail[]>> {
    const response = await axiosClient.get<ApiResponse<InvoiceDetail[]>>('/api/InvoiceDetail');
    return response.data;
  }

  async getById(id: string): Promise<ApiResponse<InvoiceDetail>> {
    const response = await axiosClient.get<ApiResponse<InvoiceDetail>>(`/api/InvoiceDetail/${id}`);
    return response.data;
  }

  async getByInvoiceId(invoiceId: string): Promise<ApiResponse<InvoiceDetail[]>> {
    const response = await axiosClient.get<ApiResponse<InvoiceDetail[]>>(`/api/InvoiceDetail/invoice/${invoiceId}`);
    return response.data;
  }

  async create(data: InvoiceDetailRequest): Promise<ApiResponse<InvoiceDetail>> {
    const response = await axiosClient.post<ApiResponse<InvoiceDetail>>('/api/InvoiceDetail', data);
    return response.data;
  }

  async update(id: string, data: InvoiceDetailRequest): Promise<ApiResponse<InvoiceDetail>> {
    const response = await axiosClient.put<ApiResponse<InvoiceDetail>>('/api/InvoiceDetail', { id, ...data });
    return response.data;
  }

  async delete(id: string): Promise<ApiResponse<any>> {
    const response = await axiosClient.delete<ApiResponse<any>>(`/api/InvoiceDetail/${id}`);
    return response.data;
  }
}

export const invoiceDetailService = new InvoiceDetailService();