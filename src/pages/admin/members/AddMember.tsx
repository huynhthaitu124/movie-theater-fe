import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { memberService } from '@/services/modules/member.service';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import AdminLayout from '@/components/layout/AdminLayout';
import { tr } from 'date-fns/locale';

const AddMember: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    gender: '',
    memberShipLevel: 'BASIC', // Default value
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await memberService.create(formData);
      if (response.data.isActive === true) {
        toast.success('Member added successfully');
        navigate('/admin/members');
      } else {
        toast.error(response.message || 'Failed to add member');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add member';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/members')}
            className="flex items-center text-secondary-300 hover:text-white"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Members
          </Button>
          <h1 className="text-2xl font-bold text-white">Add New Member</h1>
        </div>

        <div className="max-w-2xl mx-auto bg-secondary-800 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Display Name"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
            />

            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
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

            <div className="space-y-4">
              <label className="block text-sm font-medium text-white">
                Gender
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) => handleChange(e as any)}
                  className="mt-1 block w-full rounded-md bg-secondary-700 border-secondary-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-white">
                Membership Level
                <select
                  name="memberShipLevel"
                  value={formData.memberShipLevel}
                  onChange={(e) => handleChange(e as any)}
                  className="mt-1 block w-full rounded-md bg-secondary-700 border-secondary-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="BASIC">Basic</option>
                  <option value="SILVER">Silver</option>
                  <option value="GOLD">Gold</option>
                  <option value="PLATINUM">Platinum</option>
                </select>
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/admin/members')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddMember;
