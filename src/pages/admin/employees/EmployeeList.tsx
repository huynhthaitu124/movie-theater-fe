import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertCircle, Plus, Search, Edit, Trash } from 'lucide-react';
import type { Employee } from '@/types/employee';
import { staffService } from '@/services/modules/staff.service';
import Button from '@/components/common/Button';
import AdminLayout from '@/components/layout/AdminLayout';

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Employee>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    fetchEmployees();
  }, [retryCount]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await staffService.getAll();
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to fetch employees');
      }

      setEmployees(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const response = await staffService.delete(id);
      if (response.success) {
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete employee';
      toast.error(errorMessage);
    } finally {
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    }
  };

  const handleSort = (field: keyof Employee) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedEmployees = useMemo(() => {
    return [...employees]
      .filter(emp => 
        Object.entries(emp)
          .filter(([key]) => ['fullName', 'position', 'department', 'status'].includes(key))
          .some(([_, value]) => 
            value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (!aValue || !bValue) return 0;
        
        const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? compareResult : -compareResult;
      });
  }, [employees, searchQuery, sortField, sortDirection]);

  const TableHeader: React.FC<{ field: keyof Employee; label: string }> = ({ field, label }) => (
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

  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      banned: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusConfig[status as keyof typeof statusConfig]}`}>
        {status}
      </span>
    );
  };

  const renderError = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-secondary-800 rounded-lg">
      <AlertCircle size={48} className="text-accent-500 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Error Loading Employees</h2>
      <p className="text-secondary-400 text-center mb-6">{error}</p>
      {retryCount < maxRetries ? (
        <Button
          onClick={() => setRetryCount(prev => prev + 1)}
          className="flex items-center"
        >
          Try Again
        </Button>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-secondary-400">Maximum retry attempts reached.</p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/dashboard')}
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => {
                setRetryCount(0);
                fetchEmployees();
              }}
            >
              Reset & Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      );
    }

    if (error) {
      return renderError();
    }

    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Employee Management</h1>
          <Button
            onClick={() => navigate('/admin/employees/add')}
            className="flex items-center whitespace-nowrap"
          >
            <Plus size={20} className="mr-2" />
            Add Employee
          </Button>
        </div>

        <div className="flex items-center bg-secondary-800 rounded-lg px-4 py-2 w-full md:w-96">
          <Search size={20} className="text-secondary-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search employees..."
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
                  <TableHeader field="fullName" label="Name" />
                  <TableHeader field="position" label="Position" />
                  <TableHeader field="department" label="Department" />
                  <TableHeader field="joinDate" label="Join Date" />
                  <TableHeader field="status" label="Status" />
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-700">
                {filteredAndSortedEmployees.map((employee) => (
                  <tr 
                    key={employee.id}
                    className="hover:bg-secondary-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <div className="flex items-center">
                        {employee.avatar && (
                          <img
                            src={employee.avatar}
                            alt={employee.fullName}
                            className="h-8 w-8 rounded-full mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium">{employee.fullName}</div>
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
                      {new Date(employee.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {renderStatusBadge(employee.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/admin/employees/edit/${employee.id}`)}
                          className="hover:text-primary-500"
                        >
                          <Edit size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="hover:text-red-500"
                          onClick={() => {
                            setSelectedEmployee(employee.id);
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
          {filteredAndSortedEmployees.length === 0 && (
            <div className="text-center py-8 text-secondary-400">
              No employees found matching your search criteria
            </div>
          )}
        </div>

        {/* Cập nhật phần hiển thị khi không có nhân viên */}
        {employees.length === 0 && !isLoading && !error && (
          <div className="bg-secondary-800 rounded-lg p-8 text-center">
            <p className="text-secondary-400 mb-4">No employees found</p>
            <Button
              onClick={() => navigate('/admin/employees/add')}
              className="flex items-center mx-auto"
            >
              <Plus size={20} className="mr-2" />
              Add First Employee
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      {renderContent()}
      {showDeleteModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-secondary-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-secondary-300 mb-6">
              Are you sure you want to delete this employee? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={() => handleDeleteEmployee(selectedEmployee)}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default EmployeeList;