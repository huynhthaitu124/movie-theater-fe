import axios from 'axios';
import { ApiResponse } from '../types/response.types';

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
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => {
        console.log('Response:', response);
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            // Handle forbidden access
            window.location.href = '/403';
        } else if (error.response?.status === 404) {
            // Handle not found
            window.location.href = '/404';
        }
        return Promise.reject(error);
    }
);

export { axiosClient };