import React from 'react';
import { X, Save, CalendarDays, Loader } from 'lucide-react';
import { Cinema } from '@/types/cinema';
import { WorkSchedule, WorkScheduleFormData, BulkScheduleFormData } from '@/types/workSchedule';

interface ScheduleModalProps {
  showModal: boolean;
  showBulkModal: boolean;
  editingSchedule: WorkSchedule | null;
  selectedCinema: Cinema | null;
  formData: WorkScheduleFormData;
  bulkFormData: BulkScheduleFormData;
  saving: boolean;
  setFormData: React.Dispatch<React.SetStateAction<WorkScheduleFormData>>;
  setBulkFormData: React.Dispatch<React.SetStateAction<BulkScheduleFormData>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowBulkModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleSaveSchedule: () => Promise<void>;
  handleSaveBulkSchedule: () => Promise<void>;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  showModal,
  showBulkModal,
  editingSchedule,
  selectedCinema,
  formData,
  bulkFormData,
  saving,
  setFormData,
  setBulkFormData,
  setShowModal,
  setShowBulkModal,
  handleSaveSchedule,
  handleSaveBulkSchedule
}) => {
  return (
    <>
      {/* Single Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-300"
                disabled={saving}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cinema
                </label>
                <input
                  type="text"
                  value={selectedCinema?.cinemaname || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Work Date
                </label>
                <input
                  type="date"
                  value={formData.workdate}
                  onChange={(e) => setFormData(prev => ({ ...prev, workdate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                disabled={saving}
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Schedule Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Create Multiple Schedules
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-300"
                disabled={saving}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cinema
                </label>
                <input
                  type="text"
                  value={selectedCinema?.cinemaname || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={bulkFormData.startDate}
                    onChange={(e) => setBulkFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={bulkFormData.endDate}
                    onChange={(e) => setBulkFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={bulkFormData.startTime}
                    onChange={(e) => setBulkFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={bulkFormData.endTime}
                    onChange={(e) => setBulkFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Days of Week
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(bulkFormData.selectedDays).map(([day, selected]) => (
                    <label key={day} className="flex items-center space-x-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) => setBulkFormData(prev => ({
                          ...prev,
                          selectedDays: {
                            ...prev.selectedDays,
                            [day]: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        disabled={saving}
                      />
                      <span className="capitalize">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gray-700 rounded-md p-3">
                <p className="text-sm text-gray-400">
                  This will create schedules for selected days between the start and end dates. 
                  Existing schedules for those dates will be skipped.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBulkSchedule}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center space-x-2"
                disabled={saving}
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <CalendarDays className="w-4 h-4" />
                )}
                <span>{saving ? 'Creating...' : 'Create Schedules'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleModal;
