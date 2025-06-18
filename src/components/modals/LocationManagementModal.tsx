import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Location } from '../../types/cinema';

interface LocationManagementModalProps {
  location?: Location;
  isOpen: boolean;
  onClose: () => void;
  onSave: (locationData: Partial<Location>) => void;
}

const LocationManagementModal: React.FC<LocationManagementModalProps> = ({
  location,
  isOpen,
  onClose,
  onSave,
}) => {
  const initialFormState = {
    name: '',
    region: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        region: location.region,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [location, isOpen]); // Add isOpen to dependencies

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-secondary-900 rounded-xl w-full max-w-md p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {location ? 'Edit Location' : 'Add New Location'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary-800 rounded-lg"
              >
                <X className="w-5 h-5 text-secondary-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-secondary-300 mb-2">
                  Location Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-secondary-300 mb-2">
                  Region
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                  required
                >
                  <option value="">Select Region</option>
                  <option value="North">North</option>
                  <option value="Central">Central</option>
                  <option value="South">South</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-secondary-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  {location ? 'Save Changes' : 'Add Location'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationManagementModal;