// types/promotion.ts

export type DiscountType = 'percentage' | 'fixed';
export type PromotionStatus = 'active' | 'inactive' | 'expired';

export interface Promotion {
    id: string;
    code: string;
    title: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    startDate: string;
    endDate: string;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    usageCount: number;
    terms: string[];
    status: PromotionStatus;
    createdAt: string;
    updatedAt: string;
}