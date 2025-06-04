// services/types/request.types.ts
import type { Movie } from '../../types/movie';
import type { User } from '../../types/user';

type OmitAutoFields<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest extends Omit<OmitAutoFields<User>, 'role' | 'status' | 'avatar'> {
    password: string;
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

export interface StaffRequest extends Omit<OmitAutoFields<User>, 'role'> {
    role: Extract<User['role'], 'admin' | 'staff'>;
}

export interface SubtitleRequest extends OmitAutoFields<{
    movieId: string;
    language: string;
    filePath: string;
}> {}
