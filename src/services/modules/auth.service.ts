import { axiosClient } from '../api/axiosClient';
import { ApiResponse, AuthResponse, CheckMailResponse } from '../types/response.types';
import { API_ENDPOINTS } from '../api/endpoints';
import { LoginRequest, RegisterRequest, SendOtpRequest, VerifyOtpRequest, LoginGoogle } from '../types/request.types';
import { User } from '../../types/user';

// interface AuthResponseWithRefresh extends AuthResponse {
//     refreshToken: string;
// }

class AuthService {
    async login(loginData: LoginRequest): Promise<AuthResponse> {
        const response = await axiosClient.post<AuthResponse>(
            API_ENDPOINTS.ACCOUNT.LOGIN,
            loginData
        );
        return response.data;
    }

    async register(registerData: RegisterRequest): Promise<AuthResponse> {
        const response = await axiosClient.post<AuthResponse>(
            API_ENDPOINTS.ACCOUNT.REGISTER,
            registerData
        );
        return response.data;
    }

    async getCurrentUser(): Promise<ApiResponse<User>> {
        const response = await axiosClient.get<ApiResponse<User>>(API_ENDPOINTS.ACCOUNT.ME);
        return response.data;
    }

    async checkEmailExist(data : SendOtpRequest): Promise<ApiResponse<boolean>> {
        const response = await axiosClient.post<ApiResponse<boolean>>(API_ENDPOINTS.ACCOUNT.CHECK_EMAIL_EXIST, data);
        return response.data;
    }

    async logout(): Promise<void> {
        await axiosClient.post(API_ENDPOINTS.ACCOUNT.LOGOUT);
    }

    async sendOtpRegister(data: SendOtpRequest): Promise<ApiResponse<string>> {
        const response = await axiosClient.post<ApiResponse<string>>(
            API_ENDPOINTS.ACCOUNT.SEND_OTP_REGISTER,
            {
                email: data.email
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );
        return response.data;
    }

    async verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse<void>> {
        const response = await axiosClient.post<ApiResponse<void>>(
            API_ENDPOINTS.ACCOUNT.VERIFY_OTP,
            data
        );
        return response.data;
    }

    async loginWithGoogle(data: string): Promise<ApiResponse<LoginGoogle>> {
    // First get user info using the access token
    const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
            headers: {
                Authorization: `Bearer ${data}`,
                'Content-Type': 'application/json'
            }
        }
    );
    
    const userInfo = await userInfoResponse.json();

    
    // Then send both token and user info to your backend
    // const response = await axiosClient.post<ApiResponse<LoginGoogle>>(
    //     API_ENDPOINTS.ACCOUNT.LOGIN_GOOGLE,
    //     {
    //         token: data.token,
    //         userInfo: userInfo
    //     }
    // );
    
    return userInfo;
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