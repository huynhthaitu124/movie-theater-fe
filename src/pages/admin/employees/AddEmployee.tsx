import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

interface EmployeeFormData {
  name: string;
  email: string;
  role: 'admin' | 'staff';
  department: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const AddEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    role: 'staff',
    department: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement API call to create employee
      console.log('Form submitted:', formData);
      navigate('/admin/employees');
    } catch (error) {
      console.error('Error creating employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin/employees"
              className="p-2 hover:bg-secondary-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-secondary-300" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Add New Employee</h1>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl bg-secondary-800 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Input
                  label="Full Name"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Phone Number"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Box Office">Box Office</option>
                    <option value="Management">Management</option>
                    <option value="Operations">Operations</option>
                    <option value="Concessions">Concessions</option>
                  </select>
                </div>

                <Input
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Confirm Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-secondary-700">
              <Button
                variant="secondary"
                onClick={() => navigate('/admin/employees')}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
              >
                Create Employee
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddEmployee;