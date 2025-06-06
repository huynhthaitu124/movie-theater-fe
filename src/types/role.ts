// Define role types
export type UserRole = 'Admin' | 'Staff' | 'Member';

// Role entity from API
export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// For backwards compatibility
export type RoleType = UserRole;
