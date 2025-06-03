export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  department: string;
  phoneNumber: string;
  joinDate: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
}