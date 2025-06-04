import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, AlertCircle, Monitor, Speaker } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';

interface Room {
  id: string;
  name: string;
  capacity: number;
  type: string;
  status: string;
  features: string[];
  screenSize: string;
  soundSystem: string;
}

// Mock data for rooms
const mockRooms: Room[] = [
  {
    id: 'R001',
    name: 'Hall 1',
    capacity: 120,
    type: 'standard',
    status: 'active',
    features: ['3D Compatible', 'Wheelchair Access'],
    screenSize: '12m x 5m',
    soundSystem: 'Dolby Digital 7.1'
  },
  {
    id: 'R002',
    name: 'VIP Hall',
    capacity: 80,
    type: 'vip',
    status: 'active',
    features: ['Reclining Seats', 'Premium Sound', '4K Projection'],
    screenSize: '15m x 6m',
    soundSystem: 'Dolby Atmos'
  },
  {
    id: 'R003',
    name: 'IMAX Theatre',
    capacity: 200,
    type: 'imax',
    status: 'active',
    features: ['IMAX Screen', 'Laser Projection', '3D Compatible'],
    screenSize: '22m x 16m',
    soundSystem: 'IMAX Enhanced Audio'
  }
];

const RoomList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const filteredRooms = mockRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement delete API call
      setShowDeleteModal(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'active':
        return 'text-success-500';
      case 'maintenance':
        return 'text-warning-500';
      case 'inactive':
        return 'text-accent-500';
      default:
        return 'text-secondary-500';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Room Management</h1>
          <Button
            onClick={() => navigate('/admin/rooms/add')}
            className="flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Room
          </Button>
        </div>

        <div className="flex items-center bg-secondary-800 rounded-lg px-4 py-2 w-full md:w-96">
          <Search size={20} className="text-secondary-400" />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-white ml-2 w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className="bg-secondary-800 rounded-lg overflow-hidden shadow-md">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{room.name}</h3>
                    <span className={`text-sm ${getStatusColor(room.status)} capitalize`}>
                      {room.status}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full text-sm">
                    {room.type.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 text-secondary-300">
                  <div className="flex items-center">
                    <Monitor size={18} className="mr-2" />
                    <span>Screen: {room.screenSize}</span>
                  </div>
                  <div className="flex items-center">
                    <Speaker size={18} className="mr-2" />
                    <span>{room.soundSystem}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">Capacity:</span>
                    <span className="ml-2">{room.capacity} seats</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-secondary-300 mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {room.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary-700 rounded-full text-xs text-secondary-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={() => navigate(`/admin/rooms/edit/${room.id}`)}
                    className="p-2 text-primary-500 hover:bg-secondary-700 rounded-full"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRoom(room.id);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-accent-500 hover:bg-secondary-700 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-secondary-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center text-accent-500 mb-4">
                <AlertCircle size={24} className="mr-2" />
                <h3 className="text-lg font-medium">Confirm Delete</h3>
              </div>
              <p className="text-secondary-300 mb-6">
                Are you sure you want to delete this room? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="accent"
                  onClick={() => selectedRoom && handleDelete(selectedRoom)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RoomList;