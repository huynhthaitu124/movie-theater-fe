import React from 'react';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductSelectionProps {
  products: Product[];
  selectedProducts: { productid: string; quantity: number }[];
  onProductSelect: (productid: string, quantity: number) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const ProductSelection: React.FC<ProductSelectionProps> = ({
  products,
  selectedProducts,
  onProductSelect,
  isLoading = false,
  error = null,
}) => {
  const getQuantity = (productid: string) => {
    const product = selectedProducts.find(p => p.productid === productid);
    return product ? product.quantity : 0;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Define some popular combos
  const combos = [
    {
      id: 'combo1',
      name: 'Movie Night Combo',
      description: 'Perfect for sharing with a friend',
      products: products.filter(p => p.name.toLowerCase().includes('popcorn') || p.name.toLowerCase().includes('soda')),
      discount: 0.1 // 10% off
    },
    {
      id: 'combo2',
      name: 'Family Pack',
      description: 'Great value for families',
      products: products.filter(p => 
        p.name.toLowerCase().includes('popcorn') || 
        p.name.toLowerCase().includes('nachos') || 
        p.name.toLowerCase().includes('soda')
      ),
      discount: 0.15 // 15% off
    }
  ];

  // Helper to select a combo
  const handleComboSelect = (combo: typeof combos[0]) => {
    combo.products.forEach(product => {
      onProductSelect(product.productid, Math.max(getQuantity(product.productid), 1));
    });
  };

  if (isLoading) {
    return (
      <div className="w-full bg-secondary-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-500/20 rounded-xl">
            <ShoppingBag className="w-6 h-6 text-primary-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Food & Beverages</h2>
            <p className="text-gray-400">Loading available items...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-secondary-700 rounded-xl p-4 animate-pulse">
              <div className="w-full h-48 bg-secondary-600 rounded-lg mb-4"></div>
              <div className="h-6 bg-secondary-600 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-secondary-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-secondary-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-error-500/20 rounded-xl">
            <ShoppingBag className="w-6 h-6 text-error-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Food & Beverages</h2>
            <p className="text-error-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-secondary-800 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-500/20 rounded-xl">
            <ShoppingBag className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Food & Beverages</h2>
            <p className="text-gray-400">Add some snacks to enjoy during the movie</p>
          </div>
        </div>

        {/* Combos Section */}
        {/* {combos.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Popular Combos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {combos.map(combo => (
                <div key={combo.id} className="bg-secondary-700/50 rounded-xl p-4">
                  <h4 className="text-white font-medium mb-1">{combo.name}</h4>
                  <p className="text-sm text-gray-400 mb-2">{combo.description}</p>
                  <div className="space-y-2 mb-3">
                    {combo.products.map(product => (
                      <div key={product.productid} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{product.name}</span>
                        <span className="text-gray-400">{formatPrice(product.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-400 font-medium">
                      Save {Math.round(combo.discount * 100)}%
                    </span>
                    <button
                      onClick={() => handleComboSelect(combo)}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                    >
                      Add Combo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Individual Products Section */}
        <h3 className="text-lg font-semibold text-white mb-4">Individual Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const selected = selectedProducts.find(p => p.productid === product.productid);
            const quantity = selected ? selected.quantity : 0;
            return (
              <div key={product.productid} className="bg-secondary-700 rounded-xl p-4 flex flex-col">
                <div className="relative w-full h-48 mb-4">
                  <img
                    src={product.image || 'https://via.placeholder.com/400x300'}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-warning-500 text-white text-xs font-medium rounded">
                      Only {product.stock} left
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-400 font-semibold">{formatPrice(product.price)}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const currentQty = getQuantity(product.productid);
                  
                          if (currentQty > 0) {
                            onProductSelect(product.productid, currentQty - 1);
                          }
                        }}
                        className="p-1 rounded-lg bg-secondary-600 hover:bg-secondary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={getQuantity(product.productid) === 0}
                      >
                        <Minus className="w-5 h-5 text-white" />
                      </button>
                      <span className="text-white font-medium w-8 text-center">
                        {getQuantity(product.productid)}
                      </span>
                      <button
                        onClick={() => {
                          const currentQty = getQuantity(product.productid);
                          onProductSelect(product.productid, currentQty + 1);
                        }}
                        className="p-1 rounded-lg bg-primary-600 hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={product.stock <= getQuantity(product.productid) || product.stock === 0}
                      >
                        <Plus className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Items Summary */}
      {selectedProducts.length > 0 && (
        <div className="bg-secondary-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Selected Items</h3>
          <div className="space-y-4">
            {selectedProducts.map(({ productid, quantity }) => {
              const product = products.find(p => p.productid === productid);
              if (!product || quantity === 0) return null;
              return (
                <div key={productid} className="flex items-center justify-between">
                  <div>
                    <p className="text-white">{product.name}</p>
                    <p className="text-sm text-gray-400">Quantity: {quantity}</p>
                  </div>
                  <p className="text-primary-400 font-semibold">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>
              );
            })}
            <div className="pt-4 border-t border-secondary-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total</span>
                <span className="text-xl font-bold text-primary-400">
                  {formatPrice(
                    selectedProducts.reduce((total, { productid, quantity }) => {
                      const product = products.find(p => p.productid === productid);
                      return total + (product ? product.price * quantity : 0);
                    }, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
