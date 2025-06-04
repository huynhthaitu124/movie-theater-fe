export interface User {
  id: string;
  account: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  sex: 'male' | 'female' | 'other';
  identityCard: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}