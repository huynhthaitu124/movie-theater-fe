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
  ],
  premium: [
    {
      id: 'room-3',
      name: 'IMAX Theater',
      capacity: 120,
      seats: [],
      layout: {
        rows: 10,
        seatsPerRow: 12
      },
      type: 'imax' as const,
      status: 'active' as const,
      features: ['IMAX Projection', 'Dolby Atmos', 'Premium Seating'],
      cinemaId: 'cin-1',
      screenSize: '22x16 meters',
      audioSystem: 'IMAX Enhanced Sound',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'room-4',
      name: '4DX Experience',
      capacity: 80,
      seats: [],
      layout: {
        rows: 8,
        seatsPerRow: 10
      },
      type: '4dx' as const,
      status: 'active' as const,
      features: ['Motion Seats', 'Environmental Effects', 'Dolby Sound'],
      cinemaId: 'cin-2',
      screenSize: '16x9 meters',
      audioSystem: 'Dolby Digital',
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
      },
      {
        id: 'cin-3',
        name: 'CGV Royal City',
        image: 'https://example.com/cinema3.jpg',
        address: '72A Nguyen Trai, Thanh Xuan',
        city: 'Ha Noi',
        phone: '024 9876 5432',
        email: 'royalcity@cgv.vn',
        rooms: [...mockRooms.standard, mockRooms.premium[0]],
        facilities: ['IMAX', '4DX', 'Gold Class'],
        status: 'active',
        manager: 'David Wilson',
        rating: 4.7
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
  },
  {
    id: 'loc-3',
    name: 'Da Nang',
    region: 'Central',
    cinemas: [
      {
        id: 'cin-4',
        name: 'CGV Vincom Da Nang',
        image: 'https://example.com/cinema4.jpg',
        address: '910 Ngo Quyen, Son Tra',
        city: 'Da Nang',
        phone: '0236 1234 567',
        email: 'danang@cgv.vn',
        rooms: [...mockRooms.standard, mockRooms.premium[1]],
        facilities: ['4DX', 'Premium Cinema', 'Kids Room'],
        status: 'active',
        manager: 'Sarah Chen',
        rating: 4.6
      }
    ]
  }
];

// Export a flattened array of cinemas for components that need Cinema[] type
export const mockCinemas = mockLocations.flatMap(location => location.cinemas);

export default mockCinemas;
