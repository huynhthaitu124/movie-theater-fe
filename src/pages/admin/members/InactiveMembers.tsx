import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, Search, ArrowLeftRight } from 'lucide-react';
import type { Member } from '@/types/member';
import { memberService } from '@/services/modules/member.service';
import Button from '@/components/common/Button';
import AdminLayout from '@/components/layout/AdminLayout';

const InactiveMembers: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInactiveMembers();
  }, []);

  const fetchInactiveMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await memberService.getAll();

      if (!response?.data) {
        throw new Error('Failed to fetch members');
      }

      let memberData: Member[] = [];
      
      if (Array.isArray(response.data)) {
        memberData = response.data.filter(mem => !mem.isActive);
      } else {
        throw new Error('Invalid member data format');
      }

      setMembers(memberData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inactive members';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateMember = async (id: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await memberService.reactivate(id);
      if (response.data.isActive === true) {
        toast.success('Member reactivated successfully');
        await fetchInactiveMembers();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reactivate member';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredMembers = members.filter(mem =>
    !mem.isActive &&
    Object.entries(mem)
      .filter(([key]) => ['memberId', 'displayName', 'email'].includes(key))
      .some(([_, value]) => 
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

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
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Inactive Members</h2>
          <p className="text-secondary-400 text-center mb-6">{error}</p>
          <Button onClick={fetchInactiveMembers}>
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
          <h1 className="text-2xl font-bold text-white">Inactive Members</h1>
          <Button
            onClick={() => navigate('/admin/members')}
            variant="secondary"
            className="flex items-center"
          >
            Back to Member List
          </Button>
        </div>

        <div className="flex items-center bg-secondary-800 rounded-lg px-4 py-2 w-full md:w-96">
          <Search size={20} className="text-secondary-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search inactive members..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase">Join Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-700">
                {filteredMembers.map((member) => (
                  <tr 
                    key={member.memberId}
                    className="hover:bg-secondary-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium">{member.displayName}</div>
                          <div className="text-secondary-400 text-xs">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <Button
                        onClick={() => handleReactivateMember(member.memberId)}
                        className="flex items-center gap-2"
                        disabled={isProcessing}
                      >
                        <ArrowLeftRight size={16} />
                        {isProcessing ? 'Processing...' : 'Reactivate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-secondary-400">
              No inactive members found
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default InactiveMembers;
