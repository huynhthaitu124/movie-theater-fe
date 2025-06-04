// types/employee.ts
import { User, UserRole } from './user';

export interface Employee extends Omit<User, 'role'> {
    staffId: string;
    accountId: string;
    firstName: string;
    lastName: string;
    displayName: string;
    role: Extract<UserRole, 'admin' | 'staff'>;
    department: string;
    position: string;
    salary: number;
    joinDate: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    status: 'active' | 'inactive';
    workSchedules?: string[]; // Liên kết với StaffWorkSchedules
    createdAt: string;
    updatedAt: string;
}

export interface WorkSchedule {
    id: string;
    startTime: string;
    endTime: string;
    date: string;
    status: 'scheduled' | 'in-progress' | 'completed';
    createdAt: string;
    updatedAt: string;
}