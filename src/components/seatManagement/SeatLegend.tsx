import React from 'react';
import { motion } from 'framer-motion';
import { getSeatColor, getSeatTypeIcon } from '../../utils/seatUtils';
import { MousePointer2, MousePointerClick } from 'lucide-react';

const SeatLegend: React.FC = () => {
  const legendItems = [
    { type: 'standard' as const, status: 'available' as const, label: 'Standard Available' },
    { type: 'vip' as const, status: 'available' as const, label: 'VIP Available' },
    { type: 'couple' as const, status: 'available' as const, label: 'Couple Available' },
    { type: 'standard' as const, status: 'maintenance' as const, label: 'Maintenance' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-secondary-800/30 backdrop-blur-sm rounded-2xl p-6 border border-secondary-700/50 space-y-6"
    >
      {/* Seat Types and Statuses */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Seat Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {legendItems.map((item, index) => (
            <motion.div
              key={`${item.type}-${item.status}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs relative ${getSeatColor(item.type, item.status)}`}>
                <span className="absolute -top-1 -right-1 text-xs">
                  {getSeatTypeIcon(item.type)}
                </span>
                1
              </div>
              <span className="text-sm text-secondary-300">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Usage Instructions */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Usage Guide</h3>
        <div className="grid gap-3">
          <div className="flex items-start gap-3">
            <MousePointer2 className="w-5 h-5 text-primary-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-white">Single Click</p>
              <p className="text-sm text-secondary-400">
                Select seats to change their type or status. Selected seats will be highlighted.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MousePointerClick className="w-5 h-5 text-primary-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-white">Double Click</p>
              <p className="text-sm text-secondary-400">
                Quick change seat type while keeping its current status.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-secondary-700/20 p-3 rounded-xl">
            <div className="w-5 h-5 flex items-center justify-center mt-1">
              <span className="text-primary-400 font-bold">ℹ</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-secondary-400">
                • Changing seat type: Only updates the type, status remains unchanged
              </p>
              <p className="text-sm text-secondary-400">
                • Changing seat status: Only updates the status, type remains unchanged
              </p>
              <p className="text-sm text-secondary-400">
                • Double-clicking: Quickly applies the selected type, keeps existing status
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SeatLegend;