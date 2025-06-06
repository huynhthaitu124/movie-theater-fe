import { axiosClient } from '../api/axiosClient';
import { ApiResponse, AuthResponse } from '../types/response.types';
import { API_ENDPOINTS } from '../api/endpoints';
import { LoginRequest, RegisterRequest } from '../types/request.types';
import { User } from '../../types/user';

interface AuthResponseWithRefresh extends AuthResponse {
    refreshToken: string;
}

class AuthService {
    async login(loginData: LoginRequest): Promise<AuthResponse> {
        const response = await axiosClient.post<AuthResponse>(
            API_ENDPOINTS.ACCOUNT.LOGIN,
            loginData
        );
        return response.data;
    }

    async register(registerData: RegisterRequest): Promise<AuthResponseWithRefresh> {
        const response = await axiosClient.post<ApiResponse<AuthResponseWithRefresh>>(
            API_ENDPOINTS.ACCOUNT.REGISTER,
            registerData
        );
        return response.data.data.data;
    }

    async getCurrentUser(): Promise<User> {
        const response = await axiosClient.get<ApiResponse<User>>(API_ENDPOINTS.ACCOUNT.ME);
        return response.data.data.data;
    }

    async logout(): Promise<void> {
        await axiosClient.post(API_ENDPOINTS.ACCOUNT.LOGOUT);
    }

    // async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    //     const response = await axiosClient.post<ApiResponse<{ token: string; refreshToken: string }>>(
    //         API_ENDPOINTS.ACCOUNT.REFRESH_TOKEN,
    //         { refreshToken }
    //     );
    //     return response.data.data.data;
    // }
}

export default new AuthService();