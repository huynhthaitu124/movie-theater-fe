import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Cinema } from '../../types/cinema';

interface CinemaCreateDto {
  cinemaname: string;
  address: string;
  city: string;
  phone: string;
  email: string | null;
  totalroom: number;
  opentime: string;
  closetime: string;
  status: Cinema['status'];
  isactive: boolean;
}

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
  // Update the initialFormState
  const initialFormState: CinemaCreateDto = {
    cinemaname: '',
    address: '',
    city: '',
    phone: '',
    email: null,
    totalroom: 0, // This will be updated automatically based on actual rooms
    opentime: '08:00:00',
    closetime: '23:00:00',
    status: 'ACTIVE',
    isactive: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (cinema) {
      setFormData({
        cinemaname: cinema.cinemaname,
        address: cinema.address,
        city: cinema.city,
        phone: cinema.phone,
        email: cinema.email,
        totalroom: cinema.totalroom,
        opentime: cinema.opentime,
        closetime: cinema.closetime,
        status: cinema.status,
        isactive: cinema.isactive,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [cinema, isOpen]); // Add isOpen to dependencies to reset form when modal opens

  // Update handleSubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData); // Pass the form data directly since it matches the API format
  };

  // Add overlay click handler
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              className="relative bg-secondary-900 rounded-xl w-full max-w-2xl p-6"
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
                  className="p-2 hover:bg-secondary-800 rounded-lg transition-colors"
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
                      value={formData.cinemaname} // Changed from name
                      onChange={(e) =>
                        setFormData({ ...formData, cinemaname: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as Cinema['status'],
                        })
                      }
                      className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  {/* <div>
                    <label className="block text-sm text-secondary-300 mb-2">
                      Total Room
                    </label>
                    <input
                      type="number"
                      value={formData.totalroom}
                      onChange={(e) =>
                        setFormData({ ...formData, totalroom: +e.target.value })
                      }
                      className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div> */}

                  <div>
                    <label className="block text-sm text-secondary-300 mb-2">
                      Open Time
                    </label>
                    <input
                      type="time"
                      value={formData.opentime.split(':').slice(0, 2).join(':')}
                      onChange={(e) =>
                        setFormData({ ...formData, opentime: e.target.value })
                      }
                      className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-300 mb-2">
                      Close Time
                    </label>
                    <input
                      type="time"
                      value={formData.closetime.split(':').slice(0, 2).join(':')}
                      onChange={(e) =>
                        setFormData({ ...formData, closetime: e.target.value })
                      }
                      className="w-full bg-secondary-800 border border-secondary-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center text-sm text-secondary-300 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.isactive}
                        onChange={(e) =>
                          setFormData({ ...formData, isactive: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2">Is Active</span>
                    </label>
                  </div>
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
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CinemaManagementModal;