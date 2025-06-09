// services/types/request.types.ts
import type { Movie } from '../../types/movie';

type OmitAutoFields<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export interface AccountRequest {
    roleid: string;
    displayname: string;
    username: string;
    email: string;
    phonenumber: string;
    password: string;
    address: string;
    dateofbirth: string;
    preferredlanguage?: string;
    avatar?: string;
    gender?: string;
    identityCard: string;
}

export interface RegisterRequest extends AccountRequest {}

export interface LoginRequest {
    keyword: string;
    password: string;
}

export interface StaffRequest {
    accountid: string;
    position: string;
    hiredate: string;
    salary: number;
}

export interface StaffResponse {
    data: string;
    message: string;
    status: string;
}

export interface CategoryRequest extends OmitAutoFields<{
    name: string;
    description: string;
}> {}

export interface MovieRequest extends OmitAutoFields<Movie> {}

export interface RatingRequest extends OmitAutoFields<{
    movieId: string;
    accountId: string;
    score: number;
    comment: string;
}> {}

export interface SubtitleRequest extends OmitAutoFields<{
    movieId: string;
    language: string;
    filePath: string;
}> {}

export interface RoleRequest {
    name: string;
    description?: string;
    permissions?: string[];
    isActive?: boolean;
}

export interface MemberRequest {
    displayName: string;
    email: string;
    password: string;
    phoneNumber?: string;
}
