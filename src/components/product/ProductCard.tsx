import React, { useState } from 'react';
import { Edit, Trash2, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { Product } from '../../types/product';
import { productService } from '../../services/modules/product.service';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onReactivate?: () => void; // Add this line
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete, onReactivate }) => {
  const [reactivating, setReactivating] = useState(false);

  const handleReactivate = async () => {
    setReactivating(true);
    try {
      await productService.reactivate(product.productid);
      toast.success('Product reactivated successfully!');
      if (onReactivate) onReactivate(); // Call refresh
    } catch (err) {
      alert('Failed to reactivate product');
    } finally {
      setReactivating(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available';
      case 'UNAVAILABLE':
        return 'Out of Stock';
      case 'SUSPENDED':
        return 'Inactive';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50';
      case 'UNAVAILABLE':
        return 'bg-red-900/50 text-red-300 border-red-700/50';
      case 'SUSPENDED':
        return 'bg-gray-800/50 text-gray-400 border-gray-600/50';
      default:
        return 'bg-gray-800/50 text-gray-400 border-gray-600/50';
    }
  };

  const isLowStock = product.stock <= 20 && product.stock > 0;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 p-6 border border-gray-700/50 hover:border-blue-500/30 group">
      {/* Product Image */}
      {product.image && (
        <div className="mb-4 flex justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="object-contain rounded-lg max-h-40 w-full bg-gray-800"
          />
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{product.name}</h3>
          <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product.productid)}
            className="p-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400">Stock:</span>
          <span className={`font-semibold ${isLowStock ? 'text-yellow-400' : product.stock == 0 ? 'text-red-400' : 'text-white'}`}>
            {product.stock}
          </span>
          {isLowStock &&  <AlertTriangle className="w-4 h-4 text-yellow-400" />}
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-400">Price:</span>
          <span className="font-semibold text-white">
            {product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
          {getStatusLabel(product.status)}
        </span>
        {/* Reactivate button only for SUSPENDED products */}
        {product.status === 'SUSPENDED' && (
          <button
            onClick={handleReactivate}
            disabled={reactivating}
            className="ml-2 px-3 py-1 rounded bg-green-700 text-white text-xs font-semibold hover:bg-green-800 transition"
          >
            {reactivating ? 'Reactivating...' : 'Reactivate'}
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700/50">
        {/* <div className="flex justify-between text-xs text-gray-500">
          <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
        </div> */}
      </div>
    </div>
  );
};