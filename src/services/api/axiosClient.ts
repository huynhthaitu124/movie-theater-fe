import axios from 'axios';
type AxiosError = any; // Using any for now, can be typed properly later
// Comment out AuthResponse interface for now
// interface AuthResponse {
//     token: string;
//     refreshToken: string;
// }
import TokenService from '../modules/token.service';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5250',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }

});

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        const token = TokenService.getToken();
        
        // Debug logging for requests
        console.log('🚀 Axios Request:', {
            url: config.url,
            method: config.method?.toUpperCase(),
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            hasToken: !!token,
            tokenPreview: token ? token.substring(0, 20) + '...' : 'No token',
            data: config.data
        });
        
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('❌ Axios Request Error:', error);
        return Promise.reject(error);
    }
);

// Comment out refresh token functionality for now
// let isRefreshing = false;
// let failedQueue: any[] = [];

// const processQueue = (error: any, token: string | null = null) => {
//     failedQueue.forEach(prom => {
//         if (error) {
//             prom.reject(error);
//         } else {
//             prom.resolve(token);
//         }
//     });
//     failedQueue = [];
// };

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => {
        // Debug logging for successful responses
        console.log('✅ Axios Response:', {
            url: response.config.url,
            method: response.config.method?.toUpperCase(),
            status: response.status,
            statusText: response.statusText,
            data: response.data
        });
        return response;
    },
    async (error: AxiosError) => {
        // Enhanced error logging
        console.error('❌ Axios Response Error:', {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            code: error.code
        });

        // Simple 401 handling - just clear tokens and redirect to login
        if (error.response?.status === 401) {
            console.error('🔐 Unauthorized - clearing tokens and redirecting to login');
            TokenService.clearTokens();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (error.response?.status === 403) {
            console.error('🚫 Access forbidden:', error.response.data);
        } else if (error.response?.status === 404) {
            console.error('🔍 Resource not found:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export { axiosClient };