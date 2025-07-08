import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import { vnpayService } from '../../services/modules/vnpay.service';
import { transactionService } from '../../services/modules/transaction.service';
import { useAuth } from '../../contexts/AuthContext';

const PaymentReturn: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [orderInfo, setOrderInfo] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const validatePayment = async () => {
      try {
        // Parse query parameters from the URL
        const queryParams = new URLSearchParams(location.search);
        const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');
        const vnp_TxnRef = queryParams.get('vnp_TxnRef') || queryParams.get('vnp_TransactionNo');
        const vnp_OrderInfo = queryParams.get('vnp_OrderInfo');
        const vnp_Amount = queryParams.get('vnp_Amount');
        
        // VNPay returns amount in VND without decimal, divided by 100
        const amount = vnp_Amount ? parseInt(vnp_Amount) / 100 : 0;
        setPaymentAmount(amount);
        
        // Set order info
        if (vnp_OrderInfo) {
          setOrderInfo(vnp_OrderInfo);
        }
        
        if (vnp_TxnRef) {
          setTransactionId(vnp_TxnRef);
        }

        // If user is not logged in or response code is not success, handle locally
        if (!currentUser || !vnp_ResponseCode) {
          handlePaymentStatus(vnp_ResponseCode, amount);
          return;
        }
        
        // Get the scheduleId and selected seat IDs from localStorage (stored during booking)
        const scheduleId = localStorage.getItem('booking_scheduleId');
        const selectedSeatsStr = localStorage.getItem('booking_selectedSeats');
        
        // Parse selected seat IDs from localStorage
        const selectedSeatIds = selectedSeatsStr ? JSON.parse(selectedSeatsStr) : [];
        
        if (!scheduleId) {
          console.error('No scheduleId found in localStorage');
          setValidationError('Missing booking information. Please try again.');
          setStatus('error');
          return;
        }
        
        if (!selectedSeatIds || selectedSeatIds.length === 0) {
          console.error('No selected seats found in localStorage');
          setValidationError('Missing seat selection information. Please try again.');
          setStatus('error');
          return;
        }

        // Validate the payment with the backend
        if (vnp_ResponseCode === '00' && vnp_TxnRef) {
          if (!currentUser?.accountid) {
            setValidationError('User account information is missing. Please log in again.');
            setStatus('error');
            return;
          }
          
          try {
            // Extract all the query parameters and convert to a proper params object
            const paramsObject: Record<string, string> = {};
            queryParams.forEach((value, key) => {
              paramsObject[key] = value;
            });
            
            // Chỉ gọi một API duy nhất - transaction validation
            // Chỉ truyền các trường dữ liệu cần thiết, không gửi vnPayParams nữa
            const transactionData = {
              accountId: currentUser.accountid,
              scheduleId: scheduleId,
              gatewayId: vnp_TxnRef, // Use vnp_TxnRef as the gatewayId
              seatIds: selectedSeatIds // Include the selected seat IDs
            };
            
            console.log('Transaction validation data being sent:', transactionData);
            
            // Chỉ gọi API transaction validation một lần duy nhất
            const transactionResponse = await transactionService.validateTransaction(transactionData);
            
            console.log('Transaction validation response:', transactionResponse);
            
            if (transactionResponse.status === 200) {
              setStatus('success');
              setMessage(`Your payment of ${new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(amount)} was completed successfully.`);
              
              // Set payment success state in localStorage
              localStorage.setItem('booking_payment_success', 'true');
              
              // Clear all booking-related data from localStorage except payment success flag
              localStorage.removeItem('booking_scheduleId');
              localStorage.removeItem('booking_selectedSeats');
              localStorage.removeItem('booking_selectedProducts');
              localStorage.removeItem('booking_selectedCombos');
              localStorage.removeItem('booking_transactionId');
            } else {
              setStatus('error');
              setMessage(transactionResponse.message || 'Transaction validation failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment validation error:', error);
            setStatus('error');
            setMessage('An error occurred during payment validation. Please contact customer support.');
          }
        } else {
          // Handle non-success response codes
          handlePaymentStatus(vnp_ResponseCode, amount);
        }
      } catch (error: any) {
        console.error('Payment validation error:', error);
        setStatus('error');
        
        // Provide more details in the error message to help with debugging
        let errorMessage = 'An error occurred while validating your payment. Please contact customer support.';
        
        // Try to get more detailed error information
        if (error.response) {
          console.error('Error response:', error.response);
          errorMessage = `Validation error: ${error.response.status} - ${error.response.data?.message || error.message}`;
        } else if (error.request) {
          console.error('Error request:', error.request);
          errorMessage = 'Network error: No response received from the server. Please try again.';
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        setMessage(errorMessage);
      }
    };

    validatePayment();
  }, [location, currentUser]);
  
  // Helper function to handle different payment status codes
  const handlePaymentStatus = (vnp_ResponseCode: string | null, amount: number) => {
    if (vnp_ResponseCode === '00') {
      setStatus('success');
      setMessage(`Your payment of ${new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
      }).format(amount)} was completed successfully.`);
      
      // Set payment success state in localStorage
      localStorage.setItem('booking_payment_success', 'true');
    } else {
      setStatus('error');
      
      // Different error messages based on response code
      switch(vnp_ResponseCode) {
        case '24':
          setMessage('Payment was cancelled by user.');
          break;
        case '51':
          setMessage('Insufficient funds in your account.');
          break;
        case '02':
          setMessage('Invalid transaction information.');
          break;
        case '09':
          setMessage('Transaction timeout. Please try again.');
          break;
        default:
          setMessage('Payment failed. Please try again.');
      }
    }
  };

  const handleReturnHome = () => {
    navigate('/'); // Home page
  };

  const handleViewTicket = () => {
    // Navigate to dashboard with booking history tab active
    navigate('/dashboard?tab=history');
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-secondary-800 rounded-xl p-8 w-full max-w-md">
          {status === 'loading' && (
            <div className="text-center py-12">
              <Loader2 className="animate-spin h-16 w-16 mx-auto text-primary-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
              <p className="text-secondary-400">Please wait while we verify your payment...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto text-success-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Payment Successful!</h2>
              <p className="text-secondary-400 mb-4">{message}</p>
              
              <div className="bg-secondary-700 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-lg font-medium text-white mb-2">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  {orderInfo && (
                    <div className="flex justify-between">
                      <span className="text-secondary-400">Movie:</span>
                      <span className="text-white">{orderInfo}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-secondary-400">Amount:</span>
                    <span className="text-white">{new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(paymentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-400">Transaction ID:</span>
                    <span className="text-white font-mono text-xs">{transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-400">Date:</span>
                    <span className="text-white">{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button onClick={handleViewTicket} className="w-full">
                  View My Ticket
                </Button>
                <Button variant="secondary" onClick={handleReturnHome} className="w-full">
                  Return to Home
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <XCircle className="h-16 w-16 mx-auto text-error-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Payment Failed</h2>
              <p className="text-secondary-400 mb-4">{message}</p>
              
              {validationError && (
                <div className="bg-error-900/20 border border-error-500/30 rounded-lg p-4 mb-6 text-left">
                  <p className="text-error-400">{validationError}</p>
                </div>
              )}
              
              {transactionId && (
                <div className="bg-secondary-700 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-lg font-medium text-white mb-2">Transaction Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary-400">Transaction ID:</span>
                      <span className="text-white font-mono text-xs">{transactionId}</span>
                    </div>
                    {orderInfo && (
                      <div className="flex justify-between">
                        <span className="text-secondary-400">Order:</span>
                        <span className="text-white">{orderInfo}</span>
                      </div>
                    )}
                    {paymentAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-secondary-400">Amount:</span>
                        <span className="text-white">{new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND' 
                        }).format(paymentAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <Button onClick={() => navigate(-1)} className="w-full">
                  Try Again
                </Button>
                <Button variant="secondary" onClick={handleReturnHome} className="w-full">
                  Return to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PaymentReturn;
