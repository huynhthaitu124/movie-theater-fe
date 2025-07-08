import React, { useState, useEffect } from 'react';
import { Edit3, Save, X, User, Mail, Phone, MapPin, Calendar, CreditCard, Camera } from 'lucide-react';
import { userService } from '../../services/modules/user.service';
import { cloudinaryService } from '../../services/modules/cloudinary.service';
import { useAuth } from '../../contexts/AuthContext'; // adjust path as needed

interface UserProfile {
  accountId: string;
  avatar: string;
  displayName: string;
  account: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  identityCard: string;
  phoneNumber: string;
  address: string;
  roleName?: string;
  role?: string; // Adjusted to match your UserProfile interface
}

interface ProfileSectionProps {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ userProfile, setUserProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(userProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userProfile?.avatar || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const { updateCurrentUser } = useAuth(); // get from context

  // Add a ref for the file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarPreview(userProfile?.avatar || null);
  }, [userProfile]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(userProfile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(userProfile);
  };

  const handleSave = async () => {
    if (!editedProfile) return;
    setIsSaving(true);
    console.log('Saving profile:', editedProfile);

    // Map frontend fields to backend fields
    const updatePayload = {
      accountId: editedProfile.accountId,
      image: editedProfile.avatar,
      account: editedProfile.account,
      password: editedProfile.password,
      confirmPassword: editedProfile.confirmPassword,
      fullName: editedProfile.fullName || editedProfile.displayName, // use fullName if available, else displayName
      dateOfBirth: editedProfile.dateOfBirth,
      sex: editedProfile.gender, // gender -> sex
      email: editedProfile.email,
      identityCard: editedProfile.identityCard,
      phoneNumber: editedProfile.phoneNumber,
      address: editedProfile.address,
    };

    try {
      const res = await userService.update(editedProfile.accountId, updatePayload);

      // Map backend 'image' to frontend 'avatar'
      const mergedProfile = {
        ...res.data,
        avatar: res.data.avatar || res.data.image || editedProfile.avatar,
        role: res.data.role ?? userProfile?.role,
        roleName: res.data.roleName ?? userProfile?.roleName,
      };

      console.log('Profile updated successfully:', mergedProfile);

      setUserProfile(mergedProfile);
      setIsEditing(false);

      if (updateCurrentUser) {
        updateCurrentUser(mergedProfile);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('currentUser', JSON.stringify(mergedProfile));
      }
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (!editedProfile) return;
    
    setEditedProfile({
      ...editedProfile,
      [field]: value
    });
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);

      try {
        const uploadResult = await cloudinaryService.upload(file);
        setEditedProfile(prev =>
          prev ? { ...prev, avatar: uploadResult.url } : prev
        );
      } catch (error) {
        alert('Failed to upload avatar');
        setAvatarPreview(userProfile?.avatar || null);
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  if (!userProfile) return null;

  const displayProfile = isEditing ? editedProfile : userProfile;

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Profile Information</h2>
            <p className="text-gray-300">Manage your personal information and preferences</p>
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || isUploadingAvatar}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : isUploadingAvatar ? 'Uploading Avatar...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={avatarPreview || '/default-avatar.png'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-600"
                />
                {isEditing && (
                  <>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-500 transition-colors"
                      onClick={handleAvatarClick}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
              </div>
              <h3 className="mt-4 text-lg font-medium text-white">{displayProfile?.displayName}</h3>
              <p className="text-gray-400">{displayProfile?.email}</p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile?.displayName || ''}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400"
                  />
                ) : (
                  <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{displayProfile?.displayName}</p>
                )}
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile?.email || ''}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400"
                  />
                ) : (
                  <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{displayProfile?.email}</p>
                )}
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile?.phoneNumber || ''}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400"
                  />
                ) : (
                  <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{displayProfile?.phoneNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedProfile?.dateOfBirth || ''}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
                  />
                ) : (
                  <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{new Date(displayProfile?.dateOfBirth).toLocaleDateString()}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  Identity Card
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile?.identityCard || ''}
                    onChange={(e) => handleInputChange('identityCard', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400"
                  />
                ) : (
                  <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{displayProfile?.identityCard}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile?.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{displayProfile?.gender}</p>
                )}
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                </label>
                <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{displayProfile?.roleName || displayProfile?.role || 'Member'}</p>
              </div> */}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={editedProfile?.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-white placeholder-gray-400"
                  />
                ) : (
                  <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">{displayProfile?.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ProfileSection;