export interface Membership {
  membershipId: string;
  membershipname: string;
  description: string;
  points: number;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  accountmemberships: AccountMembership[];
}

export interface AccountMembership {
  id: string;
  accountId: string;
  membershipId: string;
  startDate: string;
  endDate: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipFormData {
  membershipname: string;
  description: string;
  points: number;
  status: string;
  isActive: boolean;
}

export interface MembershipFilters {
  status?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  search?: string;
  isActive?: boolean;
}

export interface MembershipStats {
  totalMemberships: number;
  activeMemberships: number;
  totalMembers: number;
}