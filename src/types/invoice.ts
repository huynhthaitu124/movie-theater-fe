export interface Invoice {
  invoiceid: string;
  accountid: string;
  bookingdate?: string;
  createdat: string;
  updatedat: string;
  promotionid?: string | null;
  staffid?: string | null;
  scheduleid?: string | null;
  usecodescore?: number;
  isactive: boolean;
  price?: number;
}

export interface InvoiceRequest {
  accountid: string;
  promotionid?: string | null;
  staffid?: string | null;
  scheduleid?: string | null;
  usecodescore?: number;
  isactive?: boolean;
}