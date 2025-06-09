import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, Search, ArrowLeftRight } from 'lucide-react';
import type { Employee } from '@/types/employee';
import { staffService } from '@/services/modules/staff.service';
import Button from '@/components/common/Button';
import AdminLayout from '@/components/layout/AdminLayout';

const InactiveEmployees: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInactiveEmployees();
  }, []);

  const fetchInactiveEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await staffService.getAll();

      if (!response?.data) {
        throw new Error('Failed to fetch employees');
      }

      let employeeData: Employee[] = [];
      
      if (Array.isArray(response.data)) {
        // Lọc chỉ lấy nhân viên inactive
        employeeData = response.data.filter(emp => emp.status === "INACTIVE");
      } else {
        throw new Error('Invalid employee data format');
      }

      setEmployees(employeeData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inactive employees';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateEmployee = async (id: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const response = await staffService.reactivate(id);
      console.log('Reactivate response:', response);
      console.log('Reactivate response data:', response.data.status);
      if (response.data.status === 'ACTIVE') {
        toast.success('Employee reactivated successfully');
        await fetchInactiveEmployees();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reactivate employee';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    Object.entries(emp)
      .filter(([key]) => ['staffid', 'displayName', 'position', 'department'].includes(key))
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
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Inactive Employees</h2>
          <p className="text-secondary-400 text-center mb-6">{error}</p>
          <Button onClick={fetchInactiveEmployees}>
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
          <h1 className="text-2xl font-bold text-white">Inactive Employees</h1>
          <Button
            onClick={() => navigate('/admin/employees')}
            variant="secondary"
            className="flex items-center"
          >
            Back to Employee List
          </Button>
        </div>

        <div className="flex items-center bg-secondary-800 rounded-lg px-4 py-2 w-full md:w-96">
          <Search size={20} className="text-secondary-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search inactive employees..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-700">
                {filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.staffid}
                    className="hover:bg-secondary-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium">{employee.displayName}</div>
                          <div className="text-secondary-400 text-xs">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <Button
                        onClick={() => handleReactivateEmployee(employee.staffid)}
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
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-secondary-400">
              No inactive employees found
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default InactiveEmployees;
