import { Product } from "./product";
// Add these to your types/index.ts or create separate files

export interface Combo {
  comboId: string;
  comboName: string;
  price: number;
  description?: string;
  image?: string;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string;
  products?: Product[];
}

export interface ComboProduct {
  comboProductId: string;
  comboId: string;
  productId: string;
  quantity: number;
  combo?: Combo;
  product?: Product; // Assuming you have a Product interface defined
}