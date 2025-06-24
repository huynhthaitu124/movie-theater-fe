import React from 'react';
import { Seat } from '../../types/seat';
import { Pencil, Trash2, Loader2, Link, AlertTriangle } from 'lucide-react';

interface SeatMapProps {
    seats: Seat[];
    loading?: boolean;
    onSeatClick: (seat: Seat) => void;
    onSeatDelete: (seatId: string) => void;
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, loading, onSeatClick, onSeatDelete }) => {
    if (loading) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                    <div>
                        <p className="text-slate-300 font-medium">Loading seat map...</p>
                        <p className="text-slate-500 text-sm mt-1">Please wait while we fetch the seat layout</p>
                    </div>
                </div>
            </div>
        );
    }

    if (seats.length === 0) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-slate-500 text-2xl">🎬</span>
                    </div>
                    <div>
                        <p className="text-slate-300 font-medium text-lg">No seats configured</p>
                        <p className="text-slate-500 text-sm mt-1">Add seats to this room to get started</p>
                    </div>
                </div>
            </div>
        );
    }

    // Group seats by row
    const seatsByRow = seats.reduce((acc, seat) => {
        if (!acc[seat.row]) {
            acc[seat.row] = [];
        }
        acc[seat.row].push(seat);
        return acc;
    }, {} as Record<string, Seat[]>);

    // Sort rows alphabetically and seats by number within each row
    const sortedRows = Object.keys(seatsByRow).sort();
    sortedRows.forEach(row => {
        seatsByRow[row].sort((a, b) => parseInt(a.number) - parseInt(b.number));
    });

    const getSeatColor = (seat: Seat) => {
        if (!seat.isactive || seat.status === 'MAINTENANCE') {
            return 'bg-error-500/20 border-error-500/50 text-error-400';
        }
        if (seat.status === 'OCCUPIED') {
            return 'bg-warning-500/20 border-warning-500/50 text-warning-400';
        }
        if (seat.islinked) {
            return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
        }
        
        switch (seat.seatTypeName) {
            case 'Ghế VIP':
                return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
            case 'Ghế Đôi':
                return 'bg-pink-500/20 border-pink-500/50 text-pink-400';
            default:
                return 'bg-primary-500/20 border-primary-500/50 text-primary-400';
        }
    };

    const getSeatIcon = (seat: Seat) => {
        if (!seat.isactive || seat.status === 'MAINTENANCE') {
            return <AlertTriangle size={16} />;
        }
        if (seat.islinked) {
            return <Link size={16} />;
        }
        return seat.row + seat.number;
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
            {/* Screen */}
            <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 p-6 text-center border-b border-slate-700/50">
                <div className="bg-slate-900/50 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-slate-300 font-medium">🎬 SCREEN</p>
                    <div className="w-full h-2 bg-gradient-to-r from-transparent via-slate-400 to-transparent rounded-full mt-2 opacity-50"></div>
                </div>
            </div>

            {/* Seat Map */}
            <div className="p-6">
                <div className="space-y-4">
                    {sortedRows.map((row) => (
                        <div key={row} className="flex items-center gap-4">
                            {/* Row Label */}
                            <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-300 font-bold text-sm flex-shrink-0">
                                {row}
                            </div>
                            
                            {/* Seats in Row */}
                            <div className="flex flex-wrap gap-2">
                                {seatsByRow[row].map((seat) => (
                                    <div key={seat.seatId} className="relative group">
                                        <button
                                            onClick={() => onSeatClick(seat)}
                                            className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg flex items-center justify-center text-xs font-bold ${getSeatColor(seat)}`}
                                            title={`${seat.seatTypeName} - ${seat.row}${seat.number} (${seat.status})`}
                                        >
                                            {getSeatIcon(seat)}
                                        </button>
                                        
                                        {/* Hover Actions */}
                                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSeatClick(seat);
                                                }}
                                                className="w-6 h-6 bg-warning-500 hover:bg-warning-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
                                                title="Edit seat"
                                            >
                                                <Pencil size={10} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSeatDelete(seat.seatId);
                                                }}
                                                className="w-6 h-6 bg-error-500 hover:bg-error-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
                                                title="Delete seat"
                                            >
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-8 pt-6 border-t border-slate-700/50">
                    <h3 className="text-slate-300 font-medium mb-4">Legend</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary-500/20 border-2 border-primary-500/50 rounded-lg"></div>
                            <span className="text-slate-400 text-sm">Standard</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-lg"></div>
                            <span className="text-slate-400 text-sm">VIP</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-pink-500/20 border-2 border-pink-500/50 rounded-lg flex items-center justify-center">
                                <Link size={12} className="text-pink-400" />
                            </div>
                            <span className="text-slate-400 text-sm">Linked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-error-500/20 border-2 border-error-500/50 rounded-lg flex items-center justify-center">
                                <AlertTriangle size={12} className="text-error-400" />
                            </div>
                            <span className="text-slate-400 text-sm">Maintenance</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatMap;