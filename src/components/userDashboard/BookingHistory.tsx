import React from 'react';
import { Calendar, CreditCard, CheckCircle, XCircle, Clock, Download, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface BookingHistoryProps {
  transactions: Transaction[];
}

const BookingHistory: React.FC<BookingHistoryProps> = ({ transactions }) => {
  const navigate = useNavigate();

  // Only show completed transactions
  const completedTransactions = transactions.filter(
    (transaction) => transaction.paymentstatus === 'COMPLETED'
  );

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
        {completedTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No bookings yet</h3>
            <p className="text-gray-400">Your booking history will appear here once you make a reservation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedTransactions.map((transaction) => (
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
                        <div className="text-sm text-gray-400 mb-1">Amount</div>
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