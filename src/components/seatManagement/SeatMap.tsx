import React, { useState } from 'react';
import { Seat } from '../../types/seat';
import { Pencil, Trash2, Loader2, Link, AlertTriangle } from 'lucide-react';
import { SeatType } from '../../types/seat';
import { seatService } from '../../services/modules/seat.service';
import toast from 'react-hot-toast';

interface SeatMapProps {
    seats: Seat[];
    loading?: boolean;
    onSeatClick: (seat: Seat) => void;
    onSeatDelete: (seatId: string) => void;
    onSeatCreate: (row: string, number: string) => void;
    onBatchCreate?: (seats: {row: string, number: string, seattypeid: string}[]) => Promise<void>;
    onBatchDelete?: (seatIds: string[]) => Promise<void>;
    onBatchUpdate?: (seats: Seat[]) => Promise<void>; // <-- Add this
    rowsCount?: number;      // <-- Add this
    columnsCount?: number;   // <-- Add this
    seatTypes?: SeatType[]; // Pass this from parent
}

const MAX_ROWS = 10; // You can adjust as needed
const MAX_COLS = 12;

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const SeatMap: React.FC<SeatMapProps> = ({
    seats,
    loading,
    onSeatClick,
    onSeatDelete,
    onSeatCreate,
    onBatchCreate,
    onBatchDelete,
    onBatchUpdate,
    rowsCount = 10,
    columnsCount = 12,
    seatTypes = [],
}) => {
    // Always in edit mode
    const editMode = true;

    // Drag state
    const [dragging, setDragging] = useState(false);
    const [startCell, setStartCell] = useState<{ row: string; number: string } | null>(null);
    const [endCell, setEndCell] = useState<{ row: string; number: string } | null>(null);
    const [dragAction, setDragAction] = useState<'create' | 'delete'>('create');
    const [processing, setProcessing] = useState(false);
    const [pendingBatch, setPendingBatch] = useState<{seats: {row: string, number: string}[]} | null>(null);
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [selectedTypeId, setSelectedTypeId] = useState<string>('');
    const [deleteMode, setDeleteMode] = useState(false);

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

    // Find all rows and columns in use
    const usedRows = Array.from(new Set(seats.map(s => s.row))).sort();
    const usedCols = Array.from(new Set(seats.map(s => s.number))).sort((a, b) => parseInt(a) - parseInt(b));

    // For edit mode, show a grid of all possible seats
    const rows = editMode ? alphabet.slice(0, rowsCount) : usedRows;
    const cols = editMode
        ? Array.from({ length: columnsCount }, (_, i) => (i + 1).toString())
        : usedCols;

    // Helper to find if a seat exists
    const findSeat = (row: string, number: string) =>
        seats.find(s => s.row === row && s.number === number);

    // Helper to get selected area
    const getSelectedCells = () => {
        if (!startCell || !endCell) return [];
        const rowStart = Math.min(alphabet.indexOf(startCell.row), alphabet.indexOf(endCell.row));
        const rowEnd = Math.max(alphabet.indexOf(startCell.row), alphabet.indexOf(endCell.row));
        const colStart = Math.min(Number(startCell.number), Number(endCell.number));
        const colEnd = Math.max(Number(startCell.number), Number(endCell.number));
        const cells = [];
        for (let r = rowStart; r <= rowEnd; r++) {
            for (let c = colStart; c <= colEnd; c++) {
                cells.push({ row: alphabet[r], number: c.toString() });
            }
        }
        return cells;
    };

    // Enhanced mouse up handler
    const handleMouseUp = async () => {
        if (editMode && dragging && startCell && endCell && !processing) {
            setProcessing(true);
            const selected = getSelectedCells();

            // --- LINK 2 EXISTING SEATS ---
            const existingSeats = selected
                .map(({row, number}) => findSeat(row, number))
                .filter(Boolean) as Seat[];

            // LINK
            if (existingSeats.length === 2 && dragAction === 'create') {
                const [seatA, seatB] = existingSeats;
                const doiType = seatTypes.find(t => t.name === 'Ghế Đôi');
                // If both seats are already linked to each other, UNLINK them
                if (
                    seatA.islinked && seatB.islinked &&
                    seatA.linkedto === seatB.seatId &&
                    seatB.linkedto === seatA.seatId
                ) {
                    try {
                        const standardType = seatTypes.find(t => t.name === 'Ghế Thường');
                        if (!standardType) throw new Error('Ghế Thường type not found');

                        await onBatchUpdate?.([
                            {
                                ...seatA,
                                seattypeid: standardType.seattypeid,
                                seatTypeName: standardType.name,
                                islinked: false,
                                // do not send linkedto
                            },
                            {
                                ...seatB,
                                seattypeid: standardType.seattypeid,
                                seatTypeName: standardType.name,
                                islinked: false,
                                // do not send linkedto
                            }
                        ]);
                        await seatService.unlinkSeats(seatA.seatId, seatB.seatId);
                    } catch (err) {
                        // handle error (show toast, etc.)
                    }
                    setProcessing(false);
                    setDragging(false);
                    setStartCell(null);
                    setEndCell(null);
                    return;
                }
                // Otherwise, LINK them as usual
                else if (doiType && onBatchUpdate) {
                    try {
                        await seatService.linkSeats(seatA.seatId, seatB.seatId);
                        await onBatchUpdate([
                            {
                                ...seatA,
                                seattypeid: doiType.seattypeid,
                                seatTypeName: doiType.name,
                                islinked: true,
                                linkedto: seatB.seatId,
                            },
                            {
                                ...seatB,
                                seattypeid: doiType.seattypeid,
                                seatTypeName: doiType.name,
                                islinked: true,
                                linkedto: seatA.seatId,
                            }
                        ]);
                    } catch (err) {
                        // handle error (show toast, etc.)
                    }
                    setProcessing(false);
                    setDragging(false);
                    setStartCell(null);
                    setEndCell(null);
                    return;
                }
            }
            // --- END NEW LOGIC ---

            if (dragAction === 'create') {
                const toCreate = selected.filter(({row, number}) => !findSeat(row, number));
                if (toCreate.length > 0 && onBatchCreate && selectedTypeId) {
                    await onBatchCreate(
                        toCreate.map(seat => ({
                            ...seat,
                            seattypeid: selectedTypeId
                        }))
                    );
                    setProcessing(false);
                    setDragging(false);
                    setStartCell(null);
                    setEndCell(null);
                    return;
                }
            }

            if (dragAction === 'delete') {
                const toDeleteSeats = selected
                    .map(({row, number}) => findSeat(row, number))
                    .filter(Boolean) as Seat[];

                if (toDeleteSeats.some(seat => seat.islinked)) {
                    toast.error("Can't delete linked seat");
                    setProcessing(false);
                    setDragging(false);
                    setStartCell(null);
                    setEndCell(null);
                    return;
                }

                const toDelete = toDeleteSeats.map(seat => seat.seatId);
                if (toDelete.length > 0 && onBatchDelete) {
                    await onBatchDelete(toDelete);
                } else {
                    for (const seatId of toDelete) {
                        await onSeatDelete(seatId);
                    }
                }
            }
            setProcessing(false);
        }
        setDragging(false);
        setStartCell(null);
        setEndCell(null);
    };

    // Handle batch create after seat type is chosen
    const handleBatchCreateWithType = async () => {
        if (pendingBatch && selectedTypeId && onBatchCreate) {
            await onBatchCreate(
                pendingBatch.seats.map(seat => ({
                    ...seat,
                    seattypeid: selectedTypeId
                }))
            );
            setPendingBatch(null);
            setShowTypeModal(false);
            setSelectedTypeId('');
        }
    };

    return (
        <>
            <div
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden"
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                    setDragging(false);
                    setStartCell(null);
                    setEndCell(null);
                }}
            >
                {/* Screen */}
                <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 p-6 text-center border-b border-slate-700/50">
                    <div className="bg-slate-900/50 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-slate-300 font-medium">🎬 SCREEN</p>
                        <div className="w-full h-2 bg-gradient-to-r from-transparent via-slate-400 to-transparent rounded-full mt-2 opacity-50"></div>
                    </div>
                </div>

                {/* Seat Map */}
                <div className="p-6 flex flex-col justify-center items-center min-h-[400px]">
                    {/* Seat Type Selector */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-slate-300 font-medium">Seat Type:</span>
                        <div className="flex gap-2">
                            {seatTypes.map(type => (
                                <button
                                    key={type.seattypeid}
                                    className={`px-4 py-2 rounded-lg border font-medium transition-all duration-200
                                        ${selectedTypeId === type.seattypeid && !deleteMode
                                            ? 'bg-primary-600 text-white border-primary-500'
                                            : 'bg-slate-700/30 text-slate-300 border-slate-600/50 hover:bg-primary-500/20'}
                                    `}
                                    onClick={() => {
                                        setSelectedTypeId(type.seattypeid);
                                        setDeleteMode(false);
                                    }}
                                    type="button"
                                >
                                    {type.name}
                                </button>
                            ))}
                            {/* Delete Mode Button */}
                            <button
                                className={`px-4 py-2 rounded-lg border font-medium transition-all duration-200 flex items-center gap-2
                                    ${deleteMode
                                        ? 'bg-error-600 text-white border-error-500'
                                        : 'bg-slate-700/30 text-error-400 border-error-500/50 hover:bg-error-500/20'}
                                `}
                                onClick={() => {
                                    setDeleteMode(!deleteMode);
                                    if (!deleteMode) setSelectedTypeId('');
                                }}
                                type="button"
                            >
                                <Trash2 size={16} />
                                Delete Mode
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 w-full">
                        {rows.map((row) => (
                            <div key={row} className="flex items-center gap-4 justify-center">
                                {/* Row Label */}
                                <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-300 font-bold text-sm flex-shrink-0">
                                    {row}
                                </div>
                                {/* Seats in Row */}
                                <div className="flex gap-2 justify-center">
                                    {cols.map((number) => {
                                        const seat = findSeat(row, number);
                                        // Highlight if in drag selection
                                        let isSelected = false;
                                        if (editMode && dragging && startCell && endCell) {
                                            const selected = getSelectedCells();
                                            isSelected = selected.some(cell => cell.row === row && cell.number === number);
                                        }
                                        // Determine highlight color
                                        let highlightClass = '';
                                        if (isSelected && editMode && dragging) {
                                            highlightClass =
                                                dragAction === 'delete'
                                                    ? 'ring-2 ring-error-400 ring-offset-2'
                                                    : 'ring-2 ring-primary-400 ring-offset-2';
                                        }
                                        return (
                                            <div key={number} className="relative group">
                                                <button
                                                    disabled={processing}
                                                    onMouseDown={e => {
                                                        if (editMode) {
                                                            setDragging(true);
                                                            setStartCell({ row, number });
                                                            setEndCell({ row, number });
                                                            setDragAction(deleteMode ? 'delete' : 'create');
                                                        }
                                                    }}
                                                    onMouseEnter={() => {
                                                        if (editMode && dragging) {
                                                            setEndCell({ row, number });
                                                        }
                                                    }}
                                                    onClick={e => {
                                                        if (editMode) {
                                                            e.preventDefault();
                                                            if (deleteMode && seat) {
                                                                if (seat.islinked) {
                                                                    return;
                                                                }
                                                                onSeatDelete(seat.seatId);
                                                            } else if (!deleteMode && !seat && selectedTypeId) {
                                                                onBatchCreate?.([{ row, number, seattypeid: selectedTypeId }]);
                                                            } else if (!deleteMode && seat) {
                                                                onSeatClick(seat);
                                                            }
                                                        }
                                                    }}
                                                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all duration-200
                                                        ${seat ? getSeatColor(seat) : 'bg-slate-700/30 border-slate-600/50 text-slate-500'}
                                                        ${editMode ? 'hover:scale-110 hover:shadow-lg' : ''}
                                                        ${highlightClass}
                                                    `}
                                                    title={seat ? `${seat.seatTypeName} - ${seat.row}${seat.number} (${seat.status})` : `Create seat ${row}${number}`}
                                                >
                                                    {seat ? getSeatIcon(seat) : '+'}
                                                </button>
                                                {/* Hover Actions */}
                                                {seat && (
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
                                                )}
                                            </div>
                                        );
                                    })}
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

            {/* Modal for seat type selection */}
            {showTypeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-xs border border-slate-700">
                        <h2 className="text-lg font-bold text-white mb-4">Select Seat Type</h2>
                        <select
                            className="w-full mb-4 p-2 rounded bg-slate-900 text-white"
                            value={selectedTypeId}
                            onChange={e => setSelectedTypeId(e.target.value)}
                            disabled={processing} // Disable when processing
                        >
                            <option value="">-- Choose seat type --</option>
                            {seatTypes.map(type => (
                                <option key={type.seattypeid} value={type.seattypeid}>{type.name}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button
                                className="flex-1 px-4 py-2 rounded bg-primary-600 text-white font-medium"
                                disabled={!selectedTypeId || processing}
                                onClick={handleBatchCreateWithType}
                            >
                                Create Seats
                            </button>
                            <button
                                className="flex-1 px-4 py-2 rounded bg-slate-700 text-white font-medium"
                                onClick={() => {
                                    setShowTypeModal(false);
                                    setPendingBatch(null);
                                    setSelectedTypeId('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SeatMap;