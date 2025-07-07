import { axiosClient } from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { VNPayResponse } from '../types/response.types';

export interface VNPayValidateResponse {
  status: number;
  message: string;
  data: {
    success: boolean;
    transactionId: string;
    paymentStatus: string;
  }
}

export const vnpayService = {
  createPaymentUrl: async (transactionId: string): Promise<string> => {
    const response = await axiosClient.post<VNPayResponse>(`${API_ENDPOINTS.VNPAY.CREATE_PAYMENT_URL}/${transactionId}`);
    return response.data.data; // Returns the payment URL string
  },
  
  validatePayment: async (params: Record<string, string>): Promise<VNPayValidateResponse> => {
    // Log the params being sent to help with debugging
    console.log('VNPay validation params:', params);
    
    // Pass the parameters as query params in the request config
    const response = await axiosClient.get<VNPayValidateResponse>(API_ENDPOINTS.VNPAY.PAYMENT_RETURN, {
      params: params
    });
    
    // Log the response for debugging
    console.log('VNPay validation response:', response.data);
    
    return response.data;
  }
};
