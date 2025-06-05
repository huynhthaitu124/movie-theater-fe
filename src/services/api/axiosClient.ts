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
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
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
        return response;
    },
    async (error: AxiosError) => {
        // Simple 401 handling - just clear tokens and redirect to login
        if (error.response?.status === 401) {
            TokenService.clearTokens();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (error.response?.status === 403) {
            console.error('Access forbidden:', error.response.data);
        } else if (error.response?.status === 404) {
            console.error('Resource not found:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export { axiosClient };