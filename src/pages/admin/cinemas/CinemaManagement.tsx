import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Settings, MapPin, Edit, Trash, Grid as GridIcon, ChevronDown, ChevronRight, Settings2, Trash2, Calendar } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';

import {Cinema, Room, Location } from '../../../types/cinema';
import { LocalSeat, SeatType } from '../../../types/seat';
import { seatService, seatTypeService } from '../../../services/modules/seat.service';
import RoomManagementModal from '../../../components/modals/RoomManagementModal';
import LocationManagementModal from '../../../components/modals/LocationManagementModal';
import CinemaManagementModal from '../../../components/modals/CinemaManagementModal';
import DeleteConfirmationModal from '../../../components/modals/DeleteConfirmationModal';
import MovieCinemaManagementModal from '@/components/modals/MovieCinemaManagementModal';
import { cinemaService } from '../../../services/modules/cinema.service';
import { roomService } from '../../../services/modules/room.service';
import { roomTypeService } from '../../../services/modules/roomtype.service';
import { CinemaCreateDto, CinemaResponse, RoomCreateDto, RoomResponse, RoomTypeResponse } from '../../../services/types/request.types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // Already imported

interface RoomManagementModalProps {
  cinema: Cinema;
  onBack: () => void;
  onCinemaUpdate: () => Promise<void>;
}

