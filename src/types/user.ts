import { UserRole } from './role';

export type UserStatus = 'active' | 'inactive' | 'banned';

export interface User {
    id?: string; // AccountID
    email?: string;
    username?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    role?: UserRole;
    status?: UserStatus;
    profileImage?: string;
    membershipId?: string;
    membership?: {
        id: string;
        name: string;
        points: number;
        level: string;
        benefits: string[];
    };
    createdAt?: string;
    updatedAt?: string;
    emailVerified?: boolean;
}

export interface Member {
    id: string; // MemberID
    accountId: string;
    membershipId?: string;
    points: number;
    tier: string;
    validUntil: string;
    createdAt: string;
    updatedAt: string;
}