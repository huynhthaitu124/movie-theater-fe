export type UserRole = 'admin' | 'staff' | 'user';
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface User {
    id: string;
    account: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    sex: 'male' | 'female' | 'other';
    identityCard: string;
    address: string;
    role: UserRole;
    status: UserStatus;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
}