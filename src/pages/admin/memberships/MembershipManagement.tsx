import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Calendar, 
  Users, DollarSign, Crown, Star, CheckCircle, XCircle, 
  AlertCircle, TrendingUp, Download, Upload, MoreVertical,
  Award, Shield, Zap, Gift
} from 'lucide-react';
import { Membership, MembershipFormData, MembershipFilters, MembershipStats } from '../../../types/membership';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import { membershipService } from '../../../services/modules/membership.service';
import { accountMemberShipService } from '../../../services/modules/accountMemberShip.service';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';

const MembershipManagement: React.FC = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [accountMemberships, setAccountMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [filters, setFilters] = useState<MembershipFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState<MembershipStats>({
    totalMemberships: 0,
    activeMemberships: 0,
    totalMembers: 0,
  });
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState<Membership | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch memberships
      const res = await membershipService.getAll();
      const apiMemberships = res.data || [];
      setMemberships(apiMemberships);

      // Fetch all account memberships
      const accRes = await accountMemberShipService.getAll();
      const allAccountMemberships = accRes.data || [];
      setAccountMemberships(allAccountMemberships);

      // Calculate stats from API data
      const totalMembers = apiMemberships.reduce((sum, m) => {
        // Count members by matching membershipid
        const membersForThis = allAccountMemberships.filter(acc => acc.membershipid === m.membershipid);
        return sum + membersForThis.length;
      }, 0);

      setStats({
        totalMemberships: apiMemberships.length,
        activeMemberships: apiMemberships.filter(m => m.status === 'ACTIVE').length,
        totalMembers
      });
    } catch (error) {
      console.error('Error fetching memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  const getMembershipIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('silver')) return <Shield className="h-6 w-6 text-gray-400" />;
    if (lowerName.includes('gold')) return <Award className="h-6 w-6 text-yellow-400" />;
    if (lowerName.includes('platinum')) return <Star className="h-6 w-6 text-purple-400" />;
    if (lowerName.includes('diamond')) return <Crown className="h-6 w-6 text-blue-400" />;
    return <Users className="h-6 w-6 text-primary-400" />;
  };

  const getMembershipColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('silver')) return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    if (lowerName.includes('gold')) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    if (lowerName.includes('platinum')) return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
    if (lowerName.includes('diamond')) return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
    return 'from-primary-500/20 to-primary-600/20 border-primary-500/30';
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'INACTIVE':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'SUSPENDED':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
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
      case 'SUSPENDED':
        return <AlertCircle size={16} />;
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


  const filteredMemberships = memberships.filter(membership => {
    if (searchTerm && !membership.membershipname.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !membership.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.status && membership.status !== filters.status) {
      return false;
    }
    if (filters.isActive !== undefined && membership.isActive !== filters.isActive) {
      return false;
    }
    if (filters.priceRange) {
      if (membership.price < filters.priceRange.min || membership.price > filters.priceRange.max) {
        return false;
      }
    }
    return true;
  });

  const handleCreateMembership = () => {
    setSelectedMembership(null);
    setIsCreateModalOpen(true);
  };

  const handleEditMembership = (membership: Membership) => {
    setSelectedMembership(membership);
    setIsEditModalOpen(true);
  };

  const handleDeleteMembership = async (membershipId: string) => {
    const membership = memberships.find(m => m.membershipid === membershipId);
    setMembershipToDelete(membership || null);
    setDeleteConfirmOpen(true);
  };

  const handleToggleStatus = async (membershipId: string) => {
    try {
      setLoading(true);
      // Find the membership
      const membership = memberships.find(m => m.membershipid === membershipId);

      if (!membership) return;
      if (membership.isActive) {
        // Deactivate (update status)
        await membershipService.update({ ...membership, isActive: false, status: 'INACTIVE' });
      } else {
        // Reactivate
        console.log('Reactivating membership:', membershipId);
        await membershipService.reactivate(membershipId);
      }
      // Refresh list
      const res = await membershipService.getAll();
      setMemberships(res.data || []);
    } catch (error) {
      console.error('Error toggling membership status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Replace membership.accountmemberships.length with count from accountMemberships
  const getMemberCount = (membershipId: string) => {
    return accountMemberships.filter(acc => acc.membershipid === membershipId).length;
  };

  return (
    <AdminLayout>
    <div className="space-y-6 bg-secondary-900 min-h-screen p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-800 to-secondary-700 rounded-xl p-6 border border-secondary-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-500/20 rounded-xl">
              <Crown className="h-6 w-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Membership Management</h1>
              <p className="text-secondary-300 mt-1">
                Create and manage cinema membership tiers and benefits
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleCreateMembership}>
              <Plus size={16} className="mr-2" />
              Create Membership
            </Button>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-secondary-800/50 rounded-lg p-4 border border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">Total Memberships</p>
                <p className="text-2xl font-bold text-white">{stats.totalMemberships}</p>
              </div>
              <Crown className="h-8 w-8 text-primary-400" />
            </div>
          </div>
          <div className="bg-secondary-800/50 rounded-lg p-4 border border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">Active Tiers</p>
                <p className="text-2xl font-bold text-green-400">{stats.activeMemberships}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-secondary-800/50 rounded-lg p-4 border border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">Total Members</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          {/* <div className="bg-secondary-800/50 rounded-lg p-4 border border-secondary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-400 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-400">{formatPrice(stats.monthlyRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </div> */}
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
                placeholder="Search memberships..."
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
              <option value="EXPIRED">Expired</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <select
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                isActive: e.target.value === '' ? undefined : e.target.value === 'true'
              }))}
              className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All States</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
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

      {/* Memberships Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
        <AnimatePresence>
          {filteredMemberships.map((membership, index) => (
            <motion.div
              key={membership.membershipId || membership.membershipid || index}
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
                  <div className={`relative h-32 bg-gradient-to-br ${getMembershipColor(membership.membershipname)} border-b`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {getMembershipIcon(membership.membershipname)}
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center space-x-1 ${getStatusColor(membership.status)}`}>
                        {getStatusIcon(membership.status)}
                        <span>{membership.status}</span>
                      </span>
                    </div>
                    {membership.isActive && (
                      <div className="absolute top-4 left-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center space-x-1">
                          <Zap size={12} />
                          <span>Live</span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col p-5">
                    <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">{membership.membershipname}</h3>
                    <p className="text-secondary-300 text-sm mb-3 line-clamp-2">{membership.description}</p>
                    <div className="flex flex-col gap-1 text-xs text-secondary-400 mb-4">
                      <div>
                        <span className="font-medium text-secondary-200">Points: </span>
                        <span className="text-primary-400 font-bold">{membership.points}</span>
                      </div>
                      <div>
                        <span className="font-medium text-secondary-200">Members: </span>
                        <span className="text-white">{getMemberCount(membership.membershipid)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-secondary-200">Created: </span>
                        <span className="text-white">{formatDate(membership.createdat)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto pt-3 border-t border-secondary-700">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:bg-blue-900/30"
                        onClick={() => handleEditMembership(membership)}
                      >
                        <Edit size={14} className="mr-1" /> Edit
                      </Button>
                      {membership.status == 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="danger"
                          className="text-red-400 hover:bg-red-900/30"
                          onClick={() => {
                          setMembershipToDelete(membership);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 size={14} className="mr-1" /> Deactivate
                      </Button>
                      )}
                      {membership.status == 'SUSPENDED' && (
                        <Button
                          size="sm"
                          variant={membership.isActive ? "danger" : "primary"}
                          onClick={() => handleToggleStatus(membership.membershipid)}
                        >
                        {membership.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="bg-secondary-800 border-secondary-700">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${getMembershipColor(membership.membershipname)} rounded-lg flex items-center justify-center border`}>
                          {getMembershipIcon(membership.membershipname)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{membership.membershipname}</h3>
                          <p className="text-secondary-400 text-sm">{membership.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-lg font-bold text-primary-400">
                              {membership.points}
                            </span>
                            <span className="text-xs text-secondary-500">
                              {getMemberCount(membership.membershipid)} members
                            </span>
                            <span className="text-xs text-secondary-500">
                              Created {formatDate(membership.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center space-x-1 ${getStatusColor(membership.status)}`}>
                          {getStatusIcon(membership.status)}
                          <span>{membership.status}</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditMembership(membership)}>
                            <Edit size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setMembershipToDelete(membership);
                            setDeleteConfirmOpen(true);
                          }}>
                            <Trash2 size={14} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={membership.isActive ? "danger" : "primary"}
                            onClick={() => handleToggleStatus(membership.membershipid)}
                          >
                            {membership.isActive ? 'Deactivate' : 'Activate'}
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

      {filteredMemberships.length === 0 && (
        <div className="text-center py-12">
          <Crown className="h-16 w-16 text-secondary-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-300 mb-2">No memberships found</h3>
          <p className="text-secondary-500 mb-6">
            {searchTerm || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters'
              : 'Create your first membership tier to get started'
            }
          </p>
          <Button onClick={handleCreateMembership}>
            <Plus size={16} className="mr-2" />
            Create Membership
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <MembershipModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedMembership(null);
        }}
        membership={selectedMembership}
        onSave={async (membershipData) => {
          if (selectedMembership) {
            // Update existing membership
            try {
              setLoading(true);
              await membershipService.update({
                ...selectedMembership,
                ...membershipData
              });
              // Refresh list
              const res = await membershipService.getAll();
              setMemberships(res.data || []);
            } catch (error) {
              console.error('Error updating membership:', error);
            } finally {
              setLoading(false);
            }
          } else {
            // Create new membership
            try {
              setLoading(true);
              console.log('Creating membership:', membershipData);
              await membershipService.create(membershipData as any);
              
              // Refresh list
              const res = await membershipService.getAll();
              setMemberships(res.data || []);
            } catch (error) {
              console.error('Error creating membership:', error);
            } finally {
              setLoading(false);
            }
          }
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedMembership(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Deactivate Membership"
      >
        <div className="space-y-4">
          <p className="text-white">
            Are you sure you want to deactivate <span className="font-bold">{membershipToDelete?.membershipname}</span>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (membershipToDelete) {
                  setLoading(true);
                  await membershipService.delete(membershipToDelete.membershipid);
                  // Refresh list
                  const res = await membershipService.getAll();
                  setMemberships(res.data || []);
                  setDeleteConfirmOpen(false);
                  setMembershipToDelete(null);
                  setLoading(false);
                }
              }}
            >
              deactivate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </AdminLayout>
  );
};

// Membership Form Modal Component
interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  membership: Membership | null;
  onSave: (data: MembershipFormData) => void;
}

const MembershipModal: React.FC<MembershipModalProps> = ({
  isOpen,
  onClose,
  membership,
  onSave
}) => {
  const [formData, setFormData] = useState<MembershipFormData>({
    membershipname: '',
    description: '',
    points: 0,
    status: 'ACTIVE',
    isActive: true
  });

  useEffect(() => {
    if (membership) {
      setFormData({
        membershipname: membership.membershipname,
        description: membership.description,
        points: membership.points, // changed from price
        status: membership.status,
        isActive: membership.isActive
      });
    } else {
      setFormData({
        membershipname: '',
        description: '',
        points: 0,
        status: 'ACTIVE',
        isActive: true
      });
    }
  }, [membership]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const membershipTiers = [
    { name: 'Bronze', icon: '🥉', color: 'text-orange-400' },
    { name: 'Silver', icon: '🥈', color: 'text-gray-400' },
    { name: 'Gold', icon: '🥇', color: 'text-yellow-400' },
    { name: 'Platinum', icon: '💎', color: 'text-purple-400' },
    { name: 'Diamond', icon: '💠', color: 'text-blue-400' },
    { name: 'VIP', icon: '👑', color: 'text-red-400' }
  ];

    function getStatusColor(status: string) {
      switch (status.toUpperCase()) {
        case 'ACTIVE':
          return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'INACTIVE':
          return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'PENDING':
          return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'SUSPENDED':
          return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        default:
          return 'bg-secondary-600/50 text-secondary-300 border-secondary-500/30';
      }
    }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={membership ? 'Edit Membership' : 'Create New Membership'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Membership Name</label>
            <input
              type="text"
              value={formData.membershipname}
              onChange={(e) => setFormData(prev => ({ ...prev, membershipname: e.target.value }))}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              placeholder="Enter membership name..."
              required
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {membershipTiers.map(tier => (
                <button
                  key={tier.name}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, membershipname: tier.name }))}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    formData.membershipname === tier.name
                      ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                      : 'bg-secondary-700 text-secondary-300 border-secondary-600 hover:border-secondary-500'
                  }`}
                >
                  <span className="mr-1">{tier.icon}</span>
                  {tier.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Eexpired</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            placeholder="Enter membership description and benefits..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Points</label>
          <div className="relative">
            <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
            <input
              type="number"
              value={formData.points}
              onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
              min="0"
              step="1"
              className="w-full pl-10 pr-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
              placeholder="0"
              required
            />
          </div>
        </div>

        {/* <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="w-4 h-4 text-primary-600 bg-secondary-700 border-secondary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="isActive" className="text-sm text-white">
            Active membership (available for new subscriptions)
          </label>
        </div> */}

        <div className="bg-secondary-700/50 rounded-lg p-4 border border-secondary-600">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center">
            <Gift className="h-4 w-4 mr-2 text-primary-400" />
            Membership Preview
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-400">Name:</span>
              <span className="text-white font-medium">{formData.membershipname || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-400">Points:</span>
              <span className="text-primary-400 font-bold">
                {formData.points > 0 ? `${formData.points} pts` : '0 pts'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-400">Status:</span>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(formData.status)}`}>
                {formData.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {membership ? 'Update Membership' : 'Create Membership'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MembershipManagement;