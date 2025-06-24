import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2 } from 'lucide-react';
import { Room } from '../../types/cinema';
import { debounce } from 'lodash';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { toast } from 'react-toastify';

interface RoomManagementModalProps {
  room?: Room;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomData: Partial<Room>) => void;
  onDelete?: (roomId: string) => void;
  roomTypes: Array<{ roomtypeid: string; typename: string; }>;
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
  roomTypes,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    roomnumber: 0,
    capacity: 0,
    roomtypeid: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Populate form with existing room data when editing
  useEffect(() => {
    if (room) {
      setFormData({
        roomnumber: room.roomnumber,
        capacity: room.capacity,
        roomtypeid: room.roomtypeid,
      });
    } else {
      // Reset form for new room
      setFormData({
        roomnumber: 0,
        capacity: 0,
        roomtypeid: '',
      });
    }
  }, [room, isOpen]);

  // Memoized handlers
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Validate form data
    if (!formData.roomtypeid) {
      toast.error('Please select a room type');
      return;
    }
    if (formData.capacity <= 0) {
      toast.error('Capacity must be greater than 0');
      return;
    }
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
    if (room && room.id && onDelete) {
      onDelete(room.id);
      onClose();
    } else {
      toast.error('Room ID is missing. Cannot delete.');
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
                Room Number
              </label>
              <input
                type="number"
                value={formData.roomnumber}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  roomnumber: parseInt(e.target.value) 
                })}
                className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-secondary-300 mb-2">
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  capacity: parseInt(e.target.value) 
                })}
                className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-secondary-300 mb-2">
                Room Type
              </label>
              <select
                value={formData.roomtypeid}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  roomtypeid: e.target.value 
                })}
                className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                required
              >
                <option value="">Select Room Type</option>
                {roomTypes.map((type) => (
                  <option key={type.roomtypeid} value={type.roomtypeid}>
                    {type.typename}
                  </option>
                ))}
              </select>
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