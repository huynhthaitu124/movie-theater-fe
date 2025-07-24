import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Calendar, 
  Tag, Image, Clock, CheckCircle, XCircle, AlertCircle,
  Download, Upload, MoreVertical, Copy, Star, ArrowLeft
} from 'lucide-react';
import { Promotion, PromotionType, PromotionFormData, PromotionFilters } from '../../../types/promotion';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import { promotionService } from '../../../services/modules/promotion.Service';
import { promotionTypeService } from '../../../services/modules/promotionType.service';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../../components/layout/AdminLayout';
import { cloudinaryService } from '../../../services/modules/cloudinary.service';


const PromotionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotionTypes, setPromotionTypes] = useState<PromotionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [filters, setFilters] = useState<PromotionFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);


  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch promotions
      const res = await promotionService.getAll();
      setPromotions(res.data || []);
      // Fetch promotion types from API
      const typeRes = await promotionTypeService.getAll();
      setPromotionTypes(typeRes.data || []);
    } catch (error) {
      console.error('Error fetching promotions or types:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

const handleCreatePromotionAPI = async (promotionData: PromotionFormData) => {
  setLoading(true);
  console.log('Creating promotion with data:', promotionData);
  try {
    // Prepare payload to match API (snake_case keys)
    const payload = {
      promotiontypeid: promotionData.promotiontypeid, // camelCase
      title: promotionData.title,
      detail: promotionData.detail,
      starttime: promotionData.starttime,
      endtime: promotionData.endtime,
      image: promotionData.image,
      status: promotionData.status,
      code: promotionData.code
    };
    const res = await promotionService.create(payload as any);
    setPromotions(prev => [res.data, ...prev]);

  } catch (error) {
    console.error('Error creating promotion:', error);
  } finally {
    setLoading(false);
  }
};

const handleUpdatePromotionAPI = async (promotionData: PromotionFormData, promotionId: string) => {
  setLoading(true);
  try {
    const res = await promotionService.update({ ...promotionData, promotionId } as any);
    setPromotions(prev =>
      prev.map(p => (p.promotionId === promotionId ? res.data : p))
    );
  } catch (error) {
    console.error('Error updating promotion:', error);
  } finally {
    setLoading(false);
  }
};

const handleDeletePromotion = async (promotionId: string) => {
  console.log('Deleting promotion with ID:', promotionId);
  setLoading(true);
  try {
    await promotionService.delete(promotionId);
    setPromotions(prev => prev.filter(p => p.promotionid !== promotionId));
  } catch (error) {
    console.error('Error deleting promotion:', error);
  } finally {
    setLoading(false);
  }
};

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'INACTIVE':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'EXPIRED':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-secondary-600/50 text-secondary-300 border-secondary-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return <CheckCircle size={16} />;
      case 'INACTIVE':
        return <XCircle size={16} />;
      case 'PENDING':
        return <AlertCircle size={16} />;
      case 'EXPIRED':
        return <Clock size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.startTime);
    const end = new Date(promotion.endTime);
    return now >= start && now <= end && promotion.isActive;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }
};


  const filteredPromotions = promotions.filter(promotion => {
    if (searchTerm && !promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !promotion.code.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.status && promotion.status !== filters.status) {
      return false;
    }
    if (filters.promotionType && promotion.promotiontypeid !== filters.promotionType) {
      return false;
    }
    return true;
  });

  const handleCreatePromotion = () => {
    setSelectedPromotion(null);
    setIsCreateModalOpen(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    console.log('Editing promotion:', promotion);
    setIsEditModalOpen(true);
  };



  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Show toast notification
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="space-y-6 bg-secondary-900 min-h-screen p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-800 to-secondary-700 rounded-xl p-6 border border-secondary-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-500/20 rounded-xl">
              <Tag className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Promotion Management</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button onClick={handleCreatePromotion}>
              <Plus size={16} className="mr-2" />
              Create Promotion
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-secondary-800/50 rounded-lg p-4 border border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">Total Promotions</p>
                <p className="text-2xl font-bold text-white">{promotions.length}</p>
              </div>
              <Tag className="h-8 w-8 text-primary-400" />
            </div>
          </div>
          
          <div className="bg-secondary-800/50 rounded-lg p-4 border border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">Active Promotions</p>
                <p className="text-2xl font-bold text-green-400">
                  {promotions.filter(p => isPromotionActive(p)).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-secondary-800/50 rounded-lg p-4 border border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">Expired</p>
                <p className="text-2xl font-bold text-red-400">
                  {promotions.filter(p => new Date(p.endTime) < new Date()).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-secondary-800/50 rounded-lg p-4 border border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">This Month</p>
                <p className="text-2xl font-bold text-purple-400">
                  {promotions.filter(p => 
                    new Date(p.createdAt).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-secondary-800 rounded-xl p-4 border border-secondary-700">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
              <input
                type="text"
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
              className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="CANCELLED">Cancel</option>
              <option value="EXPIRED">Expired</option>
            </select>
            
            <select
              value={filters.promotionType || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, promotionType: e.target.value || undefined }))}
              className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              {promotionTypes.map(type => (
                <option key={type.promotiontypeid} value={type.promotiontypeid}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="sm">
              <Upload size={16} className="mr-2" />
              Import
            </Button>
          </div>
        </div>
      </div>

      {/* Promotions Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        <AnimatePresence>
          {filteredPromotions.map((promotion, index) => (
            <motion.div
              key={promotion.promotionId || promotion.promotionid || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              {viewMode === 'grid' ? (
                <Card
                  hover
                  className={`
                    bg-gradient-to-br from-secondary-800 to-secondary-900
                    border border-secondary-700
                    shadow-xl
                    rounded-xl
                    overflow-hidden
                    min-h-[340px]
                    flex flex-col
                    transition-all
                    group
                  `}
                >
                  <div className="relative">
                    <div className="h-40 bg-gradient-to-tr from-primary-900/30 to-secondary-900 flex items-center justify-center">
                      {promotion.image ? (
                        <img src={promotion.image} alt={promotion.title} className="object-cover w-full h-full" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-secondary-500 opacity-60">
                          <Image className="h-16 w-16" />
                        </div>
                      )}
                    </div>
                    <span className={`
                      absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full shadow
                      ${promotion.status === 'ACTIVE' ? 'bg-green-600 text-white' : promotion.status === 'EXPIRED' ? 'bg-gray-500 text-white' : 'bg-yellow-500 text-white'}
                    `}>
                      {promotion.status}
                    </span>
                    <span className="absolute top-4 right-4 px-2 py-1 text-xs rounded bg-primary-700 text-white font-mono font-bold shadow">
                      {promotion.code}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col p-5">
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">{promotion.title}</h3>
                    <p className="text-secondary-300 text-sm mb-3 line-clamp-2">{promotion.detail}</p>
                    <div className="flex flex-col gap-1 text-xs text-secondary-400 mb-4">
                      <div>
                        <span className="font-medium text-secondary-200">Valid Until: </span>
                        <span className="text-white">{formatDate(promotion.endtime)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-secondary-200">Type: </span>
                        <span className="text-primary-400">{promotionTypes.find(t => t.promotiontypeid === promotion.promotiontypeid)?.name || 'Unknown'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto pt-3 border-t border-secondary-700">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:bg-blue-900/30"
                        onClick={() => handleEditPromotion(promotion)}
                      >
                        <Edit size={14} className="mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-900/30"
                        onClick={() => {
                          setPromotionToDelete(promotion);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 size={14} className="mr-1" /> Delete
                      </Button>
                      {/* <Button
                        size="sm"
                        variant="ghost"
                        className="text-secondary-300 hover:bg-secondary-700"
                      >
                        <Eye size={14} className="mr-1" /> View
                      </Button> */}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="bg-secondary-800 border-secondary-700">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                          <Image className="h-8 w-8 text-secondary-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{promotion.title}</h3>
                          <p className="text-secondary-400 text-sm">{promotion.detail}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <code className="px-2 py-1 bg-secondary-700 rounded text-primary-400 text-xs font-mono">
                              {promotion.code}
                            </code>
                            <span className="text-xs text-secondary-500">
                              Valid until {formatDate(promotion.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center space-x-1 ${getStatusColor(promotion.status)}`}>
                          {getStatusIcon(promotion.status)}
                          <span>{promotion.status}</span>
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditPromotion(promotion)}>
                            <Edit size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeletePromotion(promotion.promotionid)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPromotions.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-16 w-16 text-secondary-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-300 mb-2">No promotions found</h3>
          <p className="text-secondary-500 mb-6">
            {searchTerm || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters'
              : 'Create your first promotion to get started'
            }
          </p>
          <Button onClick={handleCreatePromotion}>
            <Plus size={16} className="mr-2" />
            Create Promotion
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <PromotionModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedPromotion(null);
        }}
        promotion={selectedPromotion}
        promotionTypes={promotionTypes}
        onSave={async (promotionData) => {
          if (selectedPromotion) {
            await handleUpdatePromotionAPI(promotionData, selectedPromotion.promotionId);
          } else {
            await handleCreatePromotionAPI(promotionData);
          }
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedPromotion(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Promotion"
      >
        <div className="space-y-4">
          <p className="text-white">
            Are you sure you want to delete <span className="font-bold">{promotionToDelete?.title}</span>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (promotionToDelete) {
                  await handleDeletePromotion(promotionToDelete.promotionid);
                  setDeleteConfirmOpen(false);
                  setPromotionToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </AdminLayout>
  );
};

// Promotion Form Modal Component
interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: Promotion | null;
  promotionTypes: PromotionType[];
  onSave: (data: PromotionFormData) => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  promotion,
  promotionTypes,
  onSave
}) => {
  const [formData, setFormData] = useState<PromotionFormData>({
    id: promotion ? promotion.promotionid : '',
    promotiontypeid: '',
    title: '',
    detail: '',
    starttime: '',
    endtime: '',
    image: '',
    status: 'ACTIVE',
    code: ''
    // isActive: true
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(formData.image || ''); 

  useEffect(() => {
    if (promotion) {
      setFormData({
        id: promotion ? promotion.promotionid : '',
        promotiontypeid: promotion.promotionTypeId || promotion.promotionTypeid,
        title: promotion.title,
        detail: promotion.detail,
        starttime: promotion.starttime.split('T')[0],
        endtime: promotion.endtime.split('T')[0],
        image: promotion.image,
        status: promotion.status,
        code: promotion.code,
        // isActive: promotion.isActive
      });
    } else {
      setFormData({
        id: promotion ? promotion.promotionid : '',
        promotiontypeid: '',
        title: '',
        detail: '',
        starttime: '',
        endtime: '',
        image: '',
        status: 'ACTIVE',
        code: '',
        // isActive: true
      });
    }
  }, [promotion]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  let imageUrl = formData.image;
  if (imageFile) {
    const uploadRes = await cloudinaryService.upload(imageFile);
    imageUrl = uploadRes.url;
  }
  onSave({
    ...formData,
    image: imageUrl,
    starttime: formData.starttime + 'T00:00:00',
    endtime: formData.endtime + 'T23:59:59'
  });
  console.log('Form submitted with data:', { ...formData, image: imageUrl });
  onClose();
};

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData(prev => ({ ...prev, code }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={promotion ? 'Edit Promotion' : 'Create New Promotion'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Promotion Type</label>
            <select
              value={formData.promotiontypeid}
              onChange={(e) => setFormData(prev => ({ ...prev, promotiontypeid: e.target.value }))}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select type...</option>
              {promotionTypes.map(type => (
                <option key={type.promotiontypeid} value={type.promotiontypeid}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            placeholder="Enter promotion title..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Detail</label>
          <textarea
            value={formData.detail}
            onChange={(e) => setFormData(prev => ({ ...prev, detail: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            placeholder="Enter promotion details..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Promotion Code</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              className="flex-1 px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 font-mono"
              placeholder="PROMO2025"
              required
            />
            <Button type="button" variant="ghost" onClick={generateCode}>
              Generate
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Start Date</label>
            <input
              type="date"
              value={formData.starttime}
              onChange={(e) => setFormData(prev => ({ ...prev, starttime: e.target.value }))}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">End Date</label>
            <input
              type="date"
              value={formData.endtime}
              onChange={(e) => setFormData(prev => ({ ...prev, endtime: e.target.value }))}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Promotion Image</label>
          <div className="aspect-[2/1] rounded-lg overflow-hidden bg-secondary-700 border-2 border-dashed border-secondary-600 mb-2 flex items-center justify-center">
            {imagePreview ? (
      <img
        src={imagePreview}
        alt="Promotion preview"
        className="w-full h-full object-cover"
      />
    ) : (
      <span className="text-secondary-400 text-sm">No image selected</span>
    )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-secondary-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
          />
        </div>

        {/* <div className="hidden flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="w-4 h-4 text-primary-600 bg-secondary-700 border-secondary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="isActive" className="text-sm text-white">
            Active promotion
          </label>
        </div> */}

        <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {promotion ? 'Update Promotion' : 'Create Promotion'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PromotionManagement;