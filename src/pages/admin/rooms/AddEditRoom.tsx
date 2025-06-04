import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Plus, X } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

interface RoomFormData {
  name: string;
  capacity: number;
  type: 'standard' | 'vip' | 'imax';
  status: 'active' | 'maintenance' | 'inactive';
  features: string[];
  screenSize: string;
  soundSystem: string;
}

// Mock data for testing
const mockRooms = [
  {
    id: '1',
    name: 'Room 1',
    capacity: 100,
    type: 'standard' as const,
    status: 'active' as const,
    features: ['3D', 'Surround Sound'],
    screenSize: '10m x 5m',
    soundSystem: 'Dolby Digital'
  }
];

const AddEditRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');

  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    capacity: 0,
    type: 'standard',
    status: 'active',
    features: [],
    screenSize: '',
    soundSystem: ''
  });

  useEffect(() => {
    if (id) {
      // Fetch room data for editing
      const fetchRoom = async () => {
        try {
          // TODO: Replace with actual API call
          const room = mockRooms.find(r => r.id === id);
          if (room) {
            setFormData({
              ...room
            });
          }
        } catch (error) {
          setError('Failed to fetch room data');
        }
      };
      fetchRoom();
    }
  }, [id]);

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.capacity || !formData.screenSize || !formData.soundSystem) {
        throw new Error('Please fill in all required fields');
      }

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      navigate('/admin/rooms', {
        state: { message: `Room ${id ? 'updated' : 'added'} successfully` }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save room');
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
          <h1 className="text-2xl font-bold text-white">
            {id ? 'Edit Room' : 'Add New Room'}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-accent-900 text-accent-300 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-secondary-800 rounded-lg p-6">
            <Input
              label="Room Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Capacity"
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Room Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    type: e.target.value as 'standard' | 'vip' | 'imax'
                  })}
                  className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  required
                >
                  <option value="standard">Standard</option>
                  <option value="vip">VIP</option>
                  <option value="imax">IMAX</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  status: e.target.value as 'active' | 'maintenance' | 'inactive'
                })}
                className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                required
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Screen Size"
                name="screenSize"
                value={formData.screenSize}
                onChange={(e) => setFormData({ ...formData, screenSize: e.target.value })}
                placeholder="e.g., 15m x 6m"
                required
              />

              <Input
                label="Sound System"
                name="soundSystem"
                value={formData.soundSystem}
                onChange={(e) => setFormData({ ...formData, soundSystem: e.target.value })}
                placeholder="e.g., Dolby Atmos"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary-300 mb-2">
                Features
              </label>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddFeature}
                  disabled={!newFeature.trim()}
                >
                  <Plus size={20} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-secondary-700 rounded-full text-sm text-secondary-300 flex items-center"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feature)}
                      className="ml-2 text-secondary-400 hover:text-accent-500"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
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
              {id ? 'Update Room' : 'Add Room'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddEditRoom;