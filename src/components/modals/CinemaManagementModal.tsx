import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Cinema } from '../../types/cinema';

interface CinemaManagementModalProps {
  cinema?: Cinema;
  locationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cinemaData: Partial<Cinema>) => void;
}

const CinemaManagementModal: React.FC<CinemaManagementModalProps> = ({
  cinema,
  locationId,
  isOpen,
  onClose,
  onSave,
}) => {
  const initialFormState = {
    name: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'maintenance' | 'closed',
    manager: '',
    facilities: [] as string[],
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (cinema) {
      setFormData({
        name: cinema.name,
        address: cinema.address,
        city: cinema.city,
        phone: cinema.phone,
        email: cinema.email,
        status: cinema.status,
        manager: cinema.manager,
        facilities: cinema.facilities,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [cinema, isOpen]); // Add isOpen to dependencies to reset form when modal opens

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Remove locationId from being passed directly
    const cinemaData: Partial<Cinema> = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      phone: formData.phone,
      email: formData.email,
      status: formData.status,
      manager: formData.manager,
      facilities: formData.facilities,
    };
    onSave(cinemaData);
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
            className="bg-secondary-900 rounded-xl w-full max-w-2xl p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {cinema ? 'Edit Cinema' : 'Add New Cinema'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary-800 rounded-lg"
              >
                <X className="w-5 h-5 text-secondary-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-secondary-300 mb-2">
                    Cinema Name
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
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-secondary-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-secondary-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-secondary-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-secondary-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Cinema['status'] })}
                    className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-secondary-300 mb-2">
                    Manager
                  </label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-secondary-300 mb-2">
                  Facilities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.facilities.join(', ')}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value.split(',').map(f => f.trim()) })}
                  className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                />
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
                  {cinema ? 'Save Changes' : 'Add Cinema'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CinemaManagementModal;