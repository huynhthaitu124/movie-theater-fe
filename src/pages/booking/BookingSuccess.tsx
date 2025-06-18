import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Users, Ticket, Clock, Film } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';

interface BookingDetails {
  movieTitle: string;
  cinemaName: string;
  date: string;
  time: string;
  seats: string[];
  totalAmount: number;
  confirmationCode: string;
}

const BookingSuccess: React.FC = () => {
  const location = useLocation();
  const booking = location.state as BookingDetails;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="relative">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-pulse" />
              <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-green-500/20 animate-ping"></div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Booking Confirmed! 🎉
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your movie tickets have been successfully booked
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Your Ticket</h2>
                  <p className="text-blue-100">Confirmation Code</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold bg-white/20 px-4 py-2 rounded-lg">
                    {booking?.confirmationCode}
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Film className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Movie</p>
                      <p className="text-gray-600 dark:text-gray-400">{booking?.movieTitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Cinema</p>
                      <p className="text-gray-600 dark:text-gray-400">{booking?.cinemaName}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Date</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {booking?.date ? formatDate(booking.date) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Time</p>
                      <p className="text-gray-600 dark:text-gray-400">{booking?.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <Users className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">Seats</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {booking?.seats.map((seat, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Paid</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${booking?.totalAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <Ticket className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Important Information
                </h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Please arrive 15 minutes before showtime</li>
                  <li>• Bring a valid ID for verification</li>
                  <li>• A confirmation email has been sent to your email address</li>
                  <li>• Screenshot this confirmation for easy access</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/movies" className="flex-1 sm:flex-none">
              <Button variant="secondary" size="lg" fullWidth className="sm:w-auto">
                Browse More Movies
              </Button>
            </Link>
            <Link to="/" className="flex-1 sm:flex-none">
              <Button size="lg" fullWidth className="sm:w-auto">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingSuccess;