// services/types/response.types.ts

import { User } from '../../types/user';

export interface ApiResponse<T> {
    message: string;
    data: {
        data: T;
        status: string;
    };
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}