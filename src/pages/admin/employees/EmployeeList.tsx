import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, Edit2, Trash2, AlertCircle 
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';

// Add mock employees data
const mockEmployees = [
  {
    id: 'EMP001',
    name: 'John Doe',
    identityCard: '123456789',
    email: 'john.doe@example.com',
    phoneNumber: '(555) 123-4567',
    address: '123 Main St, City',
    role: 'Staff',
    status: 'active'
  },
  {
    id: 'EMP002',
    name: 'Jane Smith',
    identityCard: '987654321',
    email: 'jane.smith@example.com',
    phoneNumber: '(555) 234-5678',
    address: '456 Oak Ave, Town',
    role: 'Manager',
    status: 'active'
  },
  {
    id: 'EMP003',
    name: 'Mike Johnson',
    identityCard: '456789123',
    email: 'mike.j@example.com',
    phoneNumber: '(555) 345-6789',
    address: '789 Pine St, Village',
    role: 'Staff',
    status: 'active'
  },
  {
    id: 'EMP004',
    name: 'Sarah Williams',
    identityCard: '789123456',
    email: 'sarah.w@example.com',
    phoneNumber: '(555) 456-7890',
    address: '321 Elm St, County',
    role: 'Staff',
    status: 'active'
  },
  {
    id: 'EMP005',
    name: 'David Brown',
    identityCard: '321654987',
    email: 'david.b@example.com',
    phoneNumber: '(555) 567-8901',
    address: '654 Maple Dr, District',
    role: 'Manager',
    status: 'active'
  }
];

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Replace the employees constant with mockEmployees
  const employees = mockEmployees;

  // Add sorting functionality
  const [sortField, setSortField] = useState<keyof typeof employees[0]>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof typeof employees[0]) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    Object.values(emp).some(value => 
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement delete API call
      setShowDeleteModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  // Update table header to include sort indicators
  const TableHeader: React.FC<{ field: keyof typeof employees[0], label: string }> = ({ field, label }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider cursor-pointer"
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Employee Management</h1>
          <Button
            onClick={() => navigate('/admin/employees/add')}
            className="flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Employee
          </Button>
        </div>

        <div className="flex items-center bg-secondary-800 rounded-lg px-4 py-2 w-full md:w-96">
          <Search size={20} className="text-secondary-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            maxLength={28}
            className="bg-transparent border-none focus:outline-none text-white ml-2 w-full"
          />
        </div>

        <div className="bg-secondary-800 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-700">
                  <TableHeader field="id" label="Employee ID" />
                  <TableHeader field="name" label="Name" />
                  <TableHeader field="identityCard" label="Identity Card" />
                  <TableHeader field="email" label="Email" />
                  <TableHeader field="phoneNumber" label="Phone" />
                  <TableHeader field="address" label="Address" />
                  <th className="px-6 py-3 text-right text-xs font-medium text-secondary-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-700">
                {sortedEmployees.map((employee) => (
                  <tr 
                    key={employee.id}
                    className="hover:bg-secondary-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {employee.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {employee.identityCard}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {employee.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {employee.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/employees/edit/${employee.id}`)}
                        className="text-primary-500 hover:text-primary-400 mr-4"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedEmployee(employee.id);
                          setShowDeleteModal(true);
                        }}
                        className="text-accent-500 hover:text-accent-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-secondary-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center text-accent-500 mb-4">
              <AlertCircle size={24} className="mr-2" />
              <h3 className="text-lg font-medium">Confirm Delete</h3>
            </div>
            <p className="text-secondary-300 mb-6">
              Are you sure you want to delete this employee? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={() => selectedEmployee && handleDelete(selectedEmployee)}
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