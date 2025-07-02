import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { userService } from '../../../services/modules/user.service';
import { staffService } from '../../../services/modules/staff.service';
import { formatVNCurrency } from '../../../utils/formatCurrency';
// Removed UserRole import as it's no longer needed
import type { StaffRequest } from '../../../services/types/request.types';

interface EmployeeFormData {
  // Account fields
  // accountId: string;
  // username: string;
  // email: string;
  // password: string;
  // confirmPassword: string;
  // fullName: string;
  // phoneNumber: string;
  // address: string;
  // dateOfBirth: string;
  // image?: string;
  // sex: string;
  // identityCard: string;
  
  // Staff specific fields
  position: string;
  salary: number;
  hiredate: string;
}

const EditEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<EmployeeFormData>({
    position: '',
    salary: 0,
    hiredate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
  const fetchEmployee = async () => {
    try {
      setIsLoading(true);
      const staffResponse = await staffService.getAll();
      if (staffResponse.data && Array.isArray(staffResponse.data)) {
        const staff = staffResponse.data.find((s: any) => s.staffid === id);
        if (staff) {
          setFormData({
            position: staff.position || '',
            salary: staff.salary || 0,
            hiredate: staff.hireDate ? staff.hiredate.split('T')[0] : (staff.hiredate ? staff.hiredate.split('T')[0] : ''),
          });
        } else {
          toast.error('Employee not found');
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const staffData = {
        staffId: id,
        position: formData.position,
        hireDate: formData.hiredate,
        salary: Number(formData.salary),
        isActive: true,
        status: "ACTIVE",
        updateAt: new Date().toISOString()
      };

      console.log('Submitting staff data:', staffData); 
      await staffService.updateAdmin(staffData);

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
      <div className="max-w-2xl mx-auto px-4 py-8">
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
          {/* staffId as hidden input */}
          <input type="hidden" name="staffId" value={id} />

          <div className="bg-secondary-800 rounded-lg p-6 space-y-6">
            <Input
              label="Position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            />

            <Input
              label="Hire Date"
              type="date"
              name="joinDate"
              value={formData.hiredate}
              onChange={handleChange}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-300">
                Salary
              </label>
              <Input
                name="salary"
                type="number"
                min="0"
                step="100000"
                value={formData.salary}
                onChange={handleChange}
                required
              />
              {formData.salary > 0 && (
                <div className="text-sm text-secondary-400">
                  {formatVNCurrency(formData.salary)}
                </div>
              )}
            </div>

            {/* Optional: isActive and status, hidden if not needed */}
            <input type="hidden" name="isActive" value="true" />
            <input type="hidden" name="status" value="ACTIVE" />
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