// services/types/response.types.ts

import { User } from '../../types/user';

export interface ApiResponse<T> {
    message: string;
    data: {
        data: T;
    };
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    data: string;
}