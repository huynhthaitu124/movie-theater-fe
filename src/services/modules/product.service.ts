import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../types/response.types';
import { Product } from '../../types/product';

class ProductService {
  // Get all products
  async getAll(): Promise<Product[]> {
    const response = await axiosClient.get<Product[]>('/api/Product');
    return response.data;
 }

  // Get product by ID
  async getById(id: string): Promise<ApiResponse<Product>> {
    const response = await axiosClient.get<ApiResponse<Product>>('/api/Product/GetProductById', { params: { id } });
    return response.data;
  }

  // Create a new product
  async create(data: Product): Promise<ApiResponse<Product>> {
    const response = await axiosClient.post<ApiResponse<Product>>('/api/Product/CreateProduct', data);
    return response.data;
  }

  // Update a product
  async update(data: Product): Promise<ApiResponse<Product>> {
    const response = await axiosClient.put<ApiResponse<Product>>('/api/Product/Updateproduct', data);
    return response.data;
  }

  // Delete a product
  async delete(productId: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.delete<ApiResponse<void>>('/api/Product/DeleteProduct', { params: { productId } });
    return response.data;
  }

  // Reactivate a product (if needed)
  async reactivate(productId: string): Promise<ApiResponse<Product>> {
    console.log('Reactivating product:', productId);
    const response = await axiosClient.post<ApiResponse<Product>>('/api/Product/ReActiveProduct',null, { params: { productId } });
    return response.data;
  }
}

export const productService = new ProductService();