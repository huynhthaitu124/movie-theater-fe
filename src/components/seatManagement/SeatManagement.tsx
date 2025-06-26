import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Settings, Users, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import SeatMap from './SeatMap';
import SeatModal from './SeatModal';
import BulkSeatModal from './BulkSeatModal';
import { Seat } from '../../types/seat';
import { Room } from '../../types/cinema';
import { seatService } from '../../services/modules/seat.service';
import { roomService } from '../../services/modules/room.service';
import { SeatType } from '../../types/seat';
import { seatTypeService } from '../../services/modules/seat.service';
import { update } from 'lodash';

const SeatManagement: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [seats, setSeats] = useState<Seat[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);

    // Fetch all rooms
    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await roomService.getAll();
            const transformedRooms = res.data.map(room => ({
                ...room,
                id: room.roomId,
                name: `Room ${room.roomnumber} - ${room.cinemaname}`
            }));
            setRooms(transformedRooms);

            // Find and set the selected room by URL id
            const foundRoom = transformedRooms.find(r => r.id === roomId);
            setSelectedRoom(foundRoom || null);
        } catch (error) {
            setApiError('Failed to load rooms');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all seats and filter by roomId
    const fetchSeats = async () => {
        setLoading(true);
        setApiError(null);
        try {
            const res = await seatService.getAll(); // Make sure this calls GET /api/Seat
            // Filter seats by roomId from URL
            console.log('Fetching seats for roomId:', res);
            const filteredSeats = (res as { data: Seat[] }).data.filter((seat: Seat) => seat.roomId === roomId);
            setSeats(filteredSeats);
        } catch (error) {
            setApiError('Failed to load seats');
        }
        setLoading(false);
    };

    // Fetch all seat types
    useEffect(() => {
        seatTypeService.getAll().then(res => setSeatTypes(res.data));
    }, []);

    useEffect(() => {
        fetchRooms();
    }, [roomId]);

    useEffect(() => {
        fetchSeats();
    }, [roomId]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleAddSeat = async (seatData: any) => {
        setLoading(true);
        try {
            await seatService.create({
                seattypeid: seatData.seattypeid, // get from modal
                roomid: selectedRoom!.id,
                number: seatData.number,
                row: seatData.row
            });
            fetchSeats();
            setIsModalOpen(false);
            showToast('Seat created successfully!', 'success');
        } catch (error) {
            console.log({
  seattypeid: seatData.seattypeid,
  roomid: selectedRoom!.id,
  number: seatData.number,
  row: seatData.row
});
            showToast('Failed to create seat', 'error');
        }
        setLoading(false);
    };

    const handleEditSeat = async (seatData: any) => {
    setLoading(true);
    try {
        if (seatData.delete) {
            await seatService.delete(seatData.seatid);
            fetchSeats();
            setIsModalOpen(false);
            setSelectedSeat(null);
            showToast('Seat deleted successfully!', 'success');
            setLoading(false);
            return;
        }
        const updatePayload: any = {
            SeatId: seatData.seatid,
            SeatTypeId: seatData.seattypeid,
            Number: seatData.number,
            Row: seatData.row,
            Status: seatData.status,
            IsActive: seatData.isactive,
            IsLinked: seatData.islinked,
        };
        // Only add LinkedTo if it's a valid GUID
        if (
            seatData.islinked &&
            seatData.linkedto &&
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(seatData.linkedto.trim())
        ) {
            updatePayload.LinkedTo = seatData.linkedto.trim();
        }
        await seatService.update(updatePayload);
        fetchSeats();
        setIsModalOpen(false);
        setSelectedSeat(null);
        showToast('Seat updated successfully!', 'success');
    } catch (error) {
        showToast('Failed to update seat', 'error');
    }
    setLoading(false);
};

    const handleDeleteSeat = async (seatId: string) => {
    setLoading(true);
    try {
        await seatService.delete(seatId);
        fetchSeats();
        showToast('Seat deleted successfully!', 'success');
    } catch (error) {
        showToast('Failed to delete seat', 'error');
    }
    setLoading(false);
};

    const handleBulkCreate = async (seatsData: any[]) => {
        setLoading(true);
        try {
            const seatsWithRoom = seatsData.map(seat => ({
                ...seat,
                roomId: selectedRoom!.id
            }));
            await seatService.createMultiple(seatsWithRoom);
            fetchSeats();
            setIsBulkModalOpen(false);
            showToast(`${seatsData.length} seats created successfully!`, 'success');
        } catch (error) {
            console.error('Error creating seats:', error);
            showToast('Failed to create seats', 'error');
        }
        setLoading(false);
    };

    const handleQuickCreateSeat = async (row: string, number: string) => {
        setLoading(true);
        try {
            // Use default seat type (first in list) and status
            const defaultType = seatTypes[0];
            await seatService.create({
                seattypeid: defaultType?.seattypeid,
                roomid: selectedRoom!.id,
                number,
                row
            });
            fetchSeats();
            showToast(`Seat ${row}${number} created!`, 'success');
        } catch (error) {
            showToast('Failed to create seat', 'error');
        }
        setLoading(false);
    };

    const handleBatchCreate = async (seatsToCreate: {row: string, number: string, seattypeid: string}[]) => {
        setLoading(true);
        try {
            const payload = seatsToCreate.map(({row, number, seattypeid}) => ({
                seattypeid,
                roomid: selectedRoom!.id,
                number,
                row
            }));
            for (const seat of payload) {
                await seatService.create(seat);
            }
            await fetchSeats();
            showToast(`${payload.length} seats created!`, 'success');
        } catch (error) {
            showToast('Failed to create seats', 'error');
        }
        setLoading(false);
    };

    const handleBatchDelete = async (seatIds: string[]) => {
        setLoading(true);
        try {
            for (const seatId of seatIds) {
                await seatService.delete(seatId);
            }
            await fetchSeats(); // Only refresh once
            showToast(`${seatIds.length} seats deleted!`, 'success');
        } catch (error) {
            showToast('Failed to delete seats', 'error');
        }
        setLoading(false);
    };

    const handleBatchUpdate = async (seats: Seat[]) => {
        setLoading(true);
        try {
            for (const seat of seats) {
                const updatePayload: any = {
                    SeatId: seat.seatId,
                    SeatTypeId: seat.seattypeid,
                    Number: seat.number,
                    Row: seat.row,
                    Status: seat.status,
                    IsActive: seat.isactive,
                    IsLinked: seat.islinked,
                };
                // Map linkedto to LinkedTo if present and valid
                if (
                    seat.islinked &&
                    seat.linkedto &&
                    /^[0-9a-fA-F\-]{36}$/.test(seat.linkedto)
                ) {
                    updatePayload.LinkedTo = seat.linkedto;
                }
                await seatService.update(updatePayload);
            }
            await fetchSeats();
            showToast('Seats updated!', 'success');
        } catch (error) {
            showToast('Failed to update seats', 'error');
        }
        setLoading(false);
    };

    const openModal = (seat: Seat | null) => {
        setSelectedSeat(seat);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSeat(null);
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

    // Stats calculation
    const getSeatStats = () => {
        const total = seats.length;
        const available = seats.filter(s => s.status === 'AVAILABLE' && s.isactive).length;
        const linked = seats.filter(s => s.islinked).length;
        const maintenance = seats.filter(s => s.status === 'MAINTENANCE' || !s.isactive).length;
        return { total, available, linked, maintenance };
    };

    const stats = getSeatStats();

    // Group rooms by cinema for better organization
    const roomsByCinema = rooms.reduce((acc, room) => {
        if (!acc[room.cinemaname]) {
            acc[room.cinemaname] = [];
        }
        acc[room.cinemaname].push(room);
        return acc;
    }, {} as Record<string, Room[]>);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 animate-slide-up">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
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
                                    <MapPin className="w-6 h-6 text-primary-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Seat Management</h1>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {selectedRoom ? `Managing seats for ${selectedRoom.name}` : 'Room not found'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* REMOVE THESE BUTTONS */}
                            {/* 
                            <button ...>Bulk Create</button>
                            <button ...>Add Seat</button>
                            */}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {selectedRoom && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium">Total Seats</p>
                                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                                    </div>
                                    <div className="p-2 bg-primary-500/20 rounded-lg">
                                        <Users className="w-5 h-5 text-primary-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium">Available</p>
                                        <p className="text-2xl font-bold text-white">{stats.available}</p>
                                    </div>
                                    <div className="p-2 bg-success-500/20 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5 text-success-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium">Linked Seats</p>
                                        <p className="text-2xl font-bold text-white">{stats.linked}</p>
                                    </div>
                                    <div className="p-2 bg-warning-500/20 rounded-lg">
                                        <span className="text-warning-400 font-bold text-sm">🔗</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium">Maintenance</p>
                                        <p className="text-2xl font-bold text-white">{stats.maintenance}</p>
                                    </div>
                                    <div className="p-2 bg-error-500/20 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-error-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
                {selectedRoom && (
                    <div className="animate-fade-in">
                        <SeatMap
                            seats={seats}
                            loading={loading}
                            onSeatClick={openModal}
                            onSeatDelete={handleDeleteSeat}
                            onSeatCreate={handleQuickCreateSeat}
                            onBatchCreate={async (seatsToCreate: { row: string; number: string; seattypeid?: string }[]) => {
                                // Add default seattypeid if missing (use first seatType as default)
                                const defaultTypeId = seatTypes[0]?.seattypeid || '';
                                const seatsWithType = seatsToCreate.map(seat => ({
                                    ...seat,
                                    seattypeid: seat.seattypeid ?? defaultTypeId
                                }));
                                await handleBatchCreate(seatsWithType);
                            }}
                            onBatchDelete={handleBatchDelete}
                            onBatchUpdate={handleBatchUpdate}
                            rowsCount={selectedRoom.rows ?? 10}
                            columnsCount={selectedRoom.columns ?? 12}
                            seatTypes={seatTypes} // <-- Add this
                        />
                    </div>
                )}

                {/* Modals */}
                {isModalOpen && (
                    <SeatModal
                        seat={selectedSeat}
                        seatTypes={seatTypes}
                        onSubmit={selectedSeat ? handleEditSeat : handleAddSeat}
                        onClose={closeModal}
                        loading={loading}
                    />
                )}

                {isBulkModalOpen && (
                    <BulkSeatModal
                        onSubmit={handleBulkCreate}
                        onClose={() => setIsBulkModalOpen(false)}
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
            </div>
        </div>
    );
};

export default SeatManagement;