export interface Product {
  productId: string;
  name: string;
  stock: number;
  price: number;
  image: string | null;
  description: string;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'UNAVAILABLE';
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
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'UNAVAILABLE';
  isActive: boolean;
}