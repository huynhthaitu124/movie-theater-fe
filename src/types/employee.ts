export interface Employee {
  id: string;
  name: string;
  identityCard: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  status: 'active' | 'inactive';
}