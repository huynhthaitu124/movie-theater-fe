import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { userService } from '../../../services/modules/user.service';
import { staffService } from '../../../services/modules/staff.service';
import { roleService } from '../../../services/modules/role.service';
import { AccountRequest, StaffRequest } from '../../../services/types/request.types';
import { Role } from '../../../types/role';

interface EmployeeFormData {
  // Account fields
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayname: string;
  phonenumber: string;
  address: string;
  dateofbirth: string;
  preferredlanguage: string;
  avatar?: string;
  gender: string;
  identityCard: string;
  roleid: string;
  
  // Staff specific fields
  position: string;
  hiredate: string;
  salary: number;
}

const AddEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayname: '',
    phonenumber: '',
    address: '',
    dateofbirth: '',
    preferredlanguage: 'vi',
    avatar: '',
    gender: '',
    identityCard: '',
    roleid: '', // Will be set after fetching staff role
    position: '',
    hiredate: new Date().toISOString().split('T')[0],
    salary: 0,
  });

  useEffect(() => {
    const fetchStaffRole = async () => {
      try {
        const response = await roleService.getAll();
        console.log('Raw response:', response);

        // Kiểm tra cấu trúc response
        if (!response || !response.data) {
          console.error('Invalid response structure');
          return;
        }

        // Log cấu trúc data để debug
        console.log('Response structure:', {
          hasData: !!response,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          data: response.data
        });

        const roles = response.data;
        console.log('Roles:', roles);

        if (!Array.isArray(roles)) {
          console.error('Roles is not an array');
          return;
        }

        // Tìm role staff
        const staffRole = roles.find(role => role?.rolename?.toLowerCase() === 'staff');
        console.log('Staff role:', staffRole);

        if (staffRole?.roleid) {
          console.log('Found staff role, setting ID:', staffRole.roleid);
          setFormData(prev => ({ ...prev, roleid: staffRole.roleid }));
        } else {
          console.error('Staff role not found or invalid');
          toast.error('Staff role not found');
          navigate('/admin/employees');
        }
      } catch (error) {
        console.error('Error in fetchStaffRole:', error);
        toast.error('Failed to fetch staff role');
        navigate('/admin/employees');
      }
    };

    fetchStaffRole();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started', formData);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.roleid) {
      toast.error('Staff role not configured');
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create the account with staff role
      const accountData: AccountRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayname: formData.displayname,
        phonenumber: formData.phonenumber,
        address: formData.address,
        dateofbirth: formData.dateofbirth,
        preferredlanguage: formData.preferredlanguage,
        avatar: formData.avatar,
        gender: formData.gender,
        identityCard: formData.identityCard,
        roleid: formData.roleid
      };

      console.log('Sending account creation request:', accountData);
      const accountResponse = await userService.create(accountData);
      console.log('Account creation response:', accountResponse);

      if (!accountResponse.data) {
        throw new Error('No data received from account creation');
      }

      if (accountResponse.data?.data) {
        // Then create the staff record
        const staffData: StaffRequest = {
          position: formData.position,
          hiredate: formData.hiredate,
          salary: formData.salary
        };

        console.log('Sending staff creation request:', staffData);
        const staffResponse = await staffService.create(staffData);
        console.log('Staff creation response:', staffResponse);

        if (!staffResponse.data) {
          throw new Error('No data received from staff creation');
        }

        if (staffResponse.data?.data) {
          toast.success('Employee created successfully');
          navigate('/admin/employees');
        } else {
          throw new Error('Failed to create staff record');
        }
      } else {
        throw new Error('Failed to create account');
      }
    } catch (error: any) {
      console.error('Detailed error:', {
        error,
        response: error.response,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to create employee';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'salary' ? Number(value) : value 
    }));
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
        <div className="max-w-4xl bg-secondary-800 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white border-b border-secondary-700 pb-2">Account Information</h2>
                
                <Input
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Username"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />

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

                <Input
                  label="Display Name"
                  id="displayname"
                  name="displayname"
                  value={formData.displayname}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white border-b border-secondary-700 pb-2">Personal Information</h2>

                <Input
                  label="Phone Number"
                  id="phonenumber"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Identity Card"
                  id="identityCard"
                  name="identityCard"
                  value={formData.identityCard}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <Input
                  label="Date of Birth"
                  id="dateofbirth"
                  name="dateofbirth"
                  type="date"
                  value={formData.dateofbirth}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Address"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Preferred Language
                  </label>
                  <select
                    name="preferredlanguage"
                    value={formData.preferredlanguage}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="vi">Vietnamese</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Employment Information */}
              <div className="space-y-6 md:col-span-2">
                <h2 className="text-lg font-semibold text-white border-b border-secondary-700 pb-2">Employment Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Position"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Hire Date"
                    id="hiredate"
                    name="hiredate"
                    type="date"
                    value={formData.hiredate}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Salary"
                    id="salary"
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