import React, { useState } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { motion } from 'framer-motion';
import { Plus, MapPin, Building2, ChevronDown, ChevronRight, Edit, Trash } from 'lucide-react';
import { mockLocations } from '../../../data/mockCinemas';

interface Cinema {
  id: string;
  name: string;
  address: string;
  screens: number;
  status: 'active' | 'maintenance' | 'closed';
  capacity: number;
  facilities: string[];
}

interface Location {
  id: string;
  name: string;
  cinemas: Cinema[];
}

const CinemaManagement: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [expandedLocations, setExpandedLocations] = useState<string[]>([]);

  const toggleLocation = (locationId: string) => {
    setExpandedLocations(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const getStatusColor = (status: Cinema['status']) => {
    switch (status) {
      case 'active':
        return 'text-success-500 bg-success-500/10';
      case 'maintenance':
        return 'text-warning-500 bg-warning-500/10';
      case 'closed':
        return 'text-accent-500 bg-accent-500/10';
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Cinema Management</h1>
          <button className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            <Plus size={20} className="mr-2" />
            Add New Cinema
          </button>
        </div>

        <div className="grid gap-6">
          {locations.map(location => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary-800 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleLocation(location.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <MapPin size={20} className="text-primary-500" />
                  <span className="text-lg font-medium text-white">
                    {location.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-700">
                    {location.cinemas.length} cinemas
                  </span>
                </div>
                {expandedLocations.includes(location.id) 
                  ? <ChevronDown size={20} />
                  : <ChevronRight size={20} />
                }
              </button>

              {expandedLocations.includes(location.id) && (
                <div className="p-4 border-t border-secondary-700">
                  <div className="space-y-4">
                    {location.cinemas.map(cinema => (
                      <motion.div
                        key={cinema.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 bg-secondary-700/50 rounded-lg"
                      >
                        <div className="flex items-start space-x-4">
                          <Building2 size={24} className="text-secondary-400 mt-1" />
                          <div>
                            <h3 className="font-medium text-white">{cinema.name}</h3>
                            <p className="text-sm text-secondary-400">{cinema.address}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-secondary-400">
                                {cinema.screens} Screens
                              </span>
                              <span className="text-sm text-secondary-400">
                                {cinema.capacity} Seats
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(cinema.status)}`}>
                                {cinema.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {cinema.facilities.map((facility, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-secondary-600/50 rounded-md text-xs text-secondary-300"
                                >
                                  {facility}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-600 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 text-secondary-400 hover:text-accent-500 hover:bg-accent-500/10 rounded-lg transition-colors">
                            <Trash size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CinemaManagement;