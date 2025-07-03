import React, { useState, useEffect } from 'react';
import { X, Save, Package, Upload } from 'lucide-react';
import { Product, ProductFormData } from '../../types/product';
import { cloudinaryService } from '../../services/modules/cloudinary.service';

interface ProductFormProps {
  product?: Product;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    stock: 0,
    price: 0,
    image: null,
    description: '',
    status: 'AVAILABLE',
    isActive: true,
  });

  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        stock: product.stock,
        price: product.price,
        image: product.image,
        description: product.description,
        status: product.status,
        isActive: product.isActive,
      });
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await cloudinaryService.upload(file);
      setFormData(prev => ({
        ...prev,
        image: res.url,
      }));
    } catch (err) {
      alert('Image upload failed!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] border border-gray-700/50 flex flex-col"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Sticky header OUTSIDE scrollable area */}
        <div className="sticky top-0 bg-gray-900 rounded-t-2xl border-b border-gray-700/50 px-6 py-4 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable form content */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto"
          style={{ maxHeight: 'calc(90vh - 76px)' }} // 76px = header height
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Poster Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Image
              </label>
              <div
                className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer min-h-[300px] max-h-[320px] w-full"
                onClick={() => document.getElementById('product-image-upload')?.click()}
                style={{ overflow: 'hidden' }}
              >
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="object-contain w-full h-[280px] rounded-lg"
                    style={{ maxHeight: 280 }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-gray-400">Click to upload poster</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                  </div>
                )}
                <input
                  id="product-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                    <span className="text-blue-400 text-sm">Uploading...</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="w-full mt-3 flex items-center justify-center px-4 py-2 border border-gray-600 rounded-xl text-gray-200 hover:bg-gray-800 transition-colors"
                onClick={() => document.getElementById('product-image-upload')?.click()}
                disabled={uploading}
              >
                <Upload className="mr-2" />
                Upload Poster
              </button>
              <div className="text-xs text-gray-500 mt-2">
                Recommended: 500×750px, Max: 5MB
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-500 ${
                  errors.stock ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="0"
              />
              {errors.stock && <p className="mt-1 text-sm text-red-400">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price (VNĐ) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="1000"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="0"
              />
              {errors.price && <p className="mt-1 text-sm text-red-400">{errors.price}</p>}
              {formData.price > 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  {formData.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </div>
              )}
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white"
              >
                <option value="AVAILABLE">Available</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div> */}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-white placeholder-gray-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter product description"
              />
              {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
            </div>

            {/* <div className="md:col-span-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-300">Active Product</span>
              </label>
            </div> */}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 hover:border-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{product ? 'Update Product' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};