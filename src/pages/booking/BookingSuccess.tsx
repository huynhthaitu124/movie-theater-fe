import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Users, Ticket } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';

interface BookingDetails {
  movieTitle: string;
  date: string;
  time: string;
  seats: string[];
  totalAmount: number;
  confirmationCode: string;
}

const BookingSuccess: React.FC = () => {
  const location = useLocation();
  const booking = location.state as BookingDetails;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-secondary-400">
            Your tickets have been booked successfully.
            A confirmation email has been sent to your email address.
          </p>
        </div>

        <div className="bg-secondary-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Booking Details</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-secondary-300">
              <Ticket className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium text-white">{booking?.movieTitle}</p>
                <p className="text-sm">Confirmation Code: {booking?.confirmationCode}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-secondary-300">
              <Calendar className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium text-white">Date & Time</p>
                <p className="text-sm">{booking?.date} at {booking?.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-secondary-300">
              <MapPin className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium text-white">Seats</p>
                <p className="text-sm">{booking?.seats.join(', ')}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-secondary-700">
              <div className="flex justify-between text-white">
                <span className="font-medium">Total Amount</span>
                <span className="font-medium">${booking?.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link to="/movies">
            <Button variant="secondary">
              Browse More Movies
            </Button>
          </Link>
          <Link to="/account/bookings">
            <Button>
              View My Bookings
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default BookingSuccess;