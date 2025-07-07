// services/types/response.types.ts

import { User } from '../../types/user';

export interface ApiResponse<T> {
    message: string;
    data: T;
}

export interface CheckMailResponse {
    email: string;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    data: string;
}

export interface GoogleResponse {
  email: string;
  name?: string;
  picture?: string;
  dob?: string;
}

export interface TransactionResponseData {
  transactionid: string;
  accountId: string;
  paymentmethod: string;
  gatewayId: string;
  transactiondate: string;
  paymentdate: string | null;
  paymentstatus: string;
  invoiceId: string;
  isactive: boolean;
  createdat: string;
  updatedat: string;
  price: number;
}

export interface TransactionResponse {
  status: number;
  message: string;
  data: TransactionResponseData;
}

export interface VNPayResponse {
  status: number;
  message: string;
  data: string; // Payment URL
}