import React, { useState, useEffect } from 'react';
import { X, DollarSign, Type, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { SeatType } from '../../types/seat';

interface SeatTypeModalProps {
    seatType: SeatType | null;
    onSubmit: (seatType: any) => void;
    onClose: () => void;
    loading?: boolean;
}

const SeatTypeModal: React.FC<SeatTypeModalProps> = ({ seatType, onSubmit, onClose, loading = false }) => {
    const [name, setName] = useState(seatType ? seatType.name : '');
    const [price, setPrice] = useState(seatType ? seatType.price : 0);
    const [isactive, setIsActive] = useState(seatType ? seatType.isactive : true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Focus management for accessibility
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const formatPriceDisplay = (value: number) => {
        return value.toLocaleString('vi-VN') + ' ₫';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!name.trim()) {
            setError('Seat type name is required');
            return;
        }
        if (name.trim().length < 2) {
            setError('Seat type name must be at least 2 characters');
            return;
        }
        if (price <= 0) {
            setError('Price must be greater than 0');
            return;
        }
        if (price < 1000) {
            setError('Price must be at least 1,000 VND');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({
                ...(seatType ? { seattypeid: seatType.seattypeid } : {}),
                name: name.trim(),
                price,
                isactive,
            });
        } catch (err) {
            setError('Failed to save seat type. Please try again.');
        }
        setSubmitting(false);
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0;
        setPrice(value);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50 animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <h2 className="text-xl font-bold text-white">
                        {seatType ? 'Edit Seat Type' : 'Create New Seat Type'}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Type size={16} />
                            Seat Type Name
                        </label>
                        <input
                            type="text"
                            className="w-full bg-slate-900/50 border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 placeholder-slate-500"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g., Standard, VIP, Premium"
                            required
                            autoFocus
                            disabled={submitting}
                        />
                    </div>

                    {/* Price Field */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <DollarSign size={16} />
                            Price (VND)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full bg-slate-900/50 border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 placeholder-slate-500"
                                value={price || ''}
                                onChange={handlePriceChange}
                                placeholder="120000"
                                min={1000}
                                step={1000}
                                required
                                disabled={submitting}
                            />
                            {price > 0 && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                    {formatPriceDisplay(price)}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500">Minimum price: 1,000 VND</p>
                    </div>

                    {/* Status Toggle */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            Status
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsActive(!isactive)}
                            disabled={submitting}
                            className={`flex items-center gap-3 w-full p-4 rounded-xl border transition-all duration-200 ${
                                isactive 
                                    ? 'bg-success-500/10 border-success-500/30 text-success-300' 
                                    : 'bg-slate-700/30 border-slate-600/50 text-slate-400'
                            }`}
                        >
                            {isactive ? (
                                <ToggleRight className="w-6 h-6 text-success-400" />
                            ) : (
                                <ToggleLeft className="w-6 h-6 text-slate-500" />
                            )}
                            <div className="text-left">
                                <div className="font-medium">
                                    {isactive ? 'Active' : 'Inactive'}
                                </div>
                                <div className="text-xs opacity-75">
                                    {isactive ? 'Available for booking' : 'Not available for booking'}
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-error-500/10 border border-error-500/30 rounded-xl p-3 animate-bounce-in">
                            <p className="text-error-300 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white font-medium transition-all duration-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || loading}
                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{seatType ? 'Update' : 'Create'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SeatTypeModal;