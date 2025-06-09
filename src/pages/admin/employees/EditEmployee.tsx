import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { userService } from '../../../services/modules/user.service';
import { staffService } from '../../../services/modules/staff.service';
// Removed UserRole import as it's no longer needed
import type { StaffRequest } from '../../../services/types/request.types';

interface EmployeeFormData {
  // Account fields
  accountId: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  image?: string;
  sex: string;
  identityCard: string;
  
  // Staff specific fields
  position: string;
  department: string;
  salary: number;
  joinDate: string;
}

const EditEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<EmployeeFormData>({
    accountId: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    image: '',
    sex: '',
    identityCard: '',
    position: '',
    department: '',
    salary: 0,
    joinDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setIsLoading(true);
        // First fetch staff info using the ID from URL
        const staffResponse = await staffService.getById(id!);
        console.log('Staff data:', staffResponse);
        
        if (staffResponse.data) {
          const staff = staffResponse.data;
          setFormData(prev => ({
            ...prev,
            position: staff.position || '',
            department: staff.department || '',
            salary: staff.salary || 0,
            joinDate: staff.joinDate || new Date().toISOString().split('T')[0]
          }));

          // Then fetch account info using accountId from staff data
          const accountResponse = await userService.getById(staff.accountId);
          console.log('Account data:', accountResponse);
          
          if (accountResponse.data) {
            const account = accountResponse.data;
            setFormData(prev => ({
              ...prev,
              username: account.username || '',
              email: account.email || '',
              fullName: account.displayname || '',
              phoneNumber: account.phonenumber || '',
              address: account.address || '',
              dateOfBirth: account.dateofbirth || '',
              image: account.avatar || '',
              sex: account.gender || '',
              identityCard: account.identitycard || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
        toast.error('Failed to fetch employee data');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData});
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.phoneNumber || 
        !formData.address || !formData.position || 
        !formData.joinDate) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Update account information
      const accountData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        sex: formData.sex,
        identityCard: formData.identityCard,
        image: formData.image
      };

      if (formData.password) {
        Object.assign(accountData, { password: formData.password });
      }

      const accountResponse = await userService.update(id!, accountData);
      console.log('Account update response:', accountResponse);

      // Update staff information
      const staffData: Partial<StaffRequest> = {
        position: formData.position,
        salary: formData.salary
      };

      const staffResponse = await staffService.update(id!, staffData);
      console.log('Staff update response:', staffResponse);

      toast.success('Employee updated successfully');
      navigate('/admin/employees');
    } catch (error: any) {
      console.error('Error updating employee:', error);
      setError(error.response?.data?.message || 'Failed to update employee');
      toast.error(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-secondary-300 hover:text-white mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">Edit Employee</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-accent-900 text-accent-300 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Profile Information */}
            <div className="bg-secondary-800 rounded-lg p-6 space-y-6">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white border-b border-secondary-700 pb-2">
                  Account Information
                </h2>

                <div className="opacity-75">
                  <Input
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled
                  />

                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current password"
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white border-b border-secondary-700 pb-2">
                  Personal Information
                </h2>

                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Identity Card"
                  name="identityCard"
                  value={formData.identityCard}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Gender
                  </label>
                  <select
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column - Staff Information */}
            <div className="bg-secondary-800 rounded-lg p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white border-b border-secondary-700 pb-2">
                Employment Information
              </h2>

              <div className="space-y-6">
                <Input
                  label="Position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Join Date"
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Salary"
                  name="salary"
                  type="number"
                  min="0"
                  step="100000"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditEmployee;