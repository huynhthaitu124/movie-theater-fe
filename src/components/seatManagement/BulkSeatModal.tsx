import React, { useState, useEffect } from 'react';
import { X, Grid, Plus, Trash2, Loader2 } from 'lucide-react';

interface BulkSeatModalProps {
    onSubmit: (seatsData: any[]) => void;
    onClose: () => void;
    loading?: boolean;
}

const BulkSeatModal: React.FC<BulkSeatModalProps> = ({ onSubmit, onClose, loading = false }) => {
    const [rows, setRows] = useState(['A']);
    const [seatsPerRow, setSeatsPerRow] = useState(10);
    const [seatTypeName, setSeatTypeName] = useState('Ghế Thường');
    const [startingNumber, setStartingNumber] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [previewSeats, setPreviewSeats] = useState<any[]>([]);

    const seatTypes = ['Ghế Thường', 'Ghế VIP', 'Ghế Đôi'];

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    useEffect(() => {
        generatePreview();
    }, [rows, seatsPerRow, seatTypeName, startingNumber]);

    const generatePreview = () => {
        const seats: any[] = [];
        rows.forEach(row => {
            for (let i = 0; i < seatsPerRow; i++) {
                seats.push({
                    row: row.trim().toUpperCase(),
                    number: (startingNumber + i).toString(),
                    seatTypeName,
                    status: 'AVAILABLE',
                    isactive: true,
                    islinked: false,
                    linkedto: null
                });
            }
        });
        setPreviewSeats(seats);
    };

    const addRow = () => {
        const lastRow = rows[rows.length - 1];
        const nextRow = String.fromCharCode(lastRow.charCodeAt(0) + 1);
        if (nextRow <= 'Z') {
            setRows([...rows, nextRow]);
        }
    };

    const removeRow = (index: number) => {
        if (rows.length > 1) {
            setRows(rows.filter((_, i) => i !== index));
        }
    };

    const updateRow = (index: number, value: string) => {
        const newRows = [...rows];
        newRows[index] = value;
        setRows(newRows);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (rows.length === 0) {
            setError('At least one row is required');
            return;
        }
        if (seatsPerRow <= 0) {
            setError('Seats per row must be greater than 0');
            return;
        }
        if (seatsPerRow > 50) {
            setError('Maximum 50 seats per row allowed');
            return;
        }

        // Check for duplicate rows
        const uniqueRows = new Set(rows.map(r => r.trim().toUpperCase()));
        if (uniqueRows.size !== rows.length) {
            setError('Duplicate rows are not allowed');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(previewSeats);
        } catch (err) {
            setError('Failed to create seats. Please try again.');
        }
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700/50 animate-scale-in max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50 sticky top-0 bg-slate-800 z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Grid size={20} />
                        Bulk Create Seats
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
                    {/* Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Seat Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Seat Type</label>
                            <select
                                className="w-full bg-slate-900/50 border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
                                value={seatTypeName}
                                onChange={e => setSeatTypeName(e.target.value)}
                                disabled={submitting}
                            >
                                {seatTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Seats Per Row */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Seats Per Row</label>
                            <input
                                type="number"
                                className="w-full bg-slate-900/50 border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
                                value={seatsPerRow}
                                onChange={e => setSeatsPerRow(parseInt(e.target.value) || 0)}
                                min={1}
                                max={50}
                                disabled={submitting}
                            />
                        </div>

                        {/* Starting Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Starting Number</label>
                            <input
                                type="number"
                                className="w-full bg-slate-900/50 border border-slate-600/50 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
                                value={startingNumber}
                                onChange={e => setStartingNumber(parseInt(e.target.value) || 1)}
                                min={1}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    {/* Rows Configuration */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-300">Rows</label>
                            <button
                                type="button"
                                onClick={addRow}
                                disabled={submitting || rows.length >= 26}
                                className="flex items-center gap-1 px-3 py-1.5 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-lg transition-all duration-200 text-sm disabled:opacity-50"
                            >
                                <Plus size={14} />
                                Add Row
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {rows.map((row, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-slate-900/50 border border-slate-600/50 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200 uppercase text-center"
                                        value={row}
                                        onChange={e => updateRow(index, e.target.value)}
                                        maxLength={2}
                                        disabled={submitting}
                                    />
                                    {rows.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            disabled={submitting}
                                            className="p-2 bg-error-500/20 hover:bg-error-500/30 text-error-400 rounded-lg transition-all duration-200 disabled:opacity-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Preview ({previewSeats.length} seats)</label>
                        <div className="bg-slate-900/50 border border-slate-600/50 rounded-xl p-4 max-h-40 overflow-y-auto">
                            <div className="space-y-2">
                                {rows.map(row => (
                                    <div key={row} className="flex items-center gap-2">
                                        <span className="w-6 text-slate-400 text-sm font-medium">{row.toUpperCase()}:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {Array.from({ length: seatsPerRow }, (_, i) => (
                                                <span key={i} className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                                                    {startingNumber + i}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                            disabled={submitting || loading || previewSeats.length === 0}
                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <span>Create {previewSeats.length} Seats</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkSeatModal;