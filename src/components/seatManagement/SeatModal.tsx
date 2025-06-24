import React, { useState, useEffect } from 'react';
import { X, MapPin, Hash, Type, ToggleLeft, ToggleRight, Loader2, Link } from 'lucide-react';
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
    const [seattypeid, setSeatTypeId] = useState(seat ? seat.seattypeid : seatTypes[0]?.seattypeid || '');
    const [number, setNumber] = useState(seat ? seat.number : '');
    const [row, setRow] = useState(seat ? seat.row : '');
    const [status, setStatus] = useState(seat ? seat.status : 'AVAILABLE');
    const [isactive, setIsActive] = useState(seat ? seat.isactive : true);
    const [islinked, setIsLinked] = useState(seat ? seat.islinked : false);
    const [linkedto, setLinkedTo] = useState(seat ? seat.linkedto || '' : '');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const statusOptions = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'BLOCKED'];

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!row.trim()) {
            setError('Row is required');
            return;
        }
        if (!number.trim()) {
            setError('Seat number is required');
            return;
        }
        if (islinked && !linkedto.trim()) {
            setError('Linked seat ID is required when seat is linked');
            return;
        }

        setSubmitting(true);
        try {
            // Find the seat type object by name
            
            const selectedType = seatTypes.find(type => type.name === seatTypeName);

            if (!selectedType) {
                setError('Invalid seat type selected');
                setSubmitting(false);
                return;
            }

            await onSubmit({
                
                seatid: seat ? seat.seatId : undefined,
                seattypeid: selectedType.seattypeid, // use the mapped ID
                seatTypeName,
                number: number.trim(),
                row: row.trim().toUpperCase(),
                status,
                isactive,
                islinked,
                linkedto: islinked ? linkedto.trim() : null,
            });
        } catch (err) {
            setError('Failed to save seat. Please try again.');
        }
        setSubmitting(false);
    };

    // When toggling linked, set linkedto to this seat's id if turning on
    const handleLinkedToggle = () => {
        setIsLinked((prev) => {
            const newValue = !prev;
            if (newValue && seat && seat.seatId) {
                setLinkedTo(seat.seatId); // Auto-fill with this seat's ID
            } else if (!newValue) {
                setLinkedTo('');
            }
            return newValue;
        });
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

                    {/* Row and Number */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                <MapPin size={16} />
                                Row
                            </label>
                            <input
                                type="text"
                                className="w-full bg-slate-900/50 border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 placeholder-slate-500 uppercase"
                                value={row}
                                onChange={e => setRow(e.target.value)}
                                placeholder="A"
                                maxLength={2}
                                required
                                disabled={submitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                <Hash size={16} />
                                Number
                            </label>
                            <input
                                type="text"
                                className="w-full bg-slate-900/50 border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 placeholder-slate-500"
                                value={number}
                                onChange={e => setNumber(e.target.value)}
                                placeholder="1"
                                required
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            Status
                        </label>
                        <select
                            className="w-full bg-slate-900/50 border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
                            value={status}
                            onChange={e => setStatus(e.target.value as any)}
                            disabled={submitting}
                        >
                            {statusOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    {/* Active Toggle */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            Active Status
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
                                    {isactive ? 'Seat is available for use' : 'Seat is disabled'}
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Linked Toggle */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Link size={16} />
                            Linked Seat
                        </label>
                        <button
                            type="button"
                            onClick={handleLinkedToggle}
                            disabled={submitting}
                            className={`flex items-center gap-3 w-full p-4 rounded-xl border transition-all duration-200 ${
                                islinked 
                                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' 
                                    : 'bg-slate-700/30 border-slate-600/50 text-slate-400'
                            }`}
                        >
                            {islinked ? (
                                <ToggleRight className="w-6 h-6 text-purple-400" />
                            ) : (
                                <ToggleLeft className="w-6 h-6 text-slate-500" />
                            )}
                            <div className="text-left">
                                <div className="font-medium">
                                    {islinked ? 'Linked' : 'Not Linked'}
                                </div>
                                <div className="text-xs opacity-75">
                                    {islinked ? 'This seat is linked to another' : 'Independent seat'}
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Linked To Field */}
                    {islinked && (
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                Linked To (Seat ID)
                            </label>
                            <input
                                type="text"
                                className="w-full bg-slate-900/50 border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 placeholder-slate-500"
                                value={linkedto}
                                onChange={e => setLinkedTo(e.target.value)}
                                placeholder="Enter seat ID to link to"
                                disabled={submitting}
                            />
                        </div>
                    )}

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