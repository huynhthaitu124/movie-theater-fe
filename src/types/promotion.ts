export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  code: string;
  terms: string[];
  status: 'active' | 'upcoming' | 'expired';
}