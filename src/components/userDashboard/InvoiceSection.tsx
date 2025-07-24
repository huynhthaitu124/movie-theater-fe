import React, { useState, useEffect } from 'react';
import { Receipt, Download, Building, Film, MapPin, Home, Calendar, Clock, ArrowLeft, Ticket, CreditCard, User, Star, Phone, Users } from 'lucide-react';
import { invoiceService } from '../../services/modules/invoice.service';
import { transactionService } from '../../services/modules/transaction.service';
import { invoiceDetailService } from '../../services/modules/invoiceDetail.service';
import { scheduleService } from '../../services/modules/schedule.service';
import { seatService } from '../../services/modules/seat.service';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { movieService } from '../../services/modules/movie.service';
import { cinemaService } from '../../services/modules/cinema.service';

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

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!selectedInvoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="p-4 bg-slate-800/50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Receipt className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Invoice Not Found</h3>
          <p className="text-slate-400 mb-6">The invoice you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/admin/invoices')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  // Render only the selected invoice
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg transition-all duration-200 mb-6 backdrop-blur border border-slate-700/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/20">
              <Receipt className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Invoice Details</h1>
              <p className="text-slate-400">Transaction ID: {selectedInvoice.invoiceid.slice(0, 12)}...</p>
            </div>
          </div>
        </div>

        {/* Main Invoice Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-slate-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Building className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">CinemaMax</h2>
                  <p className="text-slate-400">Premium Cinema Experience</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm">Invoice Date</p>
                <p className="text-white font-semibold">{formatDateTime(selectedInvoice.createdat)}</p>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <Ticket className="w-5 h-5 text-emerald-400" />
                  <span className="text-slate-400 text-sm">Total Amount</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(transactionPrices[selectedInvoice.invoiceid] ?? 0)}
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-400 text-sm">Payment Status</span>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium">
                  Completed
                </span>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-slate-400 text-sm">Seats Booked</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">{seatDetails.length}</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Movie Information */}
            {detailsLoading ? (
              <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/50">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-slate-700 rounded w-1/4"></div>
                  <div className="flex gap-6">
                    <div className="w-32 h-44 bg-slate-700 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {movieInfo && (
                  <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-6">
                      <Film className="w-6 h-6 text-blue-400" />
                      <h3 className="text-xl font-bold text-white">Movie Details</h3>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <img 
                          src={movieInfo.image} 
                          alt={movieInfo.movieName} 
                          className="w-48 h-64 object-cover rounded-xl border border-slate-700/50 shadow-lg"
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <h4 className="text-2xl font-bold text-white mb-4">{movieInfo.movieName}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <User className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-400 text-sm">Director:</span>
                              <span className="text-white font-medium">{movieInfo.director}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-400 text-sm">Duration:</span>
                              <span className="text-white font-medium">{movieInfo.duration} minutes</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Star className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-400 text-sm">Minimum Age:</span>
                              <span className="text-white font-medium">{movieInfo.minimumAge}+</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400 text-sm">Language:</span>
                              <span className="text-white font-medium">{movieInfo.movieLanguage}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-slate-400 text-sm mt-1">Cast:</span>
                              <span className="text-white font-medium">{movieInfo.actor}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-700/50">
                          <p className="text-slate-300 text-sm leading-relaxed">{movieInfo.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cinema Information */}
                {cinemaInfo && (
                  <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-6">
                      <MapPin className="w-6 h-6 text-blue-400" />
                      <h3 className="text-xl font-bold text-white">Cinema Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-slate-400 text-sm mb-1">Cinema Name</p>
                          <p className="text-white font-semibold text-lg">{cinemaInfo.cinemaname}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm mb-1">Address</p>
                          <p className="text-white">{cinemaInfo.address}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-slate-400 text-sm mb-1">City</p>
                          <p className="text-white font-medium">{cinemaInfo.city}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-400 text-sm">Phone:</span>
                          <span className="text-white font-medium">{cinemaInfo.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Showtime Information */}
                {scheduleInfo && (
                  <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-6">
                      <Calendar className="w-6 h-6 text-blue-400" />
                      <h3 className="text-xl font-bold text-white">Showtime Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                        <div className="flex items-center gap-3 mb-2">
                          <Home className="w-5 h-5 text-purple-400" />
                          <span className="text-slate-400 text-sm">Room number</span>
                        </div>
                        <p className="text-white font-semibold text-lg">{scheduleInfo.roomName}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-5 h-5 text-emerald-400" />
                          <span className="text-slate-400 text-sm">Show Date</span>
                        </div>
                        <p className="text-white font-semibold">
                          {new Date(scheduleInfo.showDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-5 h-5 text-blue-400" />
                          <span className="text-slate-400 text-sm">Show Time</span>
                        </div>
                        <p className="text-white font-semibold text-lg">{scheduleInfo.showTime}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Seat Information */}
            {seatDetails.length > 0 && (
              <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <Ticket className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Selected Seats</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {seatDetails.map((seat, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 text-center"
                    >
                      <div className="text-lg font-bold text-blue-400 mb-1">{seat.seatCode}</div>
                      <div className="text-xs text-slate-400 mb-2">{seat.seatTypeName}</div>
                      <div className="text-sm font-semibold text-white">{formatCurrency(seat.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/50">
              <div className="text-center mb-6">
                <p className="text-slate-300 text-lg font-semibold mb-2">Thank you for choosing CinemaMax!</p>
                <p className="text-slate-400">Enjoy your movie experience</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => downloadInvoice(selectedInvoice)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  Download Invoice PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSection;