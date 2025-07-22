import React, { useEffect, useState } from 'react';
import { Calendar, CreditCard, CheckCircle, XCircle, Clock, Download, ExternalLink, Search, TicketIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { invoiceService } from '../../../services/modules/invoice.service';
import { transactionService } from '../../../services/modules/transaction.service';
import Layout from '../../../components/layout/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../../services/modules/user.service';

// Helper to group by month-year
function groupByMonth(invoices: any[]) {
  return invoices.reduce((acc, inv) => {
    const date = new Date(inv.createdat);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`; // e.g., "2025-7"
    if (!acc[key]) acc[key] = [];
    acc[key].push(inv);
    return acc;
  }, {} as Record<string, any[]>);
}

// Helper to get month name
function getMonthName(year: number, month: number) {
  return `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`;
}

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'day' | 'week' | 'month'
  const [selectedDate, setSelectedDate] = useState<string>(''); // For day/week/month

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [invoiceRes, transactionRes, userRes] = await Promise.all([
          invoiceService.getAll(),
          transactionService.getAll(),
          userService.getAll(),
        ]);
        setInvoices(invoiceRes.data || []);
        setTransactions(transactionRes.data || []);
        setUsers(userRes.data || []);
        // Map users by accountid for quick lookup
        const map: Record<string, any> = {};
        (userRes.data || []).forEach((u: any) => {
          map[u.accountId] = u;
        });
        setUserMap(map);
      } catch (error) {
        setInvoices([]);
        setTransactions([]);
        setUsers([]);
        setUserMap({});
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Helper functions
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  // Map transactions by invoiceid for quick lookup
  const transactionMap = transactions.reduce((acc, tx) => {
    acc[tx.invoiceid] = tx;
    return acc;
  }, {} as Record<string, any>);

  // --- Filtering logic ---
  const filterByDate = (invoice: any) => {
    if (dateFilter === 'all' || !selectedDate) return true;
    const created = new Date(invoice.createdat);
    const selected = new Date(selectedDate);

    if (dateFilter === 'day') {
      return (
        created.getFullYear() === selected.getFullYear() &&
        created.getMonth() === selected.getMonth() &&
        created.getDate() === selected.getDate()
      );
    }
    if (dateFilter === 'week') {
      // Get week number for both dates
      const getWeek = (d: Date) => {
        const onejan = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d as any) - (onejan as any)) / 86400000 + onejan.getDay() + 1) / 7);
      };
      return (
        created.getFullYear() === selected.getFullYear() &&
        getWeek(created) === getWeek(selected)
      );
    }
    if (dateFilter === 'month') {
      return (
        created.getFullYear() === selected.getFullYear() &&
        created.getMonth() === selected.getMonth()
      );
    }
    return true;
  };

  const filteredInvoices = invoices
    .filter((inv) => {
      const tx = transactionMap[inv.invoiceid];
      if (!tx || !tx.transactionid) return false;

      // Search by displayName or accountid
      const user = userMap[inv.accountid];
      const displayName = user?.displayName?.toLowerCase() || '';
      const email = user?.email?.toLowerCase() || '';
      const accountid = (inv.accountid || '').toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        displayName.includes(search) ||
        email.includes(search) ||
        accountid.includes(search);

      return matchesSearch && filterByDate(inv);
    });

  // Group filtered invoices by month
  const invoicesByMonth = groupByMonth(filteredInvoices);

  // Sort months descending (latest first)
  const sortedMonthKeys = Object.keys(invoicesByMonth).sort((a, b) => {
    const [ay, am] = a.split('-').map(Number);
    const [by, bm] = b.split('-').map(Number);
    return by - ay || bm - am;
  });

  // Dropdown open state for each month
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});

  const toggleMonth = (key: string) => {
    setOpenMonths((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center gap-4">
            <TicketIcon className="w-8 h-8 mb-6 text-primary-500" />
            <h1 className="text-2xl font-bold mb-6 text-white">Invoice & Transaction Management</h1>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6 space-y-2 md:space-y-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
            <input
              type="text"
              placeholder="Search by Display Name, Email, or Account ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={dateFilter}
            onChange={e => {
              setDateFilter(e.target.value);
              setSelectedDate('');
            }}
            className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Dates</option>
            <option value="day">By Day</option>
            <option value="month">By Month</option>
          </select>
          {dateFilter !== 'all' && (
            <input
              type={dateFilter === 'month' ? 'month' : 'date'}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
            />
          )}
        </div>
        {loading ? (
          <div className="text-white text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No invoices found</h3>
            <p className="text-gray-400">No invoices or transactions available.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedMonthKeys.map((key) => {
              const [year, month] = key.split('-').map(Number);
              const isOpen = openMonths[key] ?? true; // Default to open
              return (
                <div key={key} className="border border-gray-700 rounded-lg bg-secondary-800/40">
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 bg-secondary-900/60 hover:bg-secondary-900/80 rounded-t-lg transition-colors"
                    onClick={() => toggleMonth(key)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-primary-400">{getMonthName(year, month)}</span>
                      <span className="text-xs text-secondary-400">
                        ({invoicesByMonth[key].length} transactions)
                      </span>
                    </div>
                    <span>
                      {isOpen ? (
                        <ChevronDown className="w-6 h-6 text-secondary-400" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-secondary-400" />
                      )}
                    </span>
                  </button>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[2000px] py-4' : 'max-h-0 py-0'}`}
                  >
                    {isOpen && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 px-4">
                        {[...invoicesByMonth[key]]
                          .sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime())
                          .map((inv) => {
                            const tx = transactionMap[inv.invoiceid];
                            return (
                              <div
                                key={inv.invoiceid}
                                className="border border-gray-600 rounded-lg p-4 bg-gray-700/50 text-sm mb-4 hover:bg-gray-700 transition duration-200"
                              >
                                <div className="flex flex-col h-full p-2">
                                  <div className="flex items-center space-x-2 mb-2">
                                    {getStatusIcon(tx?.paymentstatus)}
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx?.paymentstatus)}`}>
                                      {tx?.paymentstatus || 'N/A'}
                                    </span>
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-400">Invoice:</span>
                                    <span className="ml-1">{(inv.invoiceid || '').slice(0, 8)}...</span>
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-400">Transaction:</span>
                                    <span className="ml-1">{(tx?.transactionid || '').slice(0, 8)}...</span>
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-400">Created:</span>
                                    <span className="ml-1">{formatDate(inv.createdat)}</span>
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-400">Payment:</span>
                                    <span className="ml-1">{tx?.paymentmethod || '-'}</span>
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-400">Amount:</span>
                                    <span className="ml-1 font-bold">{formatCurrency(tx?.price ?? inv.total ?? 0)}</span>
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-400">Account:</span>
                                    <span className="ml-1 text-white">{userMap[inv.accountid]?.displayName || 'N/A'}</span>
                                  </div>
                                  <div className="mb-2">
                                    <span className="text-xs text-gray-400">Email:</span>
                                    <span className="ml-1 text-white">{userMap[inv.accountid]?.email.slice(0, 20) || 'None'}...</span>
                                  </div>
                                  <div className="flex space-x-2 mt-auto pt-2">
                                    <button className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 text-xs">
                                      <Download className="w-4 h-4" />
                                      <span>Download</span>
                                    </button>
                                    <button
                                      onClick={() => navigate(`/invoiceAdmin/${inv.invoiceid}`)}
                                      className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-xs"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                      <span>Details</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InvoiceManagement;