import { axiosClient } from '../api/axiosClient';
import { ApiResponse, AuthResponse } from '../types/response.types';
import { API_ENDPOINTS } from '../api/endpoints';
import { LoginRequest, RegisterRequest } from '../types/request.types';

export class AuthService {
    async login(loginData: LoginRequest): Promise<ApiResponse<AuthResponse>> {
        const response = await axiosClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.ACCOUNT.CREATE, loginData);
        return response.data;
    }

    async register(registerData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
        const response = await axiosClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.ACCOUNT.CREATE, registerData);
        return response.data;
    }

    async logout(): Promise<ApiResponse<void>> {
        const response = await axiosClient.post<ApiResponse<void>>(API_ENDPOINTS.ACCOUNT.UPDATE);
        return response.data;
    }
}