import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, Plus, Search, Edit, Trash } from 'lucide-react';
import Button from '@/components/common/Button';
import AdminLayout from '@/components/layout/AdminLayout';
import { memberService } from '@/services/modules/member.service';
import type { Member } from '@/types/member';

const MemberList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Member>('displayName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await memberService.getAll();
      console.log('Fetched members:', response);

      console.log('Response data:', response?.data);

      if (!response?.data) {
        throw new Error('Failed to fetch members');
      }

      let memberData: Member[] = [];
      if (Array.isArray(response.data)) {
        memberData = response.data;
      } else {
        throw new Error('Invalid member data format');
      }

      setMembers(memberData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch members';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await memberService.deleteSoft(id);
      if (response.data.isActive === false) {
        toast.success('Member deleted successfully');
        await fetchMembers();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete member';
      toast.error(errorMessage);
    } finally {
      setShowDeleteModal(false);
      setSelectedMember(null);
      setIsProcessing(false);
    }
  };

  const handleSort = (field: keyof Member) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedMembers = useMemo(() => {
    return [...members]
      .filter(mem => 
        mem.isActive &&
        Object.entries(mem)
          .filter(([key]) => ['memberId', 'displayName', 'email', 'phoneNumber', 'address'].includes(key))
          .some(([_, value]) => 
            value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
      .sort((a, b) => {
        const aValue = a[sortField]?.toString().toLowerCase();
        const bValue = b[sortField]?.toString().toLowerCase();
        
        if (!aValue || !bValue) return 0;
        
        const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? compareResult : -compareResult;
      });
  }, [members, searchQuery, sortField, sortDirection]);

  const TableHeader: React.FC<{ field: keyof Member; label: string }> = ({ field, label }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider cursor-pointer hover:text-secondary-300 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {sortField === field && (
          <span className="ml-2">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  // Removed unused status badge renderer

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center p-8 bg-secondary-800 rounded-lg">
          <AlertCircle size={48} className="text-accent-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Members</h2>
          <p className="text-secondary-400 text-center mb-6">{error}</p>
          <Button onClick={fetchMembers}>
            Try Again
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Member Management</h1>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/members/inactive')}
              className="flex items-center whitespace-nowrap"
            >
              View Inactive Members
            </Button>
            <Button
              onClick={() => navigate('/admin/members/add')}
              className="flex items-center whitespace-nowrap"
            >
              <Plus size={20} className="mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        <div className="flex items-center bg-secondary-800 rounded-lg px-4 py-2 w-full md:w-96">
          <Search size={20} className="text-secondary-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-white ml-2 w-full placeholder-secondary-400"
          />
        </div>

        <div className="bg-secondary-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-700">
              <thead>
                <tr>
                  <TableHeader field="displayName" label="Name" />
                  <TableHeader field="email" label="Email" />
                  <TableHeader field="memberShipLevel" label="Membership" />
                  <TableHeader field="gender" label="Gender" />
                  <TableHeader field="dateOfBirth" label="Date of Birth" />
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-700">
                {filteredAndSortedMembers.map((member) => (
                  <tr 
                    key={member.memberId}
                    className="hover:bg-secondary-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium">{member.displayName}</div>
                          <div className="text-secondary-400 text-xs">{member.phoneNumber}</div>
                          <div className="text-secondary-400 text-xs">{member.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <span className="px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                        {member.memberShipLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {member.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(member.dateOfBirth).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/admin/members/edit/${member.memberId}`)}
                          className="hover:text-primary-500"
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="hover:text-red-500"
                          onClick={() => {
                            setSelectedMember(member.memberId);
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash size={16} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAndSortedMembers.length === 0 && (
            <div className="text-center py-8 text-secondary-400">
              No members found matching your search criteria
            </div>
          )}
        </div>

        {members.length === 0 && !isLoading && !error && (
          <div className="bg-secondary-800 rounded-lg p-8 text-center">
            <p className="text-secondary-400 mb-4">No members found</p>
            <Button
              onClick={() => navigate('/admin/members/add')}
              className="flex items-center mx-auto"
            >
              <Plus size={20} className="mr-2" />
              Add First Member
            </Button>
          </div>
        )}
      </div>

      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-secondary-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-secondary-300 mb-6">
              Are you sure you want to delete this member? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={() => handleDeleteMember(selectedMember)}
                className="bg-red-500 hover:bg-red-600"
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MemberList;
