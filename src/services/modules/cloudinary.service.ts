import { axiosClient } from '../api/axiosClient';

class CloudinaryService {
  // Uploads a file to Cloudinary (form-data)
  async upload(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post<{ url: string }>(
      '/api/Cloudinary/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  }

  // Uploads a file to Cloudinary as bytes (if your backend supports it)
  async uploadBytes(bytes: ArrayBuffer): Promise<{ url: string }> {
    const response = await axiosClient.post<{ url: string }>(
      '/api/Cloudinary/upload-bytes',
      bytes,
      { headers: { 'Content-Type': 'application/octet-stream' } }
    );
    return response.data;
  }

  // Deletes a file from Cloudinary
  async delete(publicId: string): Promise<{ result: string }> {
    const response = await axiosClient.delete<{ result: string }>(
      `/api/Cloudinary/delete`,
      { params: { publicId } }
    );
    return response.data;
  }

  // Retrieves the URL of a file from Cloudinary
  async getUrl(publicId: string): Promise<{ url: string }> {
    const response = await axiosClient.get<{ url: string }>(
      `/api/Cloudinary/get-url`,
      { params: { publicId } }
    );
    return response.data;
  }
}

export const cloudinaryService = new CloudinaryService();