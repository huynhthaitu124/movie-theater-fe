import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
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
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              className="relative bg-secondary-900 rounded-xl w-full max-w-md p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-error-500/10 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-error-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{title}</h2>
                  <p className="text-secondary-400 mt-1">{message}</p>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-secondary-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;