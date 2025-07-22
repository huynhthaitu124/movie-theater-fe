export interface Promotion {
  promotionId: string;
  promotionTypeId: string;
  title: string;
  detail: string;
  startTime: string;
  endTime: string;
  image: string;
  imageUrl?: string;
  status: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  discountType?: string;
  discountLevel?: number;
  minCondition?: number;
}

export interface PromotionType {
  promotiontypeid: string;
  name: string;
  discountlevel: number; 
  discounttype: string; 
  mincondition: number;
  createdat: string;
  updatedat: string;
  isactive?: boolean;
}

export interface PromotionFormData {
  promotionId?: string;
  promotionTypeid: string;
  title: string;
  detail: string;
  startTime: string;
  endTime: string;
  image: string;
  status: string;
  code: string;
  isActive: boolean;
}

export interface PromotionFilters {
  status?: string;
  promotionType?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}