import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2 } from 'lucide-react';
import { Room } from '../../types/cinema';
import { debounce } from 'lodash';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface RoomManagementModalProps {
  room?: Room;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomData: Partial<Room>) => void;
  onDelete?: (roomId: string) => void; // Add this prop
}

// Separate backdrop component
const Backdrop = React.memo(({ onClose }: { onClose: () => void }) => (
  <motion.div
    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  />
));

const RoomManagementModal: React.FC<RoomManagementModalProps> = React.memo(({
  room,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'standard' as 'standard' | 'vip' | 'imax' | '4dx',
    status: 'active' as 'active' | 'maintenance' | 'closed',
    capacity: 0,
    screenSize: '',
    audioSystem: '',
    features: [] as string[],
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Populate form with existing room data when editing
  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        type: room.type || 'standard',
        status: room.status || 'active',
        capacity: room.capacity || 0,
        screenSize: room.screenSize || '',
        audioSystem: room.audioSystem || '',
        features: room.features || [],
      });
    }
  }, [room]);

  // Memoized handlers
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  }, [formData, onSave]);

  const handleInputChange = useMemo(
    () =>
      debounce((field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }, 150),
    []
  );

  // Add delete handler
  const handleDelete = useCallback(() => {
    if (room && onDelete) {
      onDelete(room.id);
      onClose();
    }
  }, [room, onDelete, onClose]);

  // Modify the modal content to include delete button
  const modalContent = useMemo(() => (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-secondary-900 rounded-xl w-full max-w-2xl p-6 pointer-events-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary-800 rounded-lg transform transition-transform active:scale-95"
          >
            <X className="w-5 h-5 text-secondary-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-secondary-300 mb-2">
                Room Name
              </label>
              <input
                type="text"
                defaultValue={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-secondary-300 mb-2">
                Screen Size
              </label>
              <input
                type="text"
                value={formData.screenSize}
                onChange={(e) => setFormData({ ...formData, screenSize: e.target.value })}
                className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-secondary-300 mb-2">
                Audio System
              </label>
              <input
                type="text"
                value={formData.audioSystem}
                onChange={(e) => setFormData({ ...formData, audioSystem: e.target.value })}
                className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-secondary-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'standard' | 'vip' | 'imax' | '4dx' })}
                className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="standard">Standard</option>
                <option value="imax">IMAX</option>
                <option value="vip">VIP</option>
                <option value="4dx">4DX</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-secondary-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'maintenance' | 'closed' })}
                className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-secondary-300 mb-2">
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            {room && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-error-500/10 text-error-500 rounded-lg hover:bg-error-500/20 transform transition-transform active:scale-95 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Room
              </button>
            )}
            <div className="flex gap-4 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-secondary-400 hover:text-white transform transition-transform active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transform transition-transform active:scale-95"
              >
                {room ? 'Save Changes' : 'Create Room'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Room"
        message={`Are you sure you want to delete ${room?.name}? This action cannot be undone.`}
      />
    </motion.div>
  ), [formData, room, onClose, handleSubmit, handleInputChange, handleDelete, showDeleteModal]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop onClose={onClose} />
          {modalContent}
        </>
      )}
    </AnimatePresence>
  );
});

RoomManagementModal.displayName = 'RoomManagementModal';

export default RoomManagementModal;