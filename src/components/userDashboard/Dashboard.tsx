import React, { useState, useEffect } from 'react';
import { User, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileSection from '../userDashboard/ProfileSection';
import BookingHistory from '../userDashboard/BookingHistory';
import { userService } from '../../services/modules/user.service';
import authService from '../../services/modules/auth.service';
import { useAuth } from '../../contexts/AuthContext'; // adjust path as needed
import { transactionService } from '../../services/modules/transaction.service';

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
}

interface Transaction {
  transactionId: string;
  accountId: string;
  paymentMethod: string;
  gatewayId: string;
  transactionDate: string;
  paymentDate: string;
  paymentStatus: string;
  invoiceId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  price: number;
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth(); // currentUser should have accountId
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Get accountId from currentUser
      const accountId = currentUser?.accountid;
      if (accountId) {
        try {
          const res = await userService.getById(accountId);
          setUserProfile(res.data);
          console.log('User Profile.:', res.data);
        } catch (error) {
          setUserProfile(null);
        }
      }

      try {
        // Use the account-specific endpoint if available:
        const res = await transactionService.getByAccountId(currentUser.accountid);
        setTransactions(res.data || []);
      } catch (error) {
        setTransactions([]);
      }

      setLoading(false);
    };

    loadData();
  }, [currentUser]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'history', label: 'Booking History', icon: History }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Back to Home Button */}
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Back to Home
              </button>
            {/* <div>
              <h1 className="text-2xl font-bold text-white">User Profile</h1>
              <p className="text-gray-300">Manage your profile and bookings</p>
            </div> */}
            {/* <div className="flex items-center space-x-4">
              
              <div className="flex items-center space-x-2">
                <img 
                  src={userProfile?.avatar } 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-white">{userProfile?.fullName}</p>
                  <p className="text-sm text-gray-400">{userProfile?.email}</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-700">
              <ul className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-blue-900/50 text-blue-400 border-l-4 border-blue-400'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              userProfile ? (
                <ProfileSection 
                  userProfile={{
                    ...userProfile,
                    role: currentUser?.role,
                    roleName: currentUser?.role
                  }}
                  setUserProfile={setUserProfile}
                />
              ) : (
                <div className="text-center text-gray-400 py-12">
                  Profile not found. Please log in again.
                </div>
              )
            )}
            {activeTab === 'history' && (
              <BookingHistory transactions={transactions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;