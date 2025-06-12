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