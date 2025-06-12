export interface Promotion {
  id: string;
  title: string;
  code: string;
  description: string;
  status: 'active' | 'upcoming' | 'expired';
  endDate: string;
  imageUrl: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  terms: string[];
}

export const mockPromotions: Promotion[] = [
  {
    id: '1',
    title: 'Early Bird Special',
    code: 'EARLY25',
    description: 'Get 25% off on all morning show tickets before 12 PM',
    status: 'active',
    endDate: '2024-06-30',
    minPurchase: 20,
    maxDiscount: 50,
    discountType: 'percentage',
    discountValue: 25,
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2069&auto=format&fit=crop',
    terms: [
      'Valid for shows before 12 PM only',
      'Not valid on weekends and holidays',
      'Maximum discount of $50 per transaction'
    ]
  },
  {
    id: '2',
    title: 'Family Package',
    code: 'FAM4SAVE',
    description: 'Save 30% when you buy 4 or more tickets',
    status: 'active',
    endDate: '2024-12-31',
    minPurchase: 60,
    maxDiscount: 100,
    discountType: 'percentage',
    discountValue: 30,
    imageUrl: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=2070&auto=format&fit=crop',
    terms: [
      'Must purchase minimum 4 tickets',
      'Valid for all movie screenings',
      'Cannot be combined with other offers'
    ]
  },
  {
    id: '3',
    title: 'Student Discount',
    code: 'STUDENT20',
    description: '20% off for students with valid ID',
    status: 'active',
    endDate: '2024-12-31',
    maxDiscount: 40,
    discountType: 'percentage',
    discountValue: 20,
    imageUrl: 'https://images.unsplash.com/photo-1519338381761-c7523edc1f46?q=80&w=2073&auto=format&fit=crop',
    terms: [
      'Must present valid student ID',
      'Valid for standard screenings only',
      'Not valid for special events'
    ]
  },
  {
    id: '4',
    title: 'Double Popcorn Deal',
    code: 'POPCORN2X',
    description: 'Buy one large popcorn, get another free',
    status: 'upcoming',
    endDate: '2024-04-30',
    discountType: 'percentage',
    discountValue: 100,
    imageUrl: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=2070&auto=format&fit=crop',
    terms: [
      'Valid for large popcorn only',
      'Second popcorn must be of equal or lesser value',
      'While stocks last'
    ]
  },
  {
    id: '5',
    title: 'Weekend Special',
    code: 'WEEKEND10',
    description: '10% off on all weekend movie tickets',
    status: 'expired',
    endDate: '2024-03-31',
    maxDiscount: 30,
    discountType: 'percentage',
    discountValue: 10,
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop',
    terms: [
      'Valid only on weekends',
      'Cannot be combined with other offers',
      'Maximum discount of $30 per transaction'
    ]
  }
];