import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

const mockEmployees = [
  {
    id: '1',
    imageUrl: '',
    account: 'emp1',
    fullName: 'John Doe',
    dateOfBirth: '1990-01-01',
    sex: 'male' as const,
    email: 'john@example.com',
    identityCard: '123456789',
    phoneNumber: '1234567890',
    address: '123 Street'
  }
];

interface EmployeeFormData {
  image: File | null;
  imageUrl: string;
  account: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  dateOfBirth: string;
  sex: 'male' | 'female' | 'other';
  email: string;
  identityCard: string;
  phoneNumber: string;
  address: string;
}

const EditEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<EmployeeFormData>({
    image: null,
    imageUrl: '',
    account: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    sex: 'male',
    email: '',
    identityCard: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        // TODO: Replace with actual API call
        const employee = mockEmployees.find(emp => emp.id === id);
        if (employee) {
          setFormData({
            ...formData,
            ...employee,
            password: '',
            confirmPassword: '',
          });
          setImagePreview(employee.imageUrl);
        }
      } catch (error) {
        setError('Failed to fetch employee data');
      }
    };

    fetchEmployee();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
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
    if (!formData.fullName || !formData.email || !formData.identityCard || 
        !formData.phoneNumber || !formData.address) {
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
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/admin/employees', { 
        state: { message: 'Employee updated successfully' } 
      });
    } catch (error) {
      setError('Failed to update employee');
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
          <div className="bg-secondary-800 rounded-lg p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Profile Image
              </label>
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary-700">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-secondary-400">
                      <Upload size={24} />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer px-4 py-2 border border-secondary-600 rounded-lg text-secondary-300 hover:border-primary-500 hover:text-primary-500"
                >
                  Change Image
                </label>
              </div>
            </div>

            <Input
              label="Account"
              name="account"
              value={formData.account}
              disabled
              className="opacity-50"
            />

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

            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Sex
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
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
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
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