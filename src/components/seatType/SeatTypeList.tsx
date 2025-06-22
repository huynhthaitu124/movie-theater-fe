import React from 'react';
import { SeatType } from '../../types/seat';
import { Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';

interface SeatTypeListProps {
    seatTypes: SeatType[];
    loading?: boolean;
    onDelete: (seatType: SeatType) => void;
    onEdit: (seatType: SeatType) => void;
}

const formatPrice = (price: number) =>
    price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const SeatTypeList: React.FC<SeatTypeListProps> = ({ seatTypes, loading, onDelete, onEdit }) => {
    if (loading) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
                    <div>
                        <p className="text-slate-300 font-medium">Loading seat types...</p>
                        <p className="text-slate-500 text-sm mt-1">Please wait while we fetch the data</p>
                    </div>
                </div>
            </div>
        );
    }

    if (seatTypes.length === 0) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto">
                        <Eye className="w-8 h-8 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-slate-300 font-medium text-lg">No seat types found</p>
                        <p className="text-slate-500 text-sm mt-1">Create your first seat type to get started</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-700/50 border-b border-slate-600/50">
                            <th className="text-left py-4 px-6 text-slate-300 font-semibold text-sm uppercase tracking-wider">
                                Seat Type
                            </th>
                            <th className="text-left py-4 px-6 text-slate-300 font-semibold text-sm uppercase tracking-wider">
                                Price
                            </th>
                            <th className="text-left py-4 px-6 text-slate-300 font-semibold text-sm uppercase tracking-wider">
                                Status
                            </th>
                            <th className="text-center py-4 px-6 text-slate-300 font-semibold text-sm uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {seatTypes.map((seatType, idx) => (
                            <tr
                                key={seatType.seattypeid}
                                className="hover:bg-slate-700/30 transition-colors duration-200 group"
                            >
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                            <span className="text-primary-400 font-bold text-sm">
                                                {seatType.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{seatType.name}</p>
                                            <p className="text-slate-400 text-xs">
                                                ID: {seatType.seattypeid}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="text-white font-semibold">
                                        {formatPrice(seatType.price)}
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        {seatType.isactive ? (
                                            <>
                                                <Eye className="w-4 h-4 text-success-400" />
                                                <span className="px-3 py-1 bg-success-500/20 text-success-400 rounded-full text-xs font-semibold border border-success-500/30">
                                                    Active
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="w-4 h-4 text-slate-500" />
                                                <span className="px-3 py-1 bg-slate-600/20 text-slate-400 rounded-full text-xs font-semibold border border-slate-600/30">
                                                    Inactive
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(seatType)}
                                            className="p-2 bg-warning-500/20 hover:bg-warning-500/30 text-warning-400 hover:text-warning-300 rounded-lg transition-all duration-200 border border-warning-500/30 hover:border-warning-400/50 group/btn"
                                            title="Edit seat type"
                                        >
                                            <Pencil size={16} className="group-hover/btn:scale-110 transition-transform duration-200" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(seatType)}
                                            className="p-2 bg-error-500/20 hover:bg-error-500/30 text-error-400 hover:text-error-300 rounded-lg transition-all duration-200 border border-error-500/30 hover:border-error-400/50 group/btn"
                                            title="Delete seat type"
                                        >
                                            <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform duration-200" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
                {seatTypes.map((seatType) => (
                    <div
                        key={seatType.seattypeid}
                        className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4 space-y-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                    <span className="text-primary-400 font-bold">
                                        {seatType.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">{seatType.name}</h3>
                                    <p className="text-slate-400 text-sm">ID: {seatType.seattypeid}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {seatType.isactive ? (
                                    <>
                                        <Eye className="w-4 h-4 text-success-400" />
                                        <span className="px-2 py-1 bg-success-500/20 text-success-400 rounded-full text-xs font-semibold border border-success-500/30">
                                            Active
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="w-4 h-4 text-slate-500" />
                                        <span className="px-2 py-1 bg-slate-600/20 text-slate-400 rounded-full text-xs font-semibold border border-slate-600/30">
                                            Inactive
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Price</p>
                                <p className="text-white font-semibold text-lg">{formatPrice(seatType.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onEdit(seatType)}
                                    className="p-2.5 bg-warning-500/20 hover:bg-warning-500/30 text-warning-400 hover:text-warning-300 rounded-lg transition-all duration-200 border border-warning-500/30"
                                    title="Edit"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(seatType)}
                                    className="p-2.5 bg-error-500/20 hover:bg-error-500/30 text-error-400 hover:text-error-300 rounded-lg transition-all duration-200 border border-error-500/30"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeatTypeList;