// services/types/response.types.ts

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: UserResponse;
}