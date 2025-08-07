import React, { useEffect, useState } from 'react';
import { ArrowLeft, GlassWater, ShoppingBag } from 'lucide-react';
import { Film, Package } from 'lucide-react';
import { ProductList } from '../../../components/product/ProductList';
import { ProductForm } from '../../../components/product/ProductForm';
import { Product, ProductFormData } from '../../../types/product';
import { productService } from '../../../services/modules/product.service';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/layout/AdminLayout';
import toast from 'react-hot-toast';

const ProductManagement: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);    

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll();
      // Map status based on stock and isactive
      const mappedProducts = (res || []).map(product => {
        if (product.stock === 0) {
          return { ...product, status: 'UNAVAILABLE' }; // Out of stock
        }
        if (product.isactive === false) {
          return { ...product, status: 'SUSPENDED' }; // Inactive
        }
        return { ...product, status: 'AVAILABLE' };
      });
      setProducts(mappedProducts);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setDeletingProductId(productId);
    setShowDeleteModal(true);
  };

  const handleSaveProduct = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        const updated = { ...editingProduct, ...data, productId: editingProduct.productId };
        await productService.update(updated);
      } else {
        const payload = {
          name: data.name,
          stock: data.stock,
          price: data.price,
          image: data.image,
          description: data.description,
        };
        await productService.create(payload);
      }
      await fetchProducts(); // <--- fetch all products again
      setShowForm(false);
      setEditingProduct(undefined);
    } catch (err) {
      // handle error
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const activeProducts = products.filter(p => p.isactive === true);
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  return (
    <AdminLayout>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
       
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm shadow-2xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                  <GlassWater className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Product Management
                  </h1>
                </div>
              </div>
              
              {/* Add navigation button to Combo Management */}
              {/* <Button
                onClick={() => navigate('/admin/products/combo')}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-600/70 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Go to Combos</span>
              </Button> */}
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-gray-400">Total Revenue</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                  ${totalRevenue.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Active Products</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                  {activeProducts.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Product Inventory</h2>
            <p className="text-gray-400 mt-1">
              Manage your cinema's product catalog and inventory
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-900/30 backdrop-blur-sm rounded-lg border border-blue-700/30">
              <Package className="w-5 h-5 text-blue-400" />
              <span className="text-blue-200 font-medium">
                {products.length} Products
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : (
          <ProductList
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onAdd={handleAddProduct}
            onReactivate={fetchProducts} // Pass refresh function
          />
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={handleCancelForm}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingProductId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">Delete Product</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this product?</p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white"
                onClick={async () => {
                  try {
                    console.log("Deleting product with ID:", deletingProductId);
                    await productService.delete(deletingProductId);
                    toast.success("Product deleted successfully!");
                    await fetchProducts();
                  } catch (err) {
                    toast.error("Failed to delete product.");
                  } finally {
                    setShowDeleteModal(false);
                    setDeletingProductId(null);
                  }
                }}
              >
                Inactive
              </Button>
            </div>
          </div>
        </div>
)}
    </div>
    </AdminLayout>
  );
};

export default ProductManagement;