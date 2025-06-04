export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Booking {
    id: string;
    userId: string;
    showtimeId: string;
    seats: BookingSeat[];
    totalAmount: number;
    status: BookingStatus;
    bookingDate: string;
    paymentStatus: PaymentStatus;
    promotionId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BookingSeat {
    row: number;
    column: number;
    type: 'regular' | 'vip' | 'couple';
    status: 'available' | 'selected' | 'booked' | 'reserved';
    seatNumber: string;
}

export interface Showtime {
    id: string;
    movieId: string;
    roomId: string;
    startTime: string;
    endTime: string;
    date: string;
    prices: {
        regular: number;
        vip: number;
        couple: number;
    };
    createdAt: string;
    updatedAt: string;
}
