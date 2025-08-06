import React, { useEffect, useState } from 'react';
import { PlusCircle, Package, Edit, Trash2, ArrowLeft, Search, X, ShoppingBag, Coffee, GlassWater } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { comboService } from '../../../services/modules/combo.service';
import { comboProductService } from '../../../services/modules/comboProduct.service';
import { productService } from '../../../services/modules/product.service';
import { Combo } from '../../../types/combo';
import { Product } from '../../../types/product';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

const ComboProductManagement: React.FC = () => {
  // States for combos and products
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [comboProducts, setComboProducts] = useState<any[]>([]);

  // Form states
  const [showComboForm, setShowComboForm] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [comboFormData, setComboFormData] = useState({
    comboName: '',
    price: 0,
    description: '',
    image: ''
  });
  const [productFormData, setProductFormData] = useState({
    productId: '',
    quantity: 1
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingComboId, setDeletingComboId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Fetch all combos and products
  useEffect(() => {
    fetchCombos();
    fetchProducts();
  }, []);

  const fetchCombos = async () => {
  setLoading(true);
  try {
    const response = await comboService.getAll();
    console.log('Raw API response:', response);
    
    // Check if response and response.data exist and response.data is an array
    if (response) {
      // Map the API response to match your expected Combo type structure
      const mappedCombos = response.map(combo => ({
        comboId: combo.comboid,
        comboName: combo.name, // API uses "name" but our type uses "comboName"
        price: combo.price,
        description: combo.description || '',
        image: combo.image || '',
        isActive: combo.isActive,
        products: combo.products || []
      }));
      
      console.log('Mapped combos:', mappedCombos);
      setCombos(mappedCombos);
    } else {
      console.error('Unexpected API response structure:', response);
      toast.error('Failed to parse combo data');
      setCombos([]);
    }
  } catch (error) {
    console.error('Error fetching combos:', error);
    toast.error('Failed to load combos');
    setCombos([]);
  } finally {
    setLoading(false);
  }
};

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll();
      console.log(' Product response:', response);
      if (response) {
        setProducts(response.filter(product => product.isactive));
      }
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    }
  };

  // Fetch combo products when a combo is selected
  const fetchComboProducts = async (comboId: string) => {
  try {
    // Instead of using comboProductService, use comboService.getById
    const response = await comboService.getById(comboId);
    console.log('Combo details response:', response);
    
    if (response && response.data && response.data.products) {
      // The API already returns the products for this combo
      const combo = response.data;
      
      // Transform the products array to match the format expected by your UI
      const enrichedProducts = combo.products.map(product => {
        return {
          comboProductId: `${combo.comboId}-${product.productId}`, // Generate a unique ID for UI purposes
          comboId: combo.comboId,
          productId: product.productId,
          productName: product.name,
          productPrice: product.price,
          productImage: product.image || '',
          quantity: product.stock || 1, // Use stock or another appropriate field as quantity
          totalPrice: product.price * (product.stock || 1)
        };
      });
      
      console.log('Enriched combo products:', enrichedProducts);
      setComboProducts(enrichedProducts);
    } else {
      console.log('No products found for this combo');
      setComboProducts([]);
    }
  } catch (error) {
    console.error('Error fetching combo products:', error);
    toast.error('Failed to load combo products');
    setComboProducts([]);
  }
};

  const handleSelectCombo = (combo: Combo) => {
    setSelectedCombo(combo);
    fetchComboProducts(combo.comboId);
  };

  const handleCreateCombo = async () => {
  try {
    if (!comboFormData.comboName || comboFormData.price <= 0) {
      toast.error('Combo name and price are required');
      return;
    }
    console.log('Creating combo with data:', comboFormData);

    const response = await comboService.create({
      name: comboFormData.comboName,
      price: comboFormData.price,
    });

    console.log('Create combo response:', response);

    if (response.status === 200) {
      toast.success('Combo created successfully');
      
      // Close the form first
      setShowComboForm(false);
      resetComboForm();
      
      // Then fetch combos to refresh the list
      await fetchCombos();
      
      // Alternatively, force a full page refresh if needed
      // window.location.reload();
    } else {
      toast.error('Unexpected response when creating combo');
    }
  } catch (error) {
    console.error('Error creating combo:', error);
    toast.error('Failed to create combo');
  }
};

  const handleUpdateCombo = async () => {
    if (!selectedCombo) return;

    try {
      if (!comboFormData.comboName || comboFormData.price <= 0) {
        toast.error('Combo name and price are required');
        return;
      }

      const response = await comboService.update({
        comboId: selectedCombo.comboId,
        comboName: comboFormData.comboName,
        price: comboFormData.price,
        description: comboFormData.description || '',
        image: comboFormData.image || '',
        isActive: true
      });

      if (response.data) {
        toast.success('Combo updated successfully');
        fetchCombos();
        setShowComboForm(false);
        // Also update the selected combo to reflect changes
        setSelectedCombo({
          ...selectedCombo,
          ...comboFormData
        });
      }
    } catch (error) {
      toast.error('Failed to update combo');
      console.error(error);
    }
  };

  const handleDeleteCombo = async () => {
    if (!deletingComboId) return;

    console.log('Deleting combo with ID:', deletingComboId);

    try {
      await comboService.delete(deletingComboId);
      toast.success('Combo deleted successfully');
      fetchCombos();
      if (selectedCombo?.comboId === deletingComboId) {
        setSelectedCombo(null);
      }
    } catch (error) {
      toast.error('Failed to delete combo');
      console.error(error);
    } finally {
      setShowDeleteModal(false);
      setDeletingComboId(null);
    }
  };

  const handleAddProductToCombo = async () => {
  if (!selectedCombo || !productFormData.productId) {
    toast.error('Please select a product and specify quantity');
    return;
  }

  try {
    // Find the selected product details for display purposes
    const productToAdd = products.find(p => p.productid === productFormData.productId);
    
    if (!productToAdd) {
      toast.error('Selected product not found');
      return;
    }

    // Create the API request payload
    const payload = {
      comboId: selectedCombo.comboId,
      productId: productFormData.productId,
      quantity: productFormData.quantity
    };

    console.log('Adding product to combo with payload:', payload);
    
    // Call the API to add product to combo
    const response = await comboProductService.create(payload);
    
    console.log('API response for adding product:', response);

    if (response && response.status === 200) {
      toast.success('Product added to combo successfully');
      
      // Close the form
      setShowAddProductForm(false);
      resetProductForm();
      
      // Refresh the combo products to show the newly added product
      fetchComboProducts(selectedCombo.comboId);
    } else {
      toast.error('Failed to add product to combo');
    }
  } catch (error) {
    console.error('Error adding product to combo:', error);
    toast.error('Failed to add product to combo');
  }
};

  const handleRemoveProductFromCombo = async (comboid: string, productid: string) => {
  if (!selectedCombo) return;

  console.log('Removing product from combo with ID:', comboid);

  try {
    // Extract the actual IDs from the composite ID
    const [comboId, productId] = comboid.split('-');

    
    console.log('Removing product from combo:', {
      comboid,
      productid,
    });
    
    // Call the API to remove the product from the combo
    const response = await comboProductService.delete(comboid, productid);

    if (response && response.status === 200) {
      toast.success('Product removed from combo successfully');
      
      // Refresh the combo products to show the updated list
      fetchComboProducts(selectedCombo.comboId);
    } else {
      toast.error('Failed to remove product from combo');
    }
  } catch (error) {
    console.error('Failed to remove product:', error);
    toast.error('Failed to remove product from combo');
  }
};

  const resetComboForm = () => {
    setComboFormData({
      comboName: '',
      price: 0,
      description: '',
      image: ''
    });
  };

  const resetProductForm = () => {
    setProductFormData({
      productId: '',
      quantity: 1
    });
  };

  const editCombo = (combo: Combo) => {
    setComboFormData({
      comboName: combo.comboName,
      price: combo.price,
      description: combo.description || '',
      image: combo.image || ''
    });
    setShowComboForm(true);
  };

  const handleComboFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setComboFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }));
  };

  // Filter combos by search query
  const filteredCombos = combos.filter(combo => 
    combo.comboName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total savings
  const calculateSavings = () => {
    if (!selectedCombo || comboProducts.length === 0) return 0;
    
    const totalProductsPrice = comboProducts.reduce((sum, cp) => {
      return sum + (cp.productPrice * cp.quantity);
    }, 0);
    
    return totalProductsPrice - selectedCombo.price;
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-sm shadow-2xl border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl shadow-lg">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Combo Management
                    </h1>
                  </div>
                </div>
                <Button
                onClick={() => navigate('/admin/products')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600/70 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                <GlassWater className="w-5 h-5" />
                <span>Go to Products</span>
            </Button>
              </div>

              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Total Combos</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                    {combos.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Combo List */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Combos</h3>
                  <Button
                    onClick={() => {
                      resetComboForm();
                      setSelectedCombo(null);
                      setShowComboForm(true);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-md flex items-center"
                  >
                    <PlusCircle className="w-4 h-4 mr-1" /> Add Combo
                  </Button>
                </div>
                
                {/* Search */}
                <div className="p-3 border-b border-gray-700/50">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-10 py-2 bg-gray-900/50 border border-gray-700/50 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Search combos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Combo List */}
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-400">Loading...</div>
                  ) : filteredCombos.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">No combos found</div>
                  ) : (
                    filteredCombos.map((combo) => (
                      <div
                        key={combo.comboId}
                        className={`p-4 border-b border-gray-700/30 hover:bg-gray-700/20 cursor-pointer transition-colors ${
                          selectedCombo?.comboId === combo.comboId ? 'bg-amber-900/20 border-l-4 border-l-amber-500' : ''
                        }`}
                        onClick={() => handleSelectCombo(combo)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {combo.image ? (
                              <img
                                src={combo.image}
                                alt={combo.comboName}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-white">{combo.comboName}</div>
                              <div className="text-amber-400 font-medium">
                                {formatCurrency(combo.price)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCombo(combo);
                                editCombo(combo);
                              }}
                              className="p-1 text-gray-400 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingComboId(combo.comboId);
                                setShowDeleteModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Combo Details */}
            <div className="lg:col-span-2">
              {!selectedCombo ? (
                <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 shadow-xl p-12 flex flex-col items-center justify-center h-full">
                  <Package className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-xl text-gray-300 font-medium mb-2">No Combo Selected</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Select a combo from the list or create a new one to manage its products
                  </p>
                  <Button
                    onClick={() => {
                      resetComboForm();
                      setShowComboForm(true);
                    }}
                    className="mt-6 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Create New Combo
                  </Button>
                </div>
              ) : (
                <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 shadow-xl overflow-hidden">
                  {/* Combo Header */}
                  <div className="p-6 border-b border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-medium text-white">{selectedCombo.comboName}</h3>
                      <div className="text-2xl font-bold text-amber-400">
                        {formatCurrency(selectedCombo.price)}
                      </div>
                    </div>
                    
                    {selectedCombo.description && (
                      <p className="text-gray-400 mb-4">{selectedCombo.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedCombo.isActive ? 'bg-green-900/20 text-green-400 border border-green-700/50' : 'bg-red-900/20 text-red-400 border border-red-700/50'
                        }`}>
                          {selectedCombo.isActive ? 'Active' : 'Inactive'}
                        </div>
                        
                        {comboProducts.length > 0 && (
                          <div className="bg-blue-900/20 text-blue-400 border border-blue-700/50 px-3 py-1 rounded-full text-xs font-medium">
                            {comboProducts.length} Products
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => editCombo(selectedCombo)}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Products in Combo */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-white">Products in Combo</h4>
                      <Button
                        onClick={() => {
                          resetProductForm();
                          setShowAddProductForm(true);
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-md flex items-center"
                      >
                        <PlusCircle className="w-4 h-4 mr-1" /> Add Product
                      </Button>
                    </div>
                    
                    {comboProducts.length === 0 ? (
                      <div className="bg-gray-700/30 rounded-lg p-8 flex flex-col items-center">
                        <Coffee className="w-12 h-12 text-gray-600 mb-3" />
                        <p className="text-gray-400 text-center">
                          This combo doesn't have any products yet.
                          <br />
                          Add products to complete the combo.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {comboProducts.map((cp) => (
                            <div
                              key={cp.comboProductId}
                              className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                {cp.productImage ? (
                                  <img
                                    src={cp.productImage}
                                    alt={cp.productName}
                                    className="w-12 h-12 object-cover rounded-md"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-500" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-white">{cp.productName}</div>
                                  <div className="text-gray-400">
                                    {formatCurrency(cp.productPrice)} × {cp.quantity}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-amber-400 font-medium">
                                  {formatCurrency(cp.productPrice * cp.quantity)}

                                </div>
                                <button
                                  onClick={() => handleRemoveProductFromCombo(cp.comboId, cp.productId)}
                                  className="p-1 text-gray-400 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Pricing Summary */}
                        <div className="bg-gray-700/20 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex justify-between mb-2">
                            <div className="text-gray-400">Total Products Price:</div>
                            <div className="text-white font-medium">
                              {formatCurrency(comboProducts.reduce((sum, cp) => sum + (cp.productPrice * cp.quantity), 0))}
                            </div>
                          </div>
                          <div className="flex justify-between mb-2">
                            <div className="text-gray-400">Combo Price:</div>
                            <div className="text-amber-400 font-medium">
                              {formatCurrency(selectedCombo.price)}
                            </div>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-700/50">
                            <div className="text-gray-300 font-medium">Customer Savings:</div>
                            <div className="text-green-400 font-bold">
                              {formatCurrency(calculateSavings())} ({Math.round((calculateSavings() / comboProducts.reduce((sum, cp) => sum + (cp.productPrice * cp.quantity), 0)) * 100)}% off)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Combo Form Modal */}
      {showComboForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowComboForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedCombo ? 'Edit Combo' : 'Create New Combo'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1">Combo Name</label>
                <input
                  type="text"
                  name="comboName"
                  value={comboFormData.comboName}
                  onChange={handleComboFormChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Enter combo name"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={comboFormData.price}
                  onChange={handleComboFormChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Enter combo price"
                  min="0"
                  step="0.01"
                />
              </div>
                         
              <div className="flex justify-end space-x-3 pt-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowComboForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={selectedCombo ? handleUpdateCombo : handleCreateCombo}
                >
                  {selectedCombo ? 'Update Combo' : 'Create Combo'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product to Combo Modal */}
      {showAddProductForm && selectedCombo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowAddProductForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-4">
              Add Product to {selectedCombo.comboName}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1">Product</label>
                <select
                  name="productId"
                  value={productFormData.productId}
                  onChange={handleProductFormChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.productid} value={product.productid}>
                      {product.name} - {formatCurrency(product.price)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={productFormData.quantity}
                  onChange={handleProductFormChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  min="1"
                  placeholder="Enter quantity"
                />
              </div>
              
              {productFormData.productId && (
                <div className="bg-gray-700/30 p-3 rounded-md">
                  <div className="text-gray-400 mb-1">Price per unit:</div>
                  <div className="text-white font-medium">
                    {formatCurrency(products.find(p => p.productid === productFormData.productId)?.price || 0)}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowAddProductForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleAddProductToCombo}
                  disabled={!productFormData.productId}
                >
                  Add to Combo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">Delete Combo</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this combo?.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 text-white"
                onClick={handleDeleteCombo}
              >
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ComboProductManagement;