import React, { useState, useEffect } from 'react';
import { Receipt, Download, Building, Film, MapPin, Home, Calendar, Clock } from 'lucide-react';
import { invoiceService } from '../../../services/modules/invoice.service';
import { transactionService } from '../../../services/modules/transaction.service';
import { invoiceDetailService } from '../../../services/modules/invoiceDetail.service';
import { scheduleService } from '../../../services/modules/schedule.service';
import { seatService } from '../../../services/modules/seat.service';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

import { movieService } from '../../../services/modules/movie.service';
import { cinemaService } from '../../../services/modules/cinema.service';

const InvoiceSection: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { invoiceid } = useParams();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [transactionPrices, setTransactionPrices] = useState<Record<string, number>>({});
  const [scheduleInfo, setScheduleInfo] = useState<any>(null);
  const [seatDetails, setSeatDetails] = useState<Array<{
    seatCode: string;
    seatTypeName: string;
    price: number;
  }>>([]);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [movieInfo, setMovieInfo] = useState<any>(null);
  const [cinemaInfo, setCinemaInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (currentUser?.accountid) {
          // Fetch invoices and transactions in parallel
          const [invoiceRes, transactionRes] = await Promise.all([
            invoiceService.getByAccountId(currentUser.accountid),
            transactionService.getByAccountId(currentUser.accountid),
          ]);
          console.log('Invoices:', invoiceRes.data);
          console.log('Transactions:', transactionRes.data);
          setInvoices(invoiceRes.data || []);
          setTransactions(transactionRes.data || []);
        }
      } catch (error) {
        setInvoices([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  // Filter invoices to only those that have a matching invoiceid in transactions
  const transactionInvoiceIds = new Set(transactions.map((t: any) => t.invoiceid));
  const filteredInvoices = invoices.filter((inv: any) => transactionInvoiceIds.has(inv.invoiceid));

  useEffect(() => {
    const fetchTransactionPrices = async () => {
      const prices: Record<string, number> = {};
      for (const invoice of filteredInvoices) {
        try {
          const res = await transactionService.getTransactionByInvoiceId(invoice.invoiceid);
          const transaction = Array.isArray(res.data) ? res.data[0] : res.data;
          prices[invoice.invoiceid] = transaction?.price || 0;
        } catch {
          prices[invoice.invoiceid] = 0;
        }
      }
      setTransactionPrices(prices);
    };

    if (filteredInvoices.length) {
      fetchTransactionPrices();
    }
  }, [filteredInvoices]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const downloadInvoice = (invoice: any) => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = `invoice-${invoice.invoiceid}.pdf`;
    link.click();
  };

  // Only show the invoice that matches the invoiceid from the URL
  const selectedInvoice = invoices.find((inv: any) => inv.invoiceid === invoiceid);

  // Fetch detailed information for the selected invoice
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!selectedInvoice || !invoiceid) return;
      setDetailsLoading(true);
      try {
        // Get invoice details to find schedule and seat information
        const invoiceDetailsResponse = await invoiceDetailService.getByInvoiceId(invoiceid);
        const invoiceDetails = invoiceDetailsResponse.data || [];
        const seatDetailsArr = invoiceDetails.filter(detail => detail.seatid);

        let scheduleInfoData = null;
        let seatInfoData: Array<{ seatCode: string; seatTypeName: string; price: number }> = [];
        let movieId = null;
        let cinemaId = null;

        // Try to get schedule from invoice directly if available
        if (selectedInvoice.scheduleid) {
          try {
            const allSchedulesResponse = await scheduleService.getAll();
            const allSchedules = allSchedulesResponse.data || [];
            const schedule = allSchedules.find(s => s.scheduleId === selectedInvoice.scheduleid);
            console.log('Schedule:', schedule);
            if (schedule) {
              scheduleInfoData = {
                movieName: schedule.moviename || 'Unknown Movie',
                roomName: schedule.roomnumber || 'Unknown Room',
                showTime: schedule.starttime,
                showDate: schedule.showdate,
              };
              movieId = schedule.movieId || schedule.movieid;
              cinemaId = schedule.cinemaId || schedule.cinemaid;
            }
            console.log('Schedule Info:', scheduleInfoData);
          } catch (error) {
            console.error('Error fetching schedule from invoice:', error);
          }
        }

        // Fetch movie info
        if (movieId) {
          try {
            const movieRes = await movieService.getAll();
            const movie = (movieRes.data || []).find((m: any) => m.movieID === movieId || m.movieId === movieId);
            setMovieInfo(movie || null);
          } catch (error) {
            setMovieInfo(null);
          }
        }

        // Fetch cinema info
        if (cinemaId) {
          try {
            const cinemaRes = await cinemaService.getAll();
            const cinema = (cinemaRes.data || []).find((c: any) => c.cinemaid === cinemaId);
            setCinemaInfo(cinema || null);
          } catch (error) {
            setCinemaInfo(null);
          }
        }

        // Fetch seat information for each seat
        if (seatDetailsArr.length > 0) {
          try {
            const allSeatsResponse = await seatService.getAll();
            const allSeats = allSeatsResponse.data || [];
            for (const seatDetail of seatDetailsArr) {
              if (seatDetail.seatid) {
                const seat = allSeats.find((s: any) => s.seatId === seatDetail.seatid);
                if (seat) {
                  seatInfoData.push({
                    seatCode: `${seat.row}${seat.number}`,
                    seatTypeName: seat.seatTypeName || 'Standard',
                    price: seatDetail.amount
                  });
                }
              }
            }
          } catch (error) {
            console.error('Error fetching seat details:', error);
          }
        }

        setScheduleInfo(scheduleInfoData);
        setSeatDetails(seatInfoData);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchInvoiceDetails();
  }, [selectedInvoice, invoiceid]);

  if (loading) {
    return <div className="text-white">Loading invoice...</div>;
  }

  if (!selectedInvoice) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Invoice not found</h3>
        <p className="text-gray-400">No invoice matches this transaction.</p>
      </div>
    );
  }

  // Render only the selected invoice
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <button
          onClick={() => navigate('/admin/invoices')}
          className="mb-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600 transition-colors"
        >
          ← Back to Invoices
        </button>
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 mb-6">
          <div className="p-6 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-white">Invoice #{selectedInvoice.invoiceid}</h2>
              <p className="text-gray-300">Date: {formatDate(selectedInvoice.createdat)}</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">CinemaMax</h1>
            </div>
            {/* <div className="border-t border-b border-gray-600 py-6 mb-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-white mb-2">Invoice Information</h3>
                  <p className="text-sm text-gray-400">Invoice #: {selectedInvoice.invoiceid.slice(0, 8)}...</p>
                  <p className="text-sm text-gray-400">Date: {formatDate(selectedInvoice.createdat)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">Account ID</h3>
                  <p className="text-sm text-gray-400">{selectedInvoice.accountid.slice(0, 8)}...</p>
                </div>
              </div>
            </div> */}

            {/* Movie & Cinema Information */}
            {detailsLoading ? (
              <div className="mb-6 p-6 bg-gray-700/50 rounded-lg">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            ) : (
              <>
                {movieInfo && (
                  <div className="mb-6 p-6 bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 text-blue-400">Movie Details</h3>
                    <div className="flex flex-col md:flex-row gap-6">
                      <img src={movieInfo.image} alt={movieInfo.movieName} className="w-32 h-44 object-cover rounded-lg border border-gray-600" />
                      <div className="flex-1 space-y-2">
                        <div><span className="text-gray-400">Title: </span><span className="text-white font-semibold">{movieInfo.movieName}</span></div>
                        <div><span className="text-gray-400">Director: </span><span className="text-white">{movieInfo.director}</span></div>
                        <div><span className="text-gray-400">Actors: </span><span className="text-white">{movieInfo.actor}</span></div>
                        <div><span className="text-gray-400">Duration: </span><span className="text-white">{movieInfo.duration} min</span></div>
                        <div><span className="text-gray-400">Language: </span><span className="text-white">{movieInfo.movieLanguage}</span></div>
                        <div><span className="text-gray-400">Minimum Age: </span><span className="text-white">{movieInfo.minimumAge}+</span></div>
                        <div><span className="text-gray-400">Description: </span><span className="text-white">{movieInfo.description}</span></div>
                      </div>
                    </div>
                  </div>
                )}
                {cinemaInfo && (
                  <div className="mb-6 p-6 bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 text-blue-400">Cinema Details</h3>
                    <div className="space-y-2">
                      <div><span className="text-gray-400">Name: </span><span className="text-white font-semibold">{cinemaInfo.cinemaname}</span></div>
                      <div><span className="text-gray-400">Address: </span><span className="text-white">{cinemaInfo.address}</span></div>
                      <div><span className="text-gray-400">City: </span><span className="text-white">{cinemaInfo.city}</span></div>
                      <div><span className="text-gray-400">Phone: </span><span className="text-white">{cinemaInfo.phone}</span></div>
                    </div>
                  </div>
                )}
                {scheduleInfo && (
                  <div className="mb-6 p-6 bg-gray-700/50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 text-blue-400">Showtime & Room Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                          <Film className="w-4 h-4" />
                          <span>Movie</span>
                        </div>
                        <p className="font-medium text-white">{scheduleInfo.movieName}</p>
                      </div>
                      {/* <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span>Cinema</span>
                        </div>
                        <p className="font-medium text-white">{scheduleInfo.cinemaName}</p>
                      </div> */}
                      <div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                          <Home className="w-4 h-4" />
                          <span>Room</span>
                        </div>
                        <p className="font-medium text-white">{scheduleInfo.roomName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 pt-3 border-t border-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Show Date:</span>
                        <span className="font-medium text-white">
                          {new Date(scheduleInfo.showDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Show Time:</span>
                        <span className="font-medium text-white">{scheduleInfo.showTime}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Seat Information */}
            {seatDetails.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4 text-blue-400">Seat Details</h3>
                <div className="flex flex-wrap gap-2">
                  {seatDetails.map((seat, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium border border-blue-600/30"
                    >
                      {seat.seatCode} - {seat.seatTypeName} - {formatCurrency(seat.price)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              {/* <h3 className="font-medium text-white mb-4">Booking Details</h3>
              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-600">
                      <td className="px-4 py-3 text-sm text-gray-400 font-semibold">invoiceid</td>
                      <td className="px-4 py-3 text-sm text-white">{selectedInvoice.invoiceid}</td>
                    </tr>
                    <tr className="border-b border-gray-600">
                      <td className="px-4 py-3 text-sm text-gray-400 font-semibold">accountid</td>
                      <td className="px-4 py-3 text-sm text-white">{selectedInvoice.accountid}</td>
                    </tr>
                    <tr className="border-b border-gray-600">
                      <td className="px-4 py-3 text-sm text-gray-400 font-semibold">promotionid</td>
                      <td className="px-4 py-3 text-sm text-white">{selectedInvoice.promotionid || 'null'}</td>
                    </tr>
                    <tr className="border-b border-gray-600">
                      <td className="px-4 py-3 text-sm text-gray-400 font-semibold">staffid</td>
                      <td className="px-4 py-3 text-sm text-white">{selectedInvoice.staffid || 'null'}</td>
                    </tr>
                    <tr className="border-b border-gray-600">
                      <td className="px-4 py-3 text-sm text-gray-400 font-semibold">scheduleid</td>
                      <td className="px-4 py-3 text-sm text-white">{selectedInvoice.scheduleid || 'Not Available'}</td>
                    </tr>
                    <tr className="border-b border-gray-600">
                      <td className="px-4 py-3 text-sm text-gray-400 font-semibold">bookingdate</td>
                      <td className="px-4 py-3 text-sm text-white">{formatDate(selectedInvoice.bookingdate || selectedInvoice.createdat)}</td>
                    </tr>
                    <tr className="border-b border-gray-600">
                      <td className="px-4 py-3 text-sm text-gray-400 font-semibold">usedscore</td>
                      <td className="px-4 py-3 text-sm text-white">{selectedInvoice.usedscore || '0'}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-400 font-semibold">isactive</td>
                      <td className="px-4 py-3 text-sm text-white">{selectedInvoice.isactive ? 'true' : 'false'}</td>
                    </tr>
                  </tbody>
                </table>
              </div> */}
            </div>
            <div className="border-t border-gray-600 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-blue-400">Total Amount</span>
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(transactionPrices[selectedInvoice.invoiceid] ?? 0)}
                </span>
              </div>
            </div>
            <div className="mt-8 text-center text-sm text-gray-400">
              <p>Thank you for choosing CinemaMax!</p>
              <p>For support, please contact us at support@cinemamax.com</p>
            </div>
          </div>
          <div className="p-6 border-t border-gray-700 bg-gray-700/50">
            <div className="flex space-x-4">
              <button
                onClick={() => downloadInvoice(selectedInvoice)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSection;