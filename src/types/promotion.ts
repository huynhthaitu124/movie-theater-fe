// types/promotion.ts

export type DiscountType = 'percentage' | 'fixed';
export type PromotionStatus = 'active' | 'inactive' | 'expired';

export interface Promotion {
    id: string;
    code: string;
    name: string;
    description: string;
    promotionTypeId: string;
    startDate: string;
    endDate: string;
    discountValue: number;
    discountType: DiscountType;
    minimumPurchase?: number;
    maximumDiscount?: number;
    usageLimit?: number;
    usageCount: number;
    status: PromotionStatus;
    createdAt: string;
    updatedAt: string;
}

export interface PromotionType {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}