import React, { useState, useEffect } from 'react';
import { User, Pencil } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/modules/user.service';

interface ProfileFormData {
  accountId: string;
  account: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  sex: string; // gender
  identityCard: string;
  phoneNumber: string;
  address: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  image?: string;
}

const EditProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    accountId: currentUser?.accountid || '',
    account: currentUser?.username || '', 
    fullName: currentUser?.displayname || '',
    email: currentUser?.email || '',
    dateOfBirth: currentUser?.dateofbirth || '',
    sex: currentUser?.gender || '',
    identityCard: currentUser?.identitycard || '',
    phoneNumber: currentUser?.phonenumber || '',
    address: currentUser?.address || '',
    image: currentUser?.image || '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        if (currentUser?.accountid) {
          const response = await userService.getById(currentUser.accountid);
          const userData = response.data;

          console.log('Fetched user data:', userData);
          
          setFormData({
            accountId: userData.accountid || '',
            account: userData.username || '',
            displayName: userData.displayName || '',
            email: userData.email || '',
            dateOfBirth: userData.dateOfBirth || '',
            sex: userData.gender || '',
            identityCard: userData.identityCard || '',
            phoneNumber: userData.phoneNumber || '',
            address: userData.address || '',
            avatar: userData.avatar || '',
          });
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Failed to fetch user data'
        });
      } finally {
        setIsLoading(false);
      }
    };

    let isSubscribed = true;
    fetchUserData();

    return () => {
      isSubscribed = false;
    };
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate password if changing
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          throw new Error('Current password is required to set a new password');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
      }

      // Call API to update profile
      if (currentUser?.accountid) {
        // Chỉ gửi những field đã được thay đổi
        const updatedFields: any = {};
        
        if (formData.fullName !== currentUser.displayName) {
          updatedFields.displayName = formData.displayName;
        }
        if (formData.dateOfBirth !== currentUser.dateofbirth) {
          updatedFields.dateofbirth = formData.dateOfBirth;
        }
        if (formData.sex !== currentUser.gender) {
          updatedFields.gender = formData.gender;
        }
        if (formData.identityCard !== currentUser.identitycard) {
          updatedFields.identitycard = formData.identityCard;
        }
        if (formData.phoneNumber !== currentUser.phonenumber) {
          updatedFields.phonenumber = formData.phoneNumber;
        }
        if (formData.address !== currentUser.address) {
          updatedFields.address = formData.address;
        }

        // Add password fields if changing password
        if (formData.newPassword) {
          updatedFields.currentPassword = formData.currentPassword;
          updatedFields.newPassword = formData.newPassword;
        }

        // Chỉ gọi API nếu có field được thay đổi
        if (Object.keys(updatedFields).length > 0) {
          const updateresposne = await userService.update(currentUser.accountid!, updatedFields);
          console.log('Profile updated successfully:', updateresposne);

          // Fetch updated user data
          const response = await userService.getById(currentUser.accountid);
          const userData = response.data;
          
          setFormData({
            accountId: userData.accountid || '',
            account: userData.username || '',
            fullName: userData.displayName || '',
            email: userData.email || '',
            dateOfBirth: userData.dateOfBirth || '',
            sex: userData.gender || '',
            identityCard: userData.identityCard || '',
            phoneNumber: userData.phoneNumber || '',
            address: userData.address || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          setMessage({ type: 'success', text: 'Profile updated successfully' });
        } else {
          setMessage({ type: 'info', text: 'No changes to update' });
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-secondary-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <User size={24} className="text-primary-500 mr-2" />
              <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-success-900 text-success-300' 
                  : message.type === 'error'
                  ? 'bg-accent-900 text-accent-300'
                  : 'bg-info-900 text-info-300'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - Personal Information */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
                  
                  <div className="relative">
                    <Input
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    <Pencil size={16} className="absolute right-3 top-9 text-primary-500" />
                  </div>

                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />

                  <div className="relative">
                    <Input
                      label="Date of Birth"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                    <Pencil size={16} className="absolute right-3 top-9 text-primary-500" />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Sex
                    </label>
                    <div className="relative">
                      <select
                        name="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      >
                        <option value="">Select Sex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <Pencil size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact Information */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
                  
                  <div className="relative">
                    <Input
                      label="Identity Card"
                      name="identityCard"
                      value={formData.identityCard}
                      onChange={handleChange}
                    />
                    <Pencil size={16} className="absolute right-3 top-9 text-primary-500" />
                  </div>

                  <div className="relative">
                    <Input
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                    <Pencil size={16} className="absolute right-3 top-9 text-primary-500" />
                  </div>

                  <div className="relative">
                    <Input
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                    <Pencil size={16} className="absolute right-3 top-9 text-primary-500" />
                  </div>
                </div>
              </div>

              {/* Bottom Section - Change Password */}
              <div className="border-t border-secondary-700 pt-6 mt-8">
                <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword || ''}
                      onChange={handleChange}
                    />

                    <Input
                      label="New Password"
                      type="password"
                      name="newPassword"
                      value={formData.newPassword || ''}
                      onChange={handleChange}
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;