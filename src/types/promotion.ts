export interface Promotion {
  promotionId: string;
  promotionTypeId: string;
  title: string;
  detail: string;
  startTime: string;
  endTime: string;
  image: string;
  status: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionType {
  id: string;
  name: string;
  description?: string;
}

export interface PromotionFormData {
  promotionTypeId: string;
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