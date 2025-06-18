import { Location } from '../types/cinema';

// Add mock rooms first
const mockRooms = {
  standard: [
    {
      id: 'room-1',
      name: 'Theater 1',
      capacity: 70,
      seats: [], // You can add detailed seat data if needed
      layout: {
        rows: 7,
        seatsPerRow: 10
      },
      type: 'standard' as const,
      status: 'active' as const,
      features: ['Dolby Sound', 'Air Conditioning'],
      cinemaId: 'cin-1',
      screenSize: '12x6 meters',
      audioSystem: 'Dolby 7.1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'room-2',
      name: 'Theater 2',
      capacity: 50,
      seats: [],
      layout: {
        rows: 5,
        seatsPerRow: 10
      },
      type: 'vip' as const,
      status: 'active' as const,
      features: ['Dolby Atmos', 'Reclining Seats'],
      cinemaId: 'cin-1',  
      screenSize: '15x8 meters',
      audioSystem: 'Dolby Atmos',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

export const mockLocations: Location[] = [
  {
    id: 'loc-1',
    name: 'Ha Noi',
    region: 'North',
    cinemas: [
      {
        id: 'cin-1',
        name: 'CGV Vincom Times City',
        image: 'https://example.com/cinema1.jpg',
        address: '458 Minh Khai, Hai Ba Trung',
        city: 'Ha Noi',
        phone: '024 1234 5678',
        email: 'timescity@cgv.vn',
        rooms: mockRooms.standard,
        facilities: ['IMAX', 'Dolby Atmos', 'VIP Lounge'],
        status: 'active',
        manager: 'John Doe',
        rating: 4.5
      }
    ]
  },
  {
    id: 'loc-2', 
    name: 'Ho Chi Minh',
    region: 'South',
    cinemas: [
      {
        id: 'cin-2',
        name: 'CGV Landmark 81',
        image: 'https://example.com/cinema2.jpg',
        address: '720A Dien Bien Phu, Binh Thanh',
        city: 'Ho Chi Minh',
        phone: '028 1234 5678',
        email: 'landmark81@cgv.vn',
        rooms: mockRooms.standard,
        facilities: ['4DX', 'IMAX', 'Premium Cinema'],
        status: 'active',
        manager: 'Jane Smith',
        rating: 4.8
      }
    ]
  }
];

// Export a flattened array of cinemas for components that need Cinema[] type
export const mockCinemas = mockLocations.flatMap(location => location.cinemas);

export default mockCinemas;
