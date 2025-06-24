import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, AlertCircle, CheckCircle2, Armchair } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SeatTypeList from './SeatTypeList';
import SeatTypeModal from './SeatTypeModal';
import { SeatType } from '../../types/seat';
import { seatTypeService } from '../../services/modules/seat.service';

const SeatTypeManagement: React.FC = () => {
    const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
    const [selectedSeatType, setSelectedSeatType] = useState<SeatType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [seatTypeToDelete, setSeatTypeToDelete] = useState<SeatType | null>(null);
    const navigate = useNavigate();

    const fetchSeatTypes = async () => {
        setLoading(true);
        setApiError(null);
        try {
            const res = await seatTypeService.getAll();
            setSeatTypes(res.data);
        } catch {
            setApiError('Failed to load seat types. Please try again.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSeatTypes();
    }, []);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleAdd = async (seatType: Omit<SeatType, 'seattypeid' | 'createdat' | 'updatedat'>) => {
        setLoading(true);
        setApiError(null);
        try {
            await seatTypeService.create(seatType);
            fetchSeatTypes();
            setIsModalOpen(false);
            showToast('Seat type created successfully!', 'success');
        } catch {
            setApiError('Failed to create seat type. Please try again.');
            showToast('Failed to create seat type', 'error');
        }
        setLoading(false);
    };

    const handleEdit = async (seatType: SeatType) => {
        setLoading(true);
        setApiError(null);
        try {
            await seatTypeService.update(seatType.seattypeid, seatType);
            fetchSeatTypes();
            setIsModalOpen(false);
            setSelectedSeatType(null);
            showToast('Seat type updated successfully!', 'success');
        } catch {
            setApiError('Failed to update seat type. Please try again.');
            showToast('Failed to update seat type', 'error');
        }
        setLoading(false);
    };

    const handleDelete = async (seattypeid: string) => {
        setLoading(true);
        setApiError(null);
        try {
            await seatTypeService.delete(seattypeid);
            fetchSeatTypes();
            showToast('Seat type deleted successfully!', 'success');
        } catch {
            setApiError('Failed to delete seat type. Please try again.');
            showToast('Failed to delete seat type', 'error');
        }
        setLoading(false);
    };

    const openModal = (seatType: SeatType | null) => {
        setSelectedSeatType(seatType);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSeatType(null);
    };

    const handleDeleteClick = (seatType: SeatType) => {
        setSeatTypeToDelete(seatType);
        setDeleteModalOpen(true);
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleBackClick = () => {
        navigate('/admin/cinemas');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 animate-slide-up">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBackClick}
                                className="group flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-600/30 hover:border-slate-500/50"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
                                <span className="font-medium">Back</span>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-500/20 rounded-xl border border-primary-400/30">
                                    <Armchair className="w-6 h-6 text-primary-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Seat Type Management</h1>
                                    <p className="text-slate-400 text-sm mt-1">Manage cinema seat types and pricing</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => openModal(null)}
                            disabled={loading}
                            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
                            <span>Add Seat Type</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Total Types</p>
                                    <p className="text-2xl font-bold text-white">{seatTypes.length}</p>
                                </div>
                                <div className="p-2 bg-primary-500/20 rounded-lg">
                                    <Armchair className="w-5 h-5 text-primary-400" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Active Types</p>
                                    <p className="text-2xl font-bold text-white">{seatTypes.filter(s => s.isactive).length}</p>
                                </div>
                                <div className="p-2 bg-success-500/20 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-success-400" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Avg Price</p>
                                    <p className="text-2xl font-bold text-white">
                                        {seatTypes.length > 0 
                                            ? Math.round(seatTypes.reduce((sum, s) => sum + s.price, 0) / seatTypes.length).toLocaleString('vi-VN')
                                            : '0'
                                        } ₫
                                    </p>
                                </div>
                                <div className="p-2 bg-warning-500/20 rounded-lg">
                                    <span className="text-warning-400 font-bold text-sm">₫</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Alert */}
                {apiError && (
                    <div className="mb-6 animate-bounce-in">
                        <div className="bg-error-500/10 border border-error-500/30 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-error-400 flex-shrink-0" />
                                <p className="text-error-300 font-medium">{apiError}</p>
                                <button
                                    onClick={() => setApiError(null)}
                                    className="ml-auto text-error-400 hover:text-error-300 transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="animate-fade-in">
                    <SeatTypeList
                        seatTypes={seatTypes}
                        loading={loading}
                        onDelete={handleDeleteClick}
                        onEdit={openModal}
                    />
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <SeatTypeModal
                        seatType={selectedSeatType}
                        onSubmit={selectedSeatType ? handleEdit : handleAdd}
                        onClose={closeModal}
                        loading={loading}
                    />
                )}

                {/* Toast Notification */}
                {toast && (
                    <div className="fixed top-6 right-6 z-50 animate-slide-up">
                        <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm border ${
                            toast.type === 'success' 
                                ? 'bg-success-500/90 border-success-400/50 text-white' 
                                : 'bg-error-500/90 border-error-400/50 text-white'
                        }`}>
                            {toast.type === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            )}
                            <span className="font-medium">{toast.message}</span>
                            <button
                                onClick={() => setToast(null)}
                                className="ml-2 hover:opacity-70 transition-opacity"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModalOpen && seatTypeToDelete && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-700/50 animate-scale-in">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-error-500/20 rounded-lg">
                                    <AlertCircle className="w-6 h-6 text-error-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Delete Seat Type</h2>
                            </div>
                            <p className="text-slate-300 mb-6 leading-relaxed">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-white bg-slate-700/50 px-2 py-1 rounded">
                                    {seatTypeToDelete.name}
                                </span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setDeleteModalOpen(false);
                                        setSeatTypeToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white font-medium transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        setDeleteModalOpen(false);
                                        await handleDelete(seatTypeToDelete.seattypeid);
                                        setSeatTypeToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeatTypeManagement;