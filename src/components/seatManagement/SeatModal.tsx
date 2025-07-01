import React, { useState } from 'react';
import { X, Type, Loader2 } from 'lucide-react';
import { Seat, SeatType } from '../../types/seat';

interface SeatModalProps {
    seat: Seat | null;
    seatTypes: SeatType[];
    onSubmit: (seatData: any) => void;
    onClose: () => void;
    loading?: boolean;
}

const SeatModal: React.FC<SeatModalProps> = ({ seat, seatTypes, onSubmit, onClose, loading = false }) => {
    const [seatTypeName, setSeatTypeName] = useState(seat ? seat.seatTypeName : seatTypes[0]?.name || '');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!seatTypeName) {
            setError('Seat type is required');
            return;
        }

        setSubmitting(true);
        try {
            const selectedType = seatTypes.find(type => type.name === seatTypeName);
            if (!selectedType) {
                setError('Invalid seat type selected');
                setSubmitting(false);
                return;
            }

            await onSubmit({
                seatid: seat?.seatId,
                row: seat?.row,
                number: seat?.number,
                roomid: seat?.roomId,
                seattypeid: selectedType.seattypeid,
                // add other required fields if needed
            });
        } catch (err) {
            setError('Failed to save seat. Please try again.');
        }
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50 animate-scale-in"
                 style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <h2 className="text-xl font-bold text-white">
                        {seat ? 'Edit Seat' : 'Create New Seat'}
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
                    {/* Read-only seat info */}
                    {seat && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Row</label>
                                <input
                                    className="w-full bg-slate-900/50 border border-slate-600/50 text-white px-3 py-2 rounded-xl"
                                    value={seat.row}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Number</label>
                                <input
                                    className="w-full bg-slate-900/50 border border-slate-600/50 text-white px-3 py-2 rounded-xl"
                                    value={seat.number}
                                    readOnly
                                />
                            </div>
                        </div>
                    )}

                    {/* Seat Type */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Type size={16} />
                            Seat Type
                        </label>
                        <select
                            className="w-full bg-slate-900/50 border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
                            value={seatTypeName}
                            onChange={e => setSeatTypeName(e.target.value)}
                            disabled={submitting}
                        >
                            {seatTypes.map(type => (
                                <option key={type.seattypeid} value={type.name}>{type.name}</option>
                            ))}
                        </select>
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
                                <span>{seat ? 'Update' : 'Create'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SeatModal;