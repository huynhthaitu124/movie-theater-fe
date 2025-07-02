// types/employee.ts
import { User } from './user';
import { UserRole } from './role';

export interface Employee extends Omit<User, 'role'> {
    staffid: string;
    accountId: string;
    displayName: string;
    role: Extract<UserRole, 'Admin' | 'Staff'>;
    position: string;
    salary: number;
    hiredate: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
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