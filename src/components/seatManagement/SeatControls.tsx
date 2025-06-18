import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings2, Tag, Users, AlertTriangle, Lock, 
  CheckCircle, XCircle, Wrench, Plus, Minus, Trash2
} from 'lucide-react';
import { Seat } from '../../types/cinema';
import { cn } from '../../utils/cn';

interface SeatControlsProps {
  selectedType: Seat['type'];
  selectedStatus: Seat['status'];
  onTypeChange: (type: Seat['type']) => void;
  onStatusChange: (status: Seat['status']) => void;
  selectedSeatsCount: number;
  onAddRow: () => void;
  onRemoveRow: () => void;
  onDeleteSelected: () => void;
  canRemoveRow: boolean;
  onAddColumn: () => void;
  onRemoveColumn: () => void;
  canRemoveColumn: boolean;
}

const SeatControls: React.FC<SeatControlsProps> = ({
  selectedType,
  selectedStatus,
  onTypeChange,
  onStatusChange,
  selectedSeatsCount,
  onAddRow,
  onRemoveRow,
  onDeleteSelected,
  canRemoveRow,
  onAddColumn,
  onRemoveColumn,
  canRemoveColumn,
}) => {
  const seatTypes = [
    { value: 'standard', label: 'Standard', icon: Settings2, color: 'bg-secondary-600' },
    { value: 'vip', label: 'VIP', icon: Tag, color: 'bg-warning-500' },
    { value: 'couple', label: 'Couple', icon: Users, color: 'bg-pink-500' }
  ] as const;

  const seatStatuses = [
    { 
      value: 'available', 
      label: 'Available', 
      icon: CheckCircle, 
      color: 'bg-success-500' 
    },
    { 
      value: 'maintenance', 
      label: 'Maintenance', 
      icon: Wrench, 
      color: 'bg-warning-500' 
    }
  ] as const;

  return (
    <div className="w-80 border-l border-secondary-800/50 bg-secondary-800/20 backdrop-blur-sm p-6 overflow-y-auto space-y-6">
      
      {/* Selection Info */}
      {selectedSeatsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4"
        >
          <p className="text-primary-400 font-medium text-sm">
            {selectedSeatsCount} seat{selectedSeatsCount !== 1 ? 's' : ''} selected
          </p>
        </motion.div>
      )}

      {/* Seat Types */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary-400" />
          Seat Type
        </h3>
        <div className="grid gap-2">
          {seatTypes.map(type => (
            <motion.button
              key={type.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTypeChange(type.value)}
              className={cn(
                "w-full px-4 py-3 rounded-xl border transition-all duration-200",
                "flex items-center gap-3 text-sm font-medium",
                selectedType === type.value 
                  ? "bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20" 
                  : "bg-secondary-700/50 border-secondary-600/50 text-secondary-300 hover:bg-secondary-600/50 hover:border-secondary-500/50"
              )}
            >
              <div className={cn("w-3 h-3 rounded-full", type.color)} />
              <type.icon className="w-4 h-4" />
              {type.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Seat Status */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary-400" />
          Seat Status
        </h3>
        <div className="grid gap-2">
          {seatStatuses.map(status => (
            <motion.button
              key={status.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStatusChange(status.value)}
              className={cn(
                "w-full px-4 py-3 rounded-xl border transition-all duration-200",
                "flex items-center gap-3 text-sm font-medium",
                selectedStatus === status.value 
                  ? "bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20" 
                  : "bg-secondary-700/50 border-secondary-600/50 text-secondary-300 hover:bg-secondary-600/50 hover:border-secondary-500/50"
              )}
            >
              <div className={cn("w-3 h-3 rounded-full", status.color)} />
              <status.icon className="w-4 h-4" />
              {status.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Layout Controls */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary-400" />
          Layout Controls
        </h3>
        <div className="grid gap-2">
          {/* Row Controls */}
          <div className="space-y-2">
            <p className="text-xs text-secondary-400">Row Controls</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddRow}
              className="w-full px-4 py-3 rounded-xl border border-success-500/50 
                       bg-success-500/10 text-success-400 hover:bg-success-500/20
                       transition-all duration-200 flex items-center gap-3 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </motion.button>
            
            <motion.button
              whileHover={{ scale: canRemoveRow ? 1.02 : 1 }}
              whileTap={{ scale: canRemoveRow ? 0.98 : 1 }}
              onClick={onRemoveRow}
              disabled={!canRemoveRow}
              className={cn(
                "w-full px-4 py-3 rounded-xl border transition-all duration-200",
                "flex items-center gap-3 text-sm font-medium",
                canRemoveRow
                  ? "border-warning-500/50 bg-warning-500/10 text-warning-400 hover:bg-warning-500/20"
                  : "border-secondary-600/30 bg-secondary-700/30 text-secondary-500 cursor-not-allowed"
              )}
            >
              <Minus className="w-4 h-4" />
              Remove Row
            </motion.button>
          </div>

          {/* Column Controls */}
          <div className="space-y-2 mt-4">
            <p className="text-xs text-secondary-400">Column Controls</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddColumn}
              className="w-full px-4 py-3 rounded-xl border border-success-500/50 
                       bg-success-500/10 text-success-400 hover:bg-success-500/20
                       transition-all duration-200 flex items-center gap-3 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Column
            </motion.button>
            
            <motion.button
              whileHover={{ scale: canRemoveColumn ? 1.02 : 1 }}
              whileTap={{ scale: canRemoveColumn ? 0.98 : 1 }}
              onClick={onRemoveColumn}
              disabled={!canRemoveColumn}
              className={cn(
                "w-full px-4 py-3 rounded-xl border transition-all duration-200",
                "flex items-center gap-3 text-sm font-medium",
                canRemoveColumn
                  ? "border-warning-500/50 bg-warning-500/10 text-warning-400 hover:bg-warning-500/20"
                  : "border-secondary-600/30 bg-secondary-700/30 text-secondary-500 cursor-not-allowed"
              )}
            >
              <Minus className="w-4 h-4" />
              Remove Column
            </motion.button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      {selectedSeatsCount > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-error-400" />
            Danger Zone
          </h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDeleteSelected}
            className="w-full px-4 py-3 rounded-xl border border-error-500/50 
                     bg-error-500/10 text-error-400 hover:bg-error-500/20
                     transition-all duration-200 flex items-center gap-3 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected ({selectedSeatsCount})
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default SeatControls;