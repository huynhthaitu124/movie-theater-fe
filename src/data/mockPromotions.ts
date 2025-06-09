import { Promotion } from '../types/promotion';

export const mockPromotions: Promotion[] = [
  {
    id: '1',
    title: 'Student Tuesday',
    description: 'Get 20% off on all movie tickets every Tuesday with valid student ID',
    imageUrl: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    discountType: 'percentage',
    discountValue: 20,
    code: 'STUDENT20',
    terms: [
      'Valid student ID required',
      'Valid only on Tuesdays',
      'Cannot be combined with other offers'
    ],
    status: 'active'
  },
  {
    id: '2',
    title: 'Family Package',
    description: 'Buy 4 tickets and get 1 free popcorn combo',
    imageUrl: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b',
    startDate: '2024-03-15',
    endDate: '2024-06-30',
    discountType: 'fixed',
    discountValue: 15,
    code: 'FAMILY4',
    terms: [
      'Valid for same movie and showtime',
      'Must be purchased together',
      'Subject to availability'
    ],
    status: 'active'
  }
];