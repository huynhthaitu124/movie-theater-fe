export interface Product {
  productid: string;
  name: string;
  stock: number;
  price: number;
  image: string | null;
  description: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'SUSPENDED';
  isactive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  stock: number;
  price: number;
  image: string | null;
  description: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'SUSPENDED';
  isActive: boolean;
}