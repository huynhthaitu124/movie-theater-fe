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

export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Ho Chi Minh',
    cinemas: [
      {
        id: 'hcm-1',
        name: 'CGV Vincom Thu Duc',
        address: '216 Vo Van Ngan, Binh Tho Ward, Thu Duc City',
        screens: 5,
        status: 'active',
        capacity: 750,
        facilities: ['IMAX', '4DX', 'Gold Class', 'Parking']
      },
      {
        id: 'hcm-2',
        name: 'CGV Pearl Plaza',
        address: '561A Dien Bien Phu, Ward 25, Binh Thanh District',
        screens: 6,
        status: 'active',
        capacity: 900,
        facilities: ['Dolby Atmos', 'Gold Class', 'Parking']
      },
      {
        id: 'hcm-3',
        name: 'CGV Aeon Tan Phu',
        address: '30 Bo Bao Tan Thang, Son Ky Ward, Tan Phu District',
        screens: 4,
        status: 'maintenance',
        capacity: 600,
        facilities: ['Standard', 'Premium', 'Food Court']
      }
    ]
  },
  {
    id: '2',
    name: 'Da Nang',
    cinemas: [
      {
        id: 'dn-1',
        name: 'CGV Vincom Da Nang',
        address: '910B Ngo Quyen, An Hai Bac Ward, Son Tra District',
        screens: 4,
        status: 'active',
        capacity: 600,
        facilities: ['IMAX', 'Premium', 'Parking']
      },
      {
        id: 'dn-2',
        name: 'CGV Da Nang Center',
        address: '255-257 Hung Vuong, Vinh Trung Ward, Thanh Khe District',
        screens: 3,
        status: 'closed',
        capacity: 450,
        facilities: ['Standard', 'Food Court']
      }
    ]
  },
  {
    id: '3',
    name: 'Ha Noi',
    cinemas: [
      {
        id: 'hn-1',
        name: 'CGV Vincom Royal City',
        address: '72A Nguyen Trai, Thuong Dinh, Thanh Xuan',
        screens: 7,
        status: 'active',
        capacity: 1050,
        facilities: ['IMAX', '4DX', 'Gold Class', 'Premium', 'Parking']
      },
      {
        id: 'hn-2',
        name: 'CGV Times City',
        address: '458 Minh Khai, Vinh Tuy, Hai Ba Trung',
        screens: 5,
        status: 'active',
        capacity: 750,
        facilities: ['Dolby Atmos', 'Premium', 'Food Court']
      }
    ]
  },
  {
    id: '4',
    name: 'Can Tho',
    cinemas: [
      {
        id: 'ct-1',
        name: 'CGV Vincom Can Tho',
        address: '209 Cach Mang Thang 8, An Hoi, Ninh Kieu',
        screens: 4,
        status: 'active',
        capacity: 600,
        facilities: ['Standard', 'Premium', 'Parking']
      }
    ]
  },
  {
    id: '5',
    name: 'Bien Hoa',
    cinemas: [
      {
        id: 'bh-1',
        name: 'CGV Vincom Bien Hoa',
        address: '1096 Pham Van Thuan, Tan Mai, Bien Hoa',
        screens: 5,
        status: 'maintenance',
        capacity: 750,
        facilities: ['Standard', 'Premium', 'Food Court', 'Parking']
      }
    ]
  }
];

export default mockLocations;