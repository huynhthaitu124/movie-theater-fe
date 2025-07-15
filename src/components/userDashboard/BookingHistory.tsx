import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, CheckCircle, XCircle, Clock, Download, ExternalLink, MapPin, Film, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { invoiceDetailService } from '../../services/modules/invoiceDetail.service';
import { scheduleService } from '../../services/modules/schedule.service';
import { seatService } from '../../services/modules/seat.service';

interface Transaction {
  transactionid: string;
  accountid: string;
  paymentmethod: string;
  gatewayid: string;
  transactiondate: string;
  paymentdate: string;
  paymentstatus: string;
  invoiceid: string;
  isactive: boolean;
  createdat: string;
  updatedat: string;
  price: number;
}

interface EnhancedTransaction extends Transaction {
  scheduleInfo?: {
    movieName: string;
    cinemaName: string;
    roomName: string;
    showTime: string;
    showDate: string;
  };
  seatDetails?: Array<{
    seatCode: string;
    seatTypeName: string;
    price: number;
  }>;
}

interface BookingHistoryProps {
  transactions: Transaction[];
}

const BookingHistory: React.FC<BookingHistoryProps> = ({ transactions }) => {
  const navigate = useNavigate();
  const [enhancedTransactions, setEnhancedTransactions] = useState<EnhancedTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Only show completed transactions
  const completedTransactions = transactions.filter(
    (transaction) => transaction.paymentstatus === 'COMPLETED'
  );

  useEffect(() => {
    const fetchDetailedInfo = async () => {
      setLoading(true);
      const enhanced: EnhancedTransaction[] = [];

      console.log('Completed Transactions:', completedTransactions);

      for (const transaction of completedTransactions) {
        try {
          console.log('Processing transaction:', transaction.invoiceid);
          // Get invoice details to find schedule and seat information
          const invoiceDetailsResponse = await invoiceDetailService.getByInvoiceId(transaction.invoiceid);
          const invoiceDetails = invoiceDetailsResponse.data || [];
          console.log('Invoice Details for', transaction.invoiceid, ':', invoiceDetails);

          // Find seat-related invoice details
          const seatDetails = invoiceDetails.filter(detail => detail.setid);
          const scheduleDetails = invoiceDetails.find(detail => detail.scheduleid);
          console.log('Seat Details:', seatDetails);
          console.log('Schedule Details:', scheduleDetails);

          let scheduleInfo = undefined;
          let seatInfo: Array<{ seatCode: string; seatTypeName: string; price: number }> = [];

          // Fetch schedule information if available
          if (scheduleDetails?.scheduleid) {
            try {
              console.log('Fetching schedule for ID:', scheduleDetails.scheduleid);
              const allSchedulesResponse = await scheduleService.getAll();
              const allSchedules = allSchedulesResponse.data || [];
              console.log('All Schedules:', allSchedules);
              const schedule = allSchedules.find(s => s.scheduleId === scheduleDetails.scheduleid);
              console.log('Found Schedule:', schedule);

              if (schedule) {
                scheduleInfo = {
                  movieName: schedule.movie?.title || schedule.movieName || 'Unknown Movie',
                  cinemaName: schedule.cinema?.name || 'Unknown Cinema',
                  roomName: schedule.room?.name || 'Unknown Room',
                  showTime: schedule.startTime,
                  showDate: schedule.date
                };
                console.log('Schedule Info:', scheduleInfo);
              }
            } catch (error) {
              console.error('Error fetching schedule:', error);
            }
          }

          // Fetch seat information for each seat
          if (seatDetails.length > 0) {
            try {
              console.log('Fetching seats...');
              const allSeatsResponse = await seatService.getAll();
              const allSeats = allSeatsResponse.data || [];
              console.log('All Seats:', allSeats);

              for (const seatDetail of seatDetails) {
                if (seatDetail.setid) {
                  const seat = allSeats.find((s: any) => s.seatId === seatDetail.setid);
                  console.log('Found Seat for ID', seatDetail.setid, ':', seat);
                  if (seat) {
                    seatInfo.push({
                      seatCode: `${seat.row}${seat.number}`,
                      seatTypeName: seat.seatTypeName || 'Standard',
                      price: seatDetail.amount
                    });
                  }
                }
              }
              console.log('Final Seat Info:', seatInfo);
            } catch (error) {
              console.error('Error fetching seat details:', error);
            }
          }

          enhanced.push({
            ...transaction,
            scheduleInfo,
            seatDetails: seatInfo
          });
        } catch (error) {
          console.error('Error fetching transaction details:', error);
          enhanced.push(transaction);
        }
      }

      console.log('Enhanced Transactions:', enhanced);
      setEnhancedTransactions(enhanced);
      setLoading(false);
    };

    if (completedTransactions.length > 0) {
      fetchDetailedInfo();
    } else {
      setLoading(false);
    }
  }, [transactions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-900/50 text-green-400';
      case 'FAILED':
        return 'bg-red-900/50 text-red-400';
      case 'PENDING':
        return 'bg-yellow-900/50 text-yellow-400';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-white">Booking History</h2>
          <p className="text-gray-300">View all your cinema bookings and transactions</p>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading booking details...</p>
          </div>
        ) : enhancedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No bookings yet</h3>
            <p className="text-gray-400">Your booking history will appear here once you make a reservation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enhancedTransactions.map((transaction) => (
              <div
                key={transaction.transactionid}
                className="border border-gray-600 rounded-lg p-6 hover:border-gray-500 transition-colors bg-gray-700/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(transaction.paymentstatus)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.paymentstatus)}`}>
                        {transaction.paymentstatus}
                      </span>
                      <span className="text-sm text-gray-400">
                        Transaction ID: {(transaction.transactionid || '').slice(0, 8)}...
                      </span>
                    </div>

                    {/* Movie & Cinema Information */}
                    {transaction.scheduleInfo && (
                      <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                              <Film className="w-4 h-4" />
                              <span>Movie</span>
                            </div>
                            <p className="font-medium text-white">{transaction.scheduleInfo.movieName}</p>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                              <MapPin className="w-4 h-4" />
                              <span>Cinema</span>
                            </div>
                            <p className="font-medium text-white">{transaction.scheduleInfo.cinemaName}</p>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                              <Home className="w-4 h-4" />
                              <span>Room</span>
                            </div>
                            <p className="font-medium text-white">{transaction.scheduleInfo.roomName}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <div className="flex items-center space-x-6">
                            <div>
                              <span className="text-sm text-gray-400">Show Date: </span>
                              <span className="font-medium text-white">
                                {new Date(transaction.scheduleInfo.showDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-400">Show Time: </span>
                              <span className="font-medium text-white">{transaction.scheduleInfo.showTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Seat Information */}
                    {transaction.seatDetails && transaction.seatDetails.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-2">Seats:</div>
                        <div className="flex flex-wrap gap-2">
                          {transaction.seatDetails.map((seat, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium"
                            >
                              {seat.seatCode} - {seat.seatTypeName} - {formatCurrency(seat.price)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span>Booking Date</span>
                        </div>
                        <p className="font-medium text-white">
                          {formatDate(transaction.transactiondate)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                          <CreditCard className="w-4 h-4" />
                          <span>Payment Method</span>
                        </div>
                        <p className="font-medium text-white">{transaction.paymentmethod}</p>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-1">Total Amount</div>
                        <p className="font-bold text-lg text-white">
                          {formatCurrency(transaction.price)}
                        </p>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400 mb-1">Payment Date</div>
                        <p className="font-medium text-white">
                          {formatDate(transaction.paymentdate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Invoice ID: {(transaction.invoiceid || '').slice(0, 8)}...</span>
                      <span>Gateway: {transaction.gatewayid}</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm">
                      <Download className="w-4 h-4" />
                      <span>Download Invoice</span>
                    </button>
                    <button
                      onClick={() => navigate(`/invoice/${transaction.invoiceid}`)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;