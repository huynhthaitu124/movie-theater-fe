import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Edit, Trash2, UserPlus, 
  Download, Upload, MoreVertical 
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';
import { Employee } from '../../../types/employee';

const EmployeeList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data - replace with API call
  const employees: Employee[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@cinema.com',
      role: 'staff',
      department: 'Box Office',
      phoneNumber: '(123) 456-7890',
      joinDate: '2024-01-15',
      status: 'active',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@cinema.com',
      role: 'admin',
      department: 'Management',
      phoneNumber: '(123) 456-7891',
      joinDate: '2023-08-20',
      status: 'active',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Employee Management</h1>
          <div className="flex items-center gap-4">
            <Button variant="secondary" leftIcon={<Download size={20} />}>
              Export
            </Button>
            <Link to="/admin/employees/add">
              <Button leftIcon={<UserPlus size={20} />}>
                Add Employee
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-secondary-800 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="all">All Departments</option>
                <option value="box-office">Box Office</option>
                <option value="management">Management</option>
                <option value="operations">Operations</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-secondary-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-secondary-700">
                  <th className="px-6 py-4 text-secondary-300 font-medium">Employee</th>
                  <th className="px-6 py-4 text-secondary-300 font-medium">Department</th>
                  <th className="px-6 py-4 text-secondary-300 font-medium">Contact</th>
                  <th className="px-6 py-4 text-secondary-300 font-medium">Status</th>
                  <th className="px-6 py-4 text-secondary-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-700">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-secondary-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                          {employee.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-white">{employee.name}</div>
                          <div className="text-sm text-secondary-400">{employee.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-secondary-300">{employee.department}</div>
                      <div className="text-sm text-secondary-400">Joined {new Date(employee.joinDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-secondary-300">{employee.email}</div>
                      <div className="text-sm text-secondary-400">{employee.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        employee.status === 'active' 
                          ? 'bg-success-900 text-success-300' 
                          : 'bg-secondary-700 text-secondary-300'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          className="p-1 hover:bg-secondary-600 rounded-full"
                          onClick={() => {/* Handle edit */}}
                        >
                          <Edit size={18} className="text-secondary-400 hover:text-white" />
                        </button>
                        <button 
                          className="p-1 hover:bg-secondary-600 rounded-full"
                          onClick={() => {/* Handle delete */}}
                        >
                          <Trash2 size={18} className="text-secondary-400 hover:text-accent-500" />
                        </button>
                        <button className="p-1 hover:bg-secondary-600 rounded-full">
                          <MoreVertical size={18} className="text-secondary-400 hover:text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-secondary-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary-400">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                <span className="font-medium">20</span> results
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm bg-secondary-700 text-white rounded-lg hover:bg-secondary-600">
                  Previous
                </button>
                <button className="px-4 py-2 text-sm bg-secondary-700 text-white rounded-lg hover:bg-secondary-600">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EmployeeList;