const RoomManagement: React.FC<RoomManagementModalProps> = ({ cinema, onBack, onCinemaUpdate }) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [displayRooms, setDisplayRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-500/10 text-success-500';
      case 'maintenance':
        return 'bg-warning-500/10 text-warning-500';
      default:
        return 'bg-accent-500/10 text-accent-500';
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, [cinema.cinemaid]);

  const updateCinemaTotalRooms = async (cinemaId: string) => {
    try {
      // Get all rooms first
      const allRoomsRes = await roomService.getAll();
      // Filter rooms for this specific cinema
      const cinemaRooms = allRoomsRes.data.filter(room => room.cinemaname === cinema.cinemaname);
      // Calculate actual total rooms
      const actualTotalRooms = cinemaRooms.length;
      
      console.log(`Updating cinema ${cinemaId} total rooms to:`, actualTotalRooms);

      // Get current cinema data
      const currentCinema = await cinemaService.getAll().then(res => 
        res.data.find(cinema => cinema.cinemaid === cinemaId)
      );

      if (!currentCinema) {
        throw new Error('Cinema not found');
      }

      // Update with all required fields and the actual room count
      const updateData = {
        cinemaid: cinemaId,
        cinemaname: currentCinema.cinemaname,
        address: currentCinema.address,
        city: currentCinema.city,
        phone: currentCinema.phone,
        email: currentCinema.email,
        totalroom: actualTotalRooms, // Use the actual count
        opentime: currentCinema.opentime,
        closetime: currentCinema.closetime,
        status: currentCinema.status,
        isactive: currentCinema.isactive
      };

      await cinemaService.updateTotalRooms(cinemaId, actualTotalRooms);

    } catch (error) {
      console.error('Error updating cinema total rooms:', error);
      toast.error('Failed to update cinema room count');
    }
  };

  const fetchRooms = async () => {

    try {
      setLoading(true);
      const response = await roomService.getAll();
      // có response có data
      if (response.data) {
        // Filter rooms for current cinema and transform them
        // có resonse có data
        
        const cinemaRooms = response.data
          .filter(room => room.cinemaname === cinema.cinemaname)
          .map(transformRoomResponse);
        setDisplayRooms(cinemaRooms);
        
        // Update cinema total rooms based on actual count
        const actualTotalRooms = cinemaRooms.length;
        await cinemaService.updateTotalRooms(cinema.cinemaid, actualTotalRooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await roomTypeService.getAll();
      if (response.data) {
        setRoomTypes(response.data);
      }
    } catch (error) {
      console.error('Error fetching room types:', error);
      toast.error('Failed to fetch room types');
    }
  };

  const getRoomTypeName = (roomtypeid: string) => {
    const roomType = roomTypes.find(type => type.roomtypeid === roomtypeid);
    return roomType?.typename || 'Unknown Type';
  };

  const transformRoomResponse = (room: RoomResponse): Room => {
    return {
      id: room.roomId,
      roomtypeid: room.roomtypeid,
      cinemaname: cinema.cinemaname,
      roomnumber: room.roomnumber,
      name: `Room ${room.roomnumber}`,
      capacity: room.capacity,
      isactive: room.isactive,
      createdat: room.createdat,
      updatedat: room.updatedat,
      rows: room.rows,         // <-- Add this
      columns: room.columns,   // <-- Add this
    };
  };

  const handleSaveRoom = async (roomData: Partial<Room>) => {
    try {
      if (selectedRoom) {
        // Update existing room
        const updateDto: Partial<RoomCreateDto> = {
          roomtypeid: roomData.roomtypeid || selectedRoom.roomtypeid,
          roomnumber: roomData.roomnumber || selectedRoom.roomnumber,
          capacity: roomData.capacity,
          seatRows: roomData.rows ?? 0,      // <-- Ensure number, fallback to 0
          seatColumns: roomData.columns ?? 0 // <-- Ensure number, fallback to 0
        };

        await roomService.update(selectedRoom.id, updateDto);
        toast.success('Room updated successfully');
      } else {
        // Create new room
        if (!roomData.roomtypeid) {
          throw new Error('Room type is required');
        }

        const createDto: RoomCreateDto = {
          cinemaid: cinema.cinemaid,
          roomtypeid: roomData.roomtypeid,
          roomnumber: roomData.roomnumber || displayRooms.length + 1,
          capacity: roomData.capacity || 0,
          seatRows: roomData.rows ?? 0,      // <-- Add this
          seatColumns: roomData.columns ?? 0// <-- Add this
        };

        await roomService.create(createDto);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchRooms();
        toast.success('Room created successfully');
      }

      setIsRoomModalOpen(false);
      setSelectedRoom(null);
      if (onCinemaUpdate) await onCinemaUpdate();
    } catch (error: any) {
      console.error('Error saving room:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save room';
      toast.error(errorMessage);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await roomService.delete(roomId);
      const newTotalRooms = displayRooms.length - 1;
      await cinemaService.updateTotalRooms(cinema.cinemaid, newTotalRooms);
      toast.success('Room deleted successfully');
      await updateCinemaTotalRooms(cinema.cinemaid);
      fetchRooms();
      if (onCinemaUpdate) await onCinemaUpdate();
    } catch (error: any) {
      console.error('Error deleting room:', error);
      // If backend returns 500, assume it's because the room still contains seats
      if (error?.response?.status === 500) {
        console.log('Room still contains seats, cannot delete');
        toast.error('Room still contain seat');
      } else {
        toast.error('Failed to delete room');
      }
    }
  };

  const handleSaveSeats = async () => {
    try {
      // Handle seat updates here
      toast.success('Seat configuration saved successfully');
      setIsSeatModalOpen(false);
    } catch (error) {
      console.error('Error saving seat configuration:', error);
      toast.error('Failed to save seat configuration');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{cinema.cinemaname}</h2>
          <p className="text-sm text-secondary-400">{cinema.address}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setSelectedRoom(null);
              setIsRoomModalOpen(true);
            }}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Room
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm bg-secondary-700 text-white rounded-lg hover:bg-secondary-600"
          >
            Back to Cinemas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayRooms.map(room => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-secondary-800 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-full">
                {/* Basic Room Info */}
                <div className="mb-4">
                  <h3 className="font-medium text-white text-lg mb-1">Room {room.roomnumber}</h3>
                  <p className="text-sm text-secondary-400">
                    {cinema.cinemaname}
                  </p>
                </div>

                {/* Room Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1">Capacity</p>
                    <p className="text-white font-medium">{room.capacity} seats</p>
                  </div>
                  <div>
                    <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1">Room Type</p>
                    <p className="text-white font-medium">{getRoomTypeName(room.roomtypeid)}</p>
                  </div>
                  <div>
                    <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1">Status</p>
                    <span className={`
                      inline-block px-2 py-1 rounded-full text-xs font-medium
                      ${room.isactive ? 'bg-success-500/20 text-success-500' : 'bg-error-500/20 text-error-500'}
                    `}>
                      {room.isactive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1">Room Number</p>
                    <p className="text-white font-medium">#{room.roomnumber}</p>
                  </div>
                  <div>
                    <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1">Rows</p>
                    <p className="text-white font-medium">{room.rows ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1">Columns</p>
                    <p className="text-white font-medium">{room.columns ?? '-'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/admin/seats/${room.id}`)}
                  // onClick={() => {
                  //   setSelectedRoom(room);
                  //   setIsSeatModalOpen(true);
                  // }}
                  className="p-2 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg transition-colors"
                >
                  <GridIcon className="w-5 h-5 text-primary-500" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsRoomModalOpen(true);
                  }}
                  className="p-2 bg-secondary-700/50 hover:bg-secondary-700 rounded-lg transition-colors"
                >
                  <Settings2 className="w-5 h-5 text-secondary-400" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setRoomToDelete(room);
                    setShowDeleteRoomModal(true);
                  }}
                  className="p-2 bg-error-500/10 hover:bg-error-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-error-500" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add the delete confirmation modal */}
      <DeleteConfirmationModal
      
        isOpen={showDeleteRoomModal}
        onClose={() => {
          setShowDeleteRoomModal(false);
          setRoomToDelete(null);
        }}
        onConfirm={() => {
          if (roomToDelete) {
            handleDeleteRoom(roomToDelete.id);

            setShowDeleteRoomModal(false);
            setRoomToDelete(null);
          }
        }}
        title="Delete Room"
        message={`Are you sure you want to delete ${roomToDelete?.name}? This action cannot be undone.`}
      />

      <RoomManagementModal
        room={selectedRoom || undefined}
        roomTypes={roomTypes}
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSave={handleSaveRoom}
        onDelete={handleDeleteRoom} // Add this prop
      />

    </div>
  );
};


//====================================================
//====================================================
//====================================================
//====================================================
// Update the LocationDropdownProps interface
interface LocationDropdownProps {
  location: Location;
  cinemas: CinemaResponse[];
  onEditCinema: (cinema: Cinema) => void;
  onDeleteCinema: (locationId: string, cinemaId: string) => void;
  onManageRooms: (cinemaId: string) => void;
  onAddMovie: (cinema: Cinema) => void; // <-- Add this line
}

// Update the LocationDropdown component
const LocationDropdown: React.FC<LocationDropdownProps> = ({ 
  location, 
  cinemas,
  onEditCinema,
  onDeleteCinema,
  onManageRooms,
  onAddMovie
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Add this line

  return (
    <div className="mb-4">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-secondary-800/50 
                 rounded-lg hover:bg-secondary-700/50 transition-colors group"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <MapPin className="w-5 h-5 text-primary-500" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-white group-hover:text-primary-500 transition-colors">
              {location.name}
            </h3>
            <p className="text-sm text-secondary-400">
               • {location.cinemas.length} Cinemas
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-5 h-5 text-secondary-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 pl-6 space-y-4">
              {location.cinemas.map((cinema, index) => (
                <motion.div
                  key={cinema.cinemaid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-secondary-800/30 rounded-lg p-4 hover:bg-secondary-800/50 transition-colors relative"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 mr-4">
                      <h4 className="font-medium text-white mb-1 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary-500" />
                        {cinema.cinemaname}
                      </h4>
                      <p className="text-sm text-secondary-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {cinema.address}
                      </p>
                    </div>
                    <div className="flex gap-2 z-10">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onManageRooms(cinema.cinemaid)}
                        className="p-2 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg transition-colors group"
                      >
                        <GridIcon className="w-5 h-5 text-primary-500" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEditCinema(cinema)}
                        className="p-2 bg-secondary-700/50 hover:bg-secondary-700 rounded-lg transition-colors group"
                      >
                        <Settings2 className="w-5 h-5 text-secondary-400" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDeleteCinema(location.id, cinema.cinemaid)}
                        className="p-2 bg-error-500/10 hover:bg-error-500/20 rounded-lg transition-colors group"
                      >
                        <Trash2 className="w-5 h-5 text-error-500" />
                      </motion.button>
                      {/* Add this button for movie management */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAddMovie(cinema)}
                        className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors group"
                        title="Manage Movies"
                      >
                        🎬
                      </motion.button>
                      {/* === Add Showtime Management Button Here === */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/admin/showtimes?cinemaId=${cinema.cinemaid}`)}
                        className="p-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors group"
                        title="Showtime Management"
                      >
                        <Calendar className="w-5 h-5 text-purple-400" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Status and Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm mt-4 bg-secondary-900/30 p-3 rounded-lg">
                    <div>
                      <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1">Status</p>
                      <span className={`
                        inline-block px-2 py-1 rounded-full text-xs font-medium
                        ${cinema.status === 'ACTIVE' 
                          ? 'bg-success-500/20 text-success-500' 
                          : cinema.status === 'MAINTENANCE'
                          ? 'bg-warning-500/20 text-warning-500'
                          : 'bg-error-500/20 text-error-500'
                        }
                      `}>
                        {cinema.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1">Total Rooms</p>
                      <p className="text-white font-medium">{cinema.totalroom}</p>
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CinemaManagement: React.FC = () => {
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCinemaModalOpen, setIsCinemaModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'location' | 'cinema';
    locationId: string;
    cinemaId?: string;
  } | null>(null);
  const [cinemas, setCinemas] = useState<CinemaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Add this line
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [movieCinema, setMovieCinema] = useState<Cinema | null>(null);

  useEffect(() => {
    fetchCinemas();
  }, []);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const response = await cinemaService.getAll();
      if (response.data) {
        const transformedLocations = transformApiDataToLocations(response.data);
        setLocations(transformedLocations);
        setCinemas(response.data);
      }
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      toast.error('Failed to fetch cinemas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = (locationData: Partial<Location>) => {
    const newLocation: Location = {
      id: `loc-${Date.now()}`,
      cinemas: [],
      ...locationData,
    } as Location;
    
    setLocations([...locations, newLocation]);
    setIsLocationModalOpen(false);
  };

  const handleEditLocation = (locationData: Partial<Location>) => {
    setLocations(locations.map(loc => 
      loc.id === selectedLocation?.id 
        ? { ...loc, ...locationData }
        : loc
    ));
    setIsLocationModalOpen(false);
    setSelectedLocation(null);
  };

  const handleDeleteLocation = (locationId: string) => {
    setDeleteTarget({ type: 'location', locationId });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCinema = (locationId: string, cinemaId: string) => {
    setDeleteTarget({ 
      type: 'cinema', 
      locationId, 
      cinemaId 
    });
    setIsDeleteModalOpen(true);
  };

  const handleAddCinema = async (cinemaData: Partial<Cinema>) => {
    try {
      const createDto: CinemaCreateDto = {
        cinemaname: cinemaData.cinemaname || '',
        address: cinemaData.address || '',
        city: cinemaData.city || '',
        phone: cinemaData.phone || '',
        email: cinemaData.email || null,
        totalroom: 0,
        opentime: '08:00:00',
        closetime: '23:00:00',
        status: (cinemaData.status?.toUpperCase() as 'ACTIVE' | 'MAINTENANCE' | 'CLOSED') || 'ACTIVE',
        isactive: true
      };

      const response = await cinemaService.create(createDto);
      if (response.data) {
        toast.success('Cinema created successfully');
        fetchCinemas(); // This will refresh the locations state
      }
      setIsCinemaModalOpen(false);
    } catch (error) {
      console.error('Error creating cinema:', error);
      toast.error('Failed to create cinema');
    }
  };

  const handleEditCinema = async (cinemaData: Partial<CinemaCreateDto>) => {
    if (!selectedCinema) return;

    try {
      // Make sure status is uppercase
      const updateDto: Partial<CinemaCreateDto> = {
        cinemaname: cinemaData.cinemaname,
        address: cinemaData.address,
        city: cinemaData.city,
        phone: cinemaData.phone,
        email: cinemaData.email,
        totalroom: cinemaData.totalroom,
        opentime: cinemaData.opentime,
        closetime: cinemaData.closetime,
        status: cinemaData.status?.toUpperCase() as 'ACTIVE' | 'MAINTENANCE' | 'CLOSED', // Add toUpperCase()
        isactive: cinemaData.isactive
      };

      console.log('Updating cinema with data:', updateDto); // Add logging

      const response = await cinemaService.update(selectedCinema.cinemaid, updateDto);
      if (response.data) {
        toast.success('Cinema updated successfully');
        fetchCinemas();
        setIsCinemaModalOpen(false);
        setSelectedCinema(null);
      }
    } catch (error: any) {
      console.error('Error updating cinema:', error);
      toast.error(error.response?.data?.message || 'Failed to update cinema');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.cinemaId) return;

    try {
      const response = await cinemaService.delete(deleteTarget.cinemaId);
      
      if (response) {
        toast.success('Cinema deleted successfully');
        fetchCinemas(); // Refresh the list after deletion
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
      }
    } catch (error: any) {
      console.error('Error deleting cinema:', error);
      toast.error(error.response?.data?.message || 'Failed to delete cinema');
    }
  };

  const handleEditCinemaFromDropdown = (cinema: Cinema) => {
    setSelectedLocation(locations.find(loc => 
      loc.cinemas.some(c => c.cinemaid === cinema.cinemaid)
    ) || null);
    const apiCinema = cinemas.find(c => c.cinemaid === cinema.cinemaid);
    if (apiCinema) {
      setSelectedCinema(cinema);
      setIsCinemaModalOpen(true);
    }
  };

  const transformApiDataToLocations = (cinemas: CinemaResponse[]): Location[] => {
    // Group cinemas by city
    const groupedCinemas = cinemas.reduce((acc, cinema) => {
      const city = cinema.city;
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push({
        cinemaid: cinema.cinemaid,
        cinemaname: cinema.cinemaname,
        address: cinema.address,
        city: cinema.city,
        phone: cinema.phone,
        email: cinema.email || '',
        rooms: [], // You'll need to fetch rooms separately or handle this differently
        facilities: [], // Add if you have facilities data in the API
        status: cinema.status.toUpperCase() as 'ACTIVE' | 'MAINTENANCE' | 'CLOSED',
        manager: '', // Add if you have manager data in the API
        rating: 0, // Add if you have rating data in the API
        image: '', // Add if you have image data in the API
        totalroom: cinema.totalroom || 0,
        opentime: cinema.opentime || '08:00:00',
        closetime: cinema.closetime || '23:00:00',
        isactive: cinema.isactive || true
      });
      return acc;
    }, {} as Record<string, Cinema[]>);

    // Convert to Location array
    return Object.entries(groupedCinemas).map(([city, cinemas]) => ({
      id: `loc-${city.toLowerCase().replace(/\s+/g, '-')}`,
      name: city,
      region: '', // Add if you have region data
      cinemas: cinemas
    }));
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : (
          selectedCinemaId ? (
            <RoomManagement 
              cinema={locations.flatMap(l => l.cinemas).find(c => c.cinemaid === selectedCinemaId)!} 
              onBack={() => setSelectedCinemaId(null)} 
              onCinemaUpdate={fetchCinemas} // Pass this prop
            />
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Cinema Management</h1>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setIsCinemaModalOpen(true);
                    }}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center"
                  >
                    <Plus size={20} className="mr-2" />
                    Add Cinema
                  </button>
                  <button
                    onClick={() => navigate('/admin/seat-types')}
                    className="px-4 py-2 bg-secondary-700 text-white rounded-lg hover:bg-secondary-600 flex items-center"
                  >
                    Seat Type Management
                  </button>
                </div>
              </div>

              <div className="grid gap-6">
                {locations.map(location => (
                  <div key={location.id} className="relative">
                    <div className="flex gap-4">
                      {/* Move LocationDropdown to flex container */}
                      <div className="flex-1">
                        <LocationDropdown 
                          location={location}
                          cinemas={cinemas}
                          onEditCinema={handleEditCinemaFromDropdown}
                          onDeleteCinema={handleDeleteCinema}
                          onManageRooms={(cinemaId) => setSelectedCinemaId(cinemaId)}
                          onAddMovie={(cinema) => {
                            setMovieCinema(cinema);
                            setIsMovieModalOpen(true);
                          }}
                        />
                      </div>
                      
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        <LocationManagementModal
          location={selectedLocation || undefined}
          isOpen={isLocationModalOpen}
          onClose={() => {
            setIsLocationModalOpen(false);
            setSelectedLocation(null);
          }}
          onSave={selectedLocation ? handleEditLocation : handleAddLocation}
        />

        <CinemaManagementModal
          cinema={selectedCinema || undefined}
          locationId={selectedLocation?.id || ''}
          isOpen={isCinemaModalOpen}
          onClose={() => {
            setIsCinemaModalOpen(false);
            setSelectedCinema(null);
          }}
          onSave={(cinemaData: Partial<Cinema>) => {
            if (selectedCinema) {
              handleEditCinema({
                ...cinemaData,
                status: cinemaData.status?.toUpperCase() as "ACTIVE" | "MAINTENANCE" | "CLOSED"
              });
            } else {
              handleAddCinema(cinemaData);
            }
          }}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Cinema"
          message="Are you sure you want to delete this cinema? This action cannot be undone."
        />

        {isMovieModalOpen && movieCinema && (
          <MovieCinemaManagementModal
            cinema={movieCinema}
            isOpen={isMovieModalOpen}
            onClose={() => setIsMovieModalOpen(false)}
          />
        )}
      </div>
    </AdminLayout>
  );
};



export default CinemaManagement;