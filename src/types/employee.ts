// types/employee.ts
import { User, UserRole } from './user';

export interface Employee extends Omit<User, 'role'> {
    role: Extract<UserRole, 'admin' | 'staff'>;
    department: string;
    position: string;
    salary: number;
    joinDate: string;
}