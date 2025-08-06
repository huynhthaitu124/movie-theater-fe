import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, Plus, Search, Edit, Trash, User2 } from 'lucide-react';
import Button from '@/components/common/Button';
import AdminLayout from '@/components/layout/AdminLayout';
import { memberService } from '@/services/modules/member.service';
import { userService } from "@/services/modules/user.service"; // Adjust path as needed
import { roleService } from '@/services/modules/role.service';
import type { Member } from '@/types/member';
import CreateStaffModal from "@/components/modals/CreateStaffModal";
import { staffService } from "@/services/modules/staff.service";

const membershipTiers = [
  { name: 'Bronze', icon: '🥉', bg: 'bg-orange-400' },
  { name: 'Silver', icon: '🥈', bg: 'bg-gray-400' },
  { name: 'Gold', icon: '🥇', bg: 'bg-yellow-400' },
  { name: 'Platinum', icon: '💎', bg: 'bg-purple-400' },
  { name: 'Diamond', icon: '💠', bg: 'bg-blue-400' },
  { name: 'VIP', icon: '👑', bg: 'bg-red-400' }
];

const MemberList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Member>('displayName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterMembership, setFilterMembership] = useState<string>('All');
  const [filterGender, setFilterGender] = useState<string>('All');
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [staffMember, setStaffMember] = useState<Member | null>(null);  

  useEffect(() => {
    fetchMembersAndAccounts();
  }, []);

  const fetchMembersAndAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [memberRes, accountRes, roleRes] = await Promise.all([
        memberService.getAll(),
        userService.getAll(),
        roleService.getAll()
      ]);

      if (!memberRes?.data || !accountRes?.data || !roleRes?.data) {
        throw new Error('Failed to fetch data');
      }

      setMembers(Array.isArray(memberRes.data) ? memberRes.data : []);
      setAccounts(Array.isArray(accountRes.data) ? accountRes.data : []);
      setRoles(Array.isArray(roleRes.data) ? roleRes.data : []);
      console.log(roleRes.data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
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
        await fetchMembersAndAccounts();
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
    // Find account for each member and check roleName
    return [...members]
      .filter(mem => {
        const account = accounts.find(acc => acc.accountId === mem.accountId);
        return (
          mem.isActive &&
          account?.roleName === "Member" &&
          (filterMembership === 'All' || mem.memberShipLevel === filterMembership) &&
          (filterGender === 'All' || mem.gender === filterGender) &&
          Object.entries(mem)
            .filter(([key]) => ['memberId', 'displayName', 'email', 'phoneNumber', 'address'].includes(key))
            .some(([_, value]) =>
              value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
      })
      .sort((a, b) => {
        const aValue = a[sortField]?.toString().toLowerCase();
        const bValue = b[sortField]?.toString().toLowerCase();

        if (!aValue || !bValue) return 0;

        const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? compareResult : -compareResult;
      });
  }, [members, accounts, searchQuery, sortField, sortDirection, filterMembership, filterGender]);

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
          <Button onClick={fetchMembersAndAccounts}>
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
          <div className="flex items-center space-x-2">
            <User2 className="h-6 w-6 text-primary-400" />
            <h1 className="text-2xl font-bold text-white">Member Management</h1>
          </div>
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

        {/* Filter Section */}
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div>
            <label className="text-secondary-400 mr-2">Membership:</label>
            <select
              value={filterMembership}
              onChange={e => setFilterMembership(e.target.value)}
              className="bg-secondary-800 text-white rounded px-2 py-1 border border-secondary-700"
            >
              <option value="All">All</option>
              {membershipTiers.map(tier => (
                <option key={tier.name} value={tier.name}>{tier.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-secondary-400 mr-2">Gender:</label>
            <select
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
              className="bg-secondary-800 text-white rounded px-2 py-1 border border-secondary-700"
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
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
                      {(() => {
                        const tier = membershipTiers.find(t => t.name.toLowerCase() === member.memberShipLevel?.toLowerCase());
                        if (tier) {
                          return (
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${tier.bg} bg-opacity-30`}>
                              <span>{tier.icon}</span>
                              <span>{tier.name}</span>
                            </span>
                          );
                        }
                        return (
                          <span className="px-2 py-1 rounded-full text-xs bg-secondary-700 text-secondary-300">
                            {member.memberShipLevel || 'Unknown'}
                          </span>
                        );
                      })()}
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
                        <Button
                          variant="ghost"
                          className="hover:text-green-500"
                          onClick={() => {
                            setStaffMember(member);
                            setShowCreateStaffModal(true);
                          }}
                        >
                          <Plus size={16} className="mr-1" />
                          Hire
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

      {showCreateStaffModal && staffMember && (
        <CreateStaffModal
          isOpen={showCreateStaffModal}
          onClose={() => setShowCreateStaffModal(false)}
          memberName={staffMember.displayName}
          onSubmit={async ({ position, hiredate, salary }) => {
            try {
              setIsProcessing(true);
              
              // Get the staff role ID
              const staffRole = roles.find(role => 
                role.rolename?.toLowerCase() === 'staff' || 
                role.rolename?.toLowerCase() === 'employee'
              );
              
              if (!staffRole) {
                toast.error("Staff role not found. Please check role configuration.");
                setIsProcessing(false);
                return;
              }
              
              // Step 1: Create staff record
              const staffData = {
                accountid: staffMember.accountId,
                position,
                hiredate,
                salary,
              };
              console.log('Creating staff with data:', staffData);
              const staffResponse = await staffService.create(staffData);
              
              if (staffResponse && staffResponse.data) {
                // Step 2: Fetch current account data
                console.log('Fetching account data for:', staffMember.accountId);
                const accountResponse = await userService.getById(staffMember.accountId);
                
                if (accountResponse && accountResponse.data) {
                  const accountData = accountResponse.data;
                  console.log('Current account data:', accountData);
                  
                  // Step 3: Update account's role while preserving existing data
                  const accountUpdateData = {
                    accountId: accountData.accountId,
                    roleId: staffRole.roleid,
                    image: accountData.image || "",
                    fullName: accountData.fullName || staffMember.displayName || "",
                    dateOfBirth: accountData.dateOfBirth || staffMember.dateOfBirth || "",
                    sex: accountData.sex || staffMember.gender || "",
                    email: accountData.email || staffMember.email || "",
                    identityCard: accountData.identityCard || staffMember.identityCard || "",
                    phoneNumber: accountData.phoneNumber || staffMember.phoneNumber || "",
                    address: accountData.address || staffMember.address || ""
                  };
                  


                  console.log('Updating account role with data:', accountUpdateData);
                  console.log('Using Staff Role ID:', staffRole.roleid);
                  
                  const updateResponse = await userService.update(staffMember.accountId, accountUpdateData);
                  
                  if (updateResponse && updateResponse.data) {
                    toast.success("Staff created and account role updated successfully!");
                    await fetchMembersAndAccounts();
                  } else {
                    toast.warning("Staff created but failed to update account role.");
                  }
                } else {
                  toast.warning("Staff created but couldn't fetch account data for role update.");
                }
                setShowCreateStaffModal(false);
              } else {
                toast.error("Failed to create staff.");
              }
            } catch (err) {
              console.error("Error in staff creation process:", err);
              toast.error("Error creating staff or updating account.");
            } finally {
              setIsProcessing(false);
            }
          }}
        />
      )}
    </AdminLayout>
  );
};

export default MemberList;
