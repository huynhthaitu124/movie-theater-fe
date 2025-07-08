export interface InvoiceDetail {
  invoicedetailid: string;
  invoiceid: string;
  setid?: string | null;
  scheduleid?: string | null;
  productid?: string | null;
  comboid?: string | null;
  amount: number;
  isactive: boolean;
  createdat: string;
  updatedat: string;
  seatName?: string | null;
  productName?: string | null;
  comboName?: string | null;
  scheduleName?: string | null;
}

export interface InvoiceDetailRequest {
  invoiceid: string;
  setid?: string | null;
  scheduleid?: string | null;
  productid?: string | null;
  comboid?: string | null;
  amount: number;
  isactive?: boolean;
}