import { Cinema, Room, Seat, Location } from '../types/cinema';

const generateSeats = (roomId: string, rows: string[], seatsPerRow: number): Seat[] => {
  return rows.flatMap((row) =>
    Array.from({ length: seatsPerRow }, (_, idx) => ({
      id: `${roomId}-${row}${idx + 1}`,
      row,
      number: idx + 1,
      type: "standard" as const,
      status: "available" as const,
      price: 75000
    }))
  );
};

export const mockLocations: Location[] = [
  {
    id: "loc-1",
    name: "Ho Chi Minh City",
    region: "South",
    cinemas: [
      {
        id: "cinema-1",
        name: "FPT Cinema Cantavil",
        address: "1 Song Hanh, Thu Duc",
        city: "Ho Chi Minh City",
        phone: "028-1234-5678",
        email: "cantavil.hcm@fptcinema.com",
        status: "active",
        manager: "John Doe",
        facilities: ["Parking", "Food Court", "VIP Lounge", "Gaming Zone"],
        rooms: [
          {
            id: "room-1",
            name: "Theater 1",
            capacity: 70,
            type: "standard",
            status: "active",
            features: ["Dolby Audio", "3D Ready"],
            cinemaId: "cinema-1",
            screenSize: "12m x 5m",
            audioSystem: "Dolby 7.1 Surround",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            layout: {
              rows: 7,
              seatsPerRow: 10
            },
            seats: generateSeats("room-1", ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 10)
          },
          {
            id: "room-2",
            name: "VIP Theater",
            capacity: 50,
            type: "vip",
            status: "active",
            features: ["Dolby Atmos", "4K Projection", "Reclining Seats"],
            cinemaId: "cinema-1",
            screenSize: "15m x 6.5m",
            audioSystem: "Dolby Atmos",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            layout: {
              rows: 5,
              seatsPerRow: 10
            },
            seats: generateSeats("room-2", ['A', 'B', 'C', 'D', 'E'], 10)
          }
        ]
      },
      {
        id: "cinema-2",
        name: "FPT Cinema Sala",
        address: "10 Mai Chi Tho, Thu Thiem",
        city: "Ho Chi Minh City",
        phone: "028-9876-5432",
        email: "sala.hcm@fptcinema.com",
        status: "active",
        manager: "Jane Smith",
        facilities: ["IMAX", "Restaurant", "Gaming Zone", "Kids Area"],
        rooms: [
          {
            id: "room-3",
            name: "IMAX Theater",
            capacity: 100,
            type: "imax",
            status: "active",
            features: ["IMAX Projection", "Dolby Atmos", "Premium Seating"],
            cinemaId: "cinema-2",
            screenSize: "22m x 16m",
            audioSystem: "IMAX Enhanced Audio",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            layout: {
              rows: 10,
              seatsPerRow: 10
            },
            seats: generateSeats("room-3", ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], 10)
          }
        ]
      }
    ]
  },
  {
    id: "loc-2",
    name: "Ha Noi",
    region: "North",
    cinemas: [
      {
        id: "cinema-3",
        name: "FPT Cinema Times City",
        address: "458 Minh Khai Street",
        city: "Ha Noi",
        phone: "024-9876-5432",
        email: "timescity.hn@fptcinema.com",
        status: "active",
        manager: "David Wilson",
        facilities: ["IMAX", "Restaurant", "Gaming Zone", "Kids Area"],
        rooms: [
          {
            id: "room-4",
            name: "4DX Theater",
            capacity: 80,
            type: "4dx",
            status: "active",
            features: ["4DX Motion Seats", "Environmental Effects", "Dolby Atmos"],
            cinemaId: "cinema-3",
            screenSize: "18m x 7.5m",
            audioSystem: "Dolby Atmos",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            layout: {
              rows: 8,
              seatsPerRow: 10
            },
            seats: generateSeats("room-4", ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], 10)
          }
        ]
      }
    ]
  },
  {
    id: "loc-3",
    name: "Da Nang",
    region: "Central",
    cinemas: [
      {
        id: "cinema-4",
        name: "FPT Cinema Vincom",
        address: "910 Ngo Quyen Street",
        city: "Da Nang",
        phone: "0236-7654-3210",
        email: "vincom.dn@fptcinema.com",
        status: "active",
        manager: "Sarah Johnson",
        facilities: ["3D Cinema", "Cafe", "Arcade"],
        rooms: [
          {
            id: "room-5",
            name: "Standard Theater 1",
            capacity: 60,
            type: "standard",
            status: "active",
            features: ["Digital Projection", "Surround Sound"],
            cinemaId: "cinema-4",
            screenSize: "14m x 6m",
            audioSystem: "Dolby Digital 5.1",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            layout: {
              rows: 6,
              seatsPerRow: 10
            },
            seats: generateSeats("room-5", ['A', 'B', 'C', 'D', 'E', 'F'], 10)
          },
          {
            id: "room-6",
            name: "VIP Theater Gold",
            capacity: 40,
            type: "vip",
            status: "maintenance",
            features: ["Gold Class Seating", "Butler Service", "Premium Sound"],
            cinemaId: "cinema-4",
            screenSize: "16m x 7m",
            audioSystem: "Dolby Digital 7.1",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            layout: {
              rows: 4,
              seatsPerRow: 10
            },
            seats: generateSeats("room-6", ['A', 'B', 'C', 'D'], 10)
          }
        ]
      }
    ]
  }
];

export const findLocationById = (id: string): Location | undefined => {
  return mockLocations.find(location => location.id === id);
};

export const findRoomById = (id: string): Room | undefined => {
  for (const location of mockLocations) {
    for (const cinema of location.cinemas) {
      const room = cinema.rooms.find(room => room.id === id);
      if (room) return room;
    }
  }
  return undefined;
};

export default mockLocations;