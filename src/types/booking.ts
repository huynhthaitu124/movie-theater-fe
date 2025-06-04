export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type TicketStatus = 'valid' | 'used' | 'cancelled';
export type ScheduleStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface Booking {
    id: string; // InvoiceID
    accountId: string;
    tickets: Ticket[];
    totalAmount: number;
    status: BookingStatus;
    bookingDate: string;
    paymentStatus: PaymentStatus;
    promotionId?: string;
    promotion?: {
        id: string;
        code: string;
        discount: number;
        type: 'percentage' | 'fixed';
    };
    products: InvoiceDetail[];
    createdAt: string;
    updatedAt: string;
}

export interface Ticket {
    id: string;
    invoiceId: string;
    scheduleId: string;
    seatId: string;
    price: number;
    status: TicketStatus;
    schedule?: Schedule;
    seat?: {
        id: string;
        row: string;
        number: string;
        seatType: {
            id: string;
            name: string;
            basePrice: number;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface Schedule {
    id: string;
    movieId: string;
    roomId: string;
    startTime: string;
    endTime: string;
    date: string;
    status: ScheduleStatus;
    basePrice: number;
    movie?: {
        id: string;
        title: string;
        posterUrl: string;
        duration: number;
    };
    room?: {
        id: string;
        name: string;
        cinemaId: string;
        cinema?: {
            id: string;
            name: string;
            address: string;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceDetail {
    id: string;
    invoiceId: string;
    productId?: string;
    comboId?: string;
    quantity: number;
    price: number;
    product?: {
        id: string;
        name: string;
        price: number;
        type: 'food' | 'drink' | 'snack';
    };
    combo?: {
        id: string;
        name: string;
        price: number;
        products: {
            productId: string;
            quantity: number;
        }[];
    };
    createdAt: string;
    updatedAt: string;
}
