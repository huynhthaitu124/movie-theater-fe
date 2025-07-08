import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { CreateTransactionRequest } from '../types/request.types';
import { TransactionResponse } from '../types/response.types';

interface ValidateTransactionRequest {
  accountId: string;
  invoiceId: string
  scheduleId: string;
  gatewayId: string; // vnp_TxnRef
  seatIds: string[]; // Array of seat IDs the user selected
}

export interface ValidateTransactionResponse {
  status: number;
  message: string;
  data: {
    success: boolean;
    transactionId: string;
    paymentStatus: string;
  }
}

export const transactionService = {
  getAll: async () => {
    const response = await axiosClient.get('/api/Transaction');
    return response.data;
  },

  createTransaction: async (data: CreateTransactionRequest): Promise<TransactionResponse> => {
    // Debug: Log the request data before sending
    console.log('Transaction request data:', JSON.stringify(data));
    console.log('seatIds type:', Array.isArray(data.seatIds) ? 'Array' : typeof data.seatIds);
    console.log('seatIds length:', Array.isArray(data.seatIds) ? data.seatIds.length : 'Not an array');
    
    const response = await axiosClient.post<TransactionResponse>(API_ENDPOINTS.TRANSACTION.CREATE, data);
    
    // Debug: Log the response
    console.log('Transaction API response:', JSON.stringify(response.data));
    return response.data;
  },
  
  getTransactionById: async (id: string): Promise<TransactionResponse> => {
    const response = await axiosClient.get<TransactionResponse>(API_ENDPOINTS.TRANSACTION.GET_BY_ID(id));
    return response.data;
  },

  async getByAccountId(accountId: string): Promise<ApiResponse<Transaction[]>> {
    const response = await axiosClient.get<ApiResponse<Transaction[]>>(`/api/Transaction/account/${accountId}`);
    return response.data;
  },

  getTransactionByInvoiceId: async (id: string): Promise<TransactionResponse> => {
    const response = await axiosClient.get<TransactionResponse>(`/api/Transaction/invoice/${id}`);
    return response.data;
  },
  
  validateTransaction: async (data: ValidateTransactionRequest): Promise<ValidateTransactionResponse> => {
    try {
      // Log the request data before sending
      console.log('Transaction validation request data:', JSON.stringify(data));
      
      const response = await axiosClient.post<ValidateTransactionResponse>(API_ENDPOINTS.TRANSACTION.VALIDATE, data);
      
      // Log the response for debugging
      console.log('Transaction validation API response:', JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      console.error('Transaction validation error:', error);
      
      // Throw a more informative error
      if (error.response) {
        throw new Error(`Transaction validation failed: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        throw new Error('Network error: No response received from server');
      } else {
        throw error;
      }
    }
  }
};
