import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Settings, MapPin, Edit, Trash, Grid as GridIcon, ChevronDown, ChevronRight, Settings2, Trash2 } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { mockLocations} from '../../../data/mockCinemas';
import {Cinema, Room, Seat, Location } from '../../../types/cinema';
import RoomManagementModal from '../../../components/modals/RoomManagementModal';
import SeatManagementModal from '../../../components/modals/SeatManagementModal';
import LocationManagementModal from '../../../components/modals/LocationManagementModal';
import CinemaManagementModal from '../../../components/modals/CinemaManagementModal';
import DeleteConfirmationModal from '../../../components/modals/DeleteConfirmationModal';

interface RoomManagementModalProps {
  cinema: Cinema;
  onBack: () => void;
}




const RoomManagement: React.FC<RoomManagementModalProps> = ({ cinema, onBack }) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

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

  const handleSaveRoom = (roomData: Partial<Room>) => {
    // Handle room save logic here
    console.log('Saving room:', roomData);
    setIsRoomModalOpen(false);
    setSelectedRoom(null);
  };

  const handleSaveSeats = (seats: Seat[]) => {
    console.log('Saving seats:', seats);
    setIsSeatModalOpen(false);
    setSelectedRoom(null);
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      // Add your API call here
      // await api.delete(`/rooms/${roomId}`);
      
      // Update local state
      const updatedCinema = {
        ...cinema,
        rooms: cinema.rooms.filter(room => room.id !== roomId)
      };
      // You'll need to implement this update in the parent component
      console.log('Room deleted:', roomId);
      // toast.success('Room deleted successfully');
    } catch (error) {
      console.error('Error deleting room:', error);
      // toast.error('Failed to delete room');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{cinema.name}</h2>
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
        {cinema.rooms.map(room => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-secondary-800 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="w-full">
                <h3 className="font-medium text-white">{room.name}</h3>
                <p className="text-sm text-secondary-400 mt-1">
                  Capacity: {room.capacity} seats
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-block px-2 py-1 rounded-md text-xs ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                  <span className="text-xs text-secondary-400 bg-secondary-700/50 px-2 py-1 rounded-md">
                    {room.type.toUpperCase()}
                  </span>
                </div>
                
                {/* Additional Room Information */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-secondary-400">Room Id</p>
                    <p className="text-white">{room.id}</p>
                  </div>
                  <div>
                    <p className="text-secondary-400">Room Name</p>
                    <p className="text-white">{room.name}</p>
                  </div>
                  <div>
                    <p className="text-secondary-400">Screen Size</p>
                    <p className="text-white">{room.screenSize}</p>
                  </div>
                  <div>
                    <p className="text-secondary-400">Audio System</p>
                    <p className="text-white">{room.audioSystem}</p>
                  </div>
                </div>

                {/* Features/Amenities */}
                {room.features && room.features.length > 0 && (
                  <div className="mt-4">
                    <p className="text-secondary-400 text-sm mb-2">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {room.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-secondary-700/50 rounded-full text-xs text-secondary-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsSeatModalOpen(true);
                  }}
                  className="p-2 hover:bg-secondary-700 rounded-lg"
                  title="Manage Seats"
                >
                  <GridIcon size={20} className="text-secondary-400" />
                </button>
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsRoomModalOpen(true);
                  }}
                  className="p-2 hover:bg-secondary-700 rounded-lg"
                  title="Edit Room"
                >
                  <Settings size={20} className="text-secondary-400" />
                </button>
                <button
                  onClick={() => {
                    setRoomToDelete(room);
                    setShowDeleteRoomModal(true);
                  }}
                  className="p-2 hover:bg-error-500/20 rounded-lg"
                  title="Delete Room"
                >
                  <Trash2 size={20} className="text-error-500" />
                </button>
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
        isOpen={isRoomModalOpen}
        onClose={() => {
          setIsRoomModalOpen(false);
          setSelectedRoom(null);
        }}
        onSave={handleSaveRoom}
        onDelete={handleDeleteRoom} // Add this prop
      />

      {selectedRoom && (
        <SeatManagementModal
          room={selectedRoom}
          isOpen={isSeatModalOpen}
          onClose={() => setIsSeatModalOpen(false)}
          onSave={handleSaveSeats}
        />
      )}
    </div>
  );
};

// Update the LocationDropdownProps interface
interface LocationDropdownProps {
  location: Location;
  onEditCinema: (cinema: Cinema) => void;
  onDeleteCinema: (locationId: string, cinemaId: string) => void;
  onManageRooms: (cinemaId: string) => void;  // Add this prop
}

// Update the LocationDropdown component
const LocationDropdown: React.FC<LocationDropdownProps> = ({ 
  location, 
  onEditCinema,
  onDeleteCinema,
  onManageRooms 
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
              {location.region} Region • {location.cinemas.length} Cinemas
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
                  key={cinema.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-secondary-800/30 rounded-lg p-4 hover:bg-secondary-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white mb-1 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary-500" />
                        {cinema.name}
                      </h4>
                      <p className="text-sm text-secondary-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {cinema.address}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onManageRooms(cinema.id)}
                        className="p-2 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg 
                                 transition-colors group tooltip-trigger"
                        title="Manage Rooms"
                      >
                        <GridIcon className="w-5 h-5 text-primary-500" />
                        <span className="tooltip">Manage Rooms</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEditCinema(cinema)}
                        className="p-2 bg-secondary-700/50 hover:bg-secondary-700 rounded-lg 
                                 transition-colors group tooltip-trigger"
                        title="Edit Cinema"
                      >
                        <Settings2 className="w-5 h-5 text-secondary-400 group-hover:text-primary-500" />
                        <span className="tooltip">Edit Cinema</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDeleteCinema(location.id, cinema.id)}
                        className="p-2 bg-error-500/10 hover:bg-error-500/20 rounded-lg 
                                 transition-colors group tooltip-trigger"
                        title="Delete Cinema"
                      >
                        <Trash2 className="w-5 h-5 text-error-500" />
                        <span className="tooltip">Delete Cinema</span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-4 bg-secondary-900/30 p-3 rounded-lg">
                    <div>
                      <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1">Manager</p>
                      <p className="text-white font-medium">{cinema.manager}</p>
                    </div>
                    <div>
                      <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1">Status</p>
                      <span className={`
                        inline-block px-2 py-1 rounded-full text-xs font-medium
                        ${cinema.status === 'active' 
                          ? 'bg-success-500/20 text-success-500' 
                          : cinema.status === 'maintenance'
                          ? 'bg-warning-500/20 text-warning-500'
                          : 'bg-error-500/20 text-error-500'
                        }
                      `}>
                        {cinema.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1">Contact</p>
                      <p className="text-white font-medium">{cinema.phone}</p>
                    </div>
                    <div>
                      <p className="text-secondary-400 text-xs uppercase tracking-wider mb-1">Rooms</p>
                      <p className="text-white font-medium">{cinema.rooms.length} Theaters</p>
                    </div>
                  </div>

                  {cinema.facilities.length > 0 && (
                    <div className="mt-4">
                      <p className="text-secondary-400 text-xs uppercase tracking-wider mb-2">Facilities</p>
                      <div className="flex flex-wrap gap-2">
                        {cinema.facilities.map((facility, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-secondary-800 rounded-full text-xs text-secondary-300"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
  const [locations, setLocations] = useState(mockLocations);
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
    setDeleteTarget({ type: 'cinema', locationId, cinemaId });
    setIsDeleteModalOpen(true);
  };

  const handleAddCinema = (cinemaData: Partial<Cinema>) => {
    const newCinema: Cinema = {
      id: `cinema-${Date.now()}`,
      rooms: [],
      ...cinemaData,
    } as Cinema;

    setLocations(locations.map(loc =>
      loc.id === selectedLocation?.id
        ? { ...loc, cinemas: [...loc.cinemas, newCinema] }
        : loc
    ));
    setIsCinemaModalOpen(false);
  };

  const handleEditCinema = (cinemaData: Partial<Cinema>) => {
    setLocations(locations.map(loc =>
      loc.id === selectedLocation?.id
        ? {
            ...loc,
            cinemas: loc.cinemas.map(cinema =>
              cinema.id === selectedCinema?.id
                ? { ...cinema, ...cinemaData }
                : cinema
            ),
          }
        : loc
    ));
    setIsCinemaModalOpen(false);
    setSelectedCinema(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'location') {
      setLocations(locations.filter(loc => loc.id !== deleteTarget.locationId));
    } else {
      setLocations(locations.map(loc =>
        loc.id === deleteTarget.locationId
          ? { ...loc, cinemas: loc.cinemas.filter(c => c.id !== deleteTarget.cinemaId) }
          : loc
      ));
    }
  };

  const handleEditCinemaFromDropdown = (cinema: Cinema) => {
    setSelectedLocation(locations.find(loc => 
      loc.cinemas.some(c => c.id === cinema.id)
    ) || null);
    setSelectedCinema(cinema);
    setIsCinemaModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {selectedCinemaId ? (
          <RoomManagement 
            cinema={locations.flatMap(l => l.cinemas).find(c => c.id === selectedCinemaId)!} 
            onBack={() => setSelectedCinemaId(null)} 
          />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Cinema Management</h1>
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  setIsLocationModalOpen(true);
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Add Location
              </button>
            </div>

            <div className="grid gap-6">
              {locations.map(location => (
                <div key={location.id} className="relative">
                  <div className="flex gap-4">
                    {/* Move LocationDropdown to flex container */}
                    <div className="flex-1">
                      <LocationDropdown 
                        location={location}
                        onEditCinema={handleEditCinemaFromDropdown}
                        onDeleteCinema={handleDeleteCinema}
                        onManageRooms={(cinemaId) => setSelectedCinemaId(cinemaId)}
                      />
                    </div>
                    
                    {/* Move action buttons outside of absolute positioning */}
                    <div className="flex items-start gap-2 pt-4">
                      <button
                        onClick={() => {
                          setSelectedLocation(location);
                          setIsCinemaModalOpen(true);
                        }}
                        className="p-2 bg-primary-500 rounded-lg hover:bg-primary-600"
                        title="Add Cinema"
                      >
                        <Plus size={16} className="text-white" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLocation(location);
                          setIsLocationModalOpen(true);
                        }}
                        className="p-2 bg-secondary-700 rounded-lg hover:bg-secondary-600"
                        title="Edit Location"
                      >
                        <Edit size={16} className="text-secondary-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="p-2 bg-error-500/10 rounded-lg hover:bg-error-500/20"
                        title="Delete Location"
                      >
                        <Trash2 size={16} className="text-error-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          onSave={selectedCinema ? handleEditCinema : handleAddCinema}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
          }}
          onConfirm={handleConfirmDelete}
          title={`Delete ${deleteTarget?.type === 'location' ? 'Location' : 'Cinema'}`}
          message={`Are you sure you want to delete this ${deleteTarget?.type}? This action cannot be undone.`}
        />
      </div>
    </AdminLayout>
  );
};

export default CinemaManagement;