import React, { useEffect, useState } from 'react';
import { Calendar, CreditCard, CheckCircle, XCircle, Clock, Download, ExternalLink, Search, TicketIcon, ChevronDown, ChevronRight, Filter, SortDesc, Eye, User, Mail, DollarSign, Clock3 } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

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
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'FAILED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
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

      const matchesStatus = statusFilter === 'all' || tx.paymentstatus === statusFilter;

      return matchesSearch && filterByDate(inv) && matchesStatus;
    })
    .sort((a, b) => {
      const aDate = new Date(a.createdat).getTime();
      const bDate = new Date(b.createdat).getTime();
      const aAmount = transactionMap[a.invoiceid]?.price || 0;
      const bAmount = transactionMap[b.invoiceid]?.price || 0;

      switch (sortBy) {
        case 'date-desc':
          return bDate - aDate;
        case 'date-asc':
          return aDate - bDate;
        case 'amount-desc':
          return bAmount - aAmount;
        case 'amount-asc':
          return aAmount - bAmount;
        default:
          return bDate - aDate;
      }
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

  // Calculate summary stats
  const totalAmount = filteredInvoices.reduce((sum, inv) => {
    return sum + (transactionMap[inv.invoiceid]?.price || 0);
  }, 0);

  const statusCounts = filteredInvoices.reduce((acc, inv) => {
    const status = transactionMap[inv.invoiceid]?.paymentstatus || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/20">
            <TicketIcon className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Invoice & Transaction Management</h1>
            <p className="text-slate-400 mt-1">Monitor and manage all system transactions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Transactions</p>
                <p className="text-2xl font-bold text-white mt-1">{filteredInvoices.length}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{statusCounts.COMPLETED || 0}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-white mt-1">{statusCounts.PENDING || 0}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Clock3 className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{statusCounts.FAILED || 0}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Search and Filter Bar */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or account ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 appearance-none min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              <select
                value={dateFilter}
                onChange={e => {
                  setDateFilter(e.target.value);
                  setSelectedDate('');
                }}
                className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 min-w-[120px]"
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
                  className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50"
                />
              )}

              <div className="relative">
                <SortDesc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500/50 appearance-none min-w-[160px]"
                >
                  <option value="date-desc">Latest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="amount-desc">Highest Amount</option>
                  <option value="amount-asc">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-slate-400 text-lg">Loading transactions...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-slate-800/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No transactions found</h3>
            <p className="text-slate-400 max-w-md mx-auto">No transactions match your current filters. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMonthKeys.map((key) => {
              const [year, month] = key.split('-').map(Number);
              const isOpen = openMonths[key] ?? false; // Default to closed
              const monthInvoices = invoicesByMonth[key];
              const monthTotal = monthInvoices.reduce((sum, inv) => sum + (transactionMap[inv.invoiceid]?.price || 0), 0);
              
              return (
                <div key={key} className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800/50 to-slate-700/30 hover:from-slate-700/50 hover:to-slate-600/30 transition-all duration-200"
                    onClick={() => toggleMonth(key)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-white">{getMonthName(year, month)}</h3>
                        <p className="text-sm text-slate-400">
                          {monthInvoices.length} transactions • {formatCurrency(monthTotal)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium">
                        {monthInvoices.length}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="w-5 h-5 text-slate-400 transition-transform" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400 transition-transform" />
                      )}
                    </div>
                  </button>
                  
                  <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                    {isOpen && (
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                          {[...monthInvoices]
                            .sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime())
                            .map((inv) => {
                              const tx = transactionMap[inv.invoiceid];
                              const user = userMap[inv.accountid];
                              
                              return (
                                <div
                                  key={inv.invoiceid}
                                  className="bg-slate-900/50 backdrop-blur border border-slate-700/50 rounded-lg p-5 hover:bg-slate-900/70 hover:border-slate-600/50 transition-all duration-200 group"
                                >
                                  {/* Status Badge */}
                                  <div className="flex items-center justify-between mb-4">
                                    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-full border text-xs font-medium ${getStatusColor(tx?.paymentstatus)}`}>
                                      {getStatusIcon(tx?.paymentstatus)}
                                      <span>{tx?.paymentstatus || 'N/A'}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">{formatDate(inv.createdat)}</span>
                                  </div>
                                  
                                  {/* User Info */}
                                  <div className="space-y-3 mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <User className="w-4 h-4 text-blue-400" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-white font-medium truncate">{user?.displayName || 'Unknown User'}</p>
                                        <p className="text-xs text-slate-400 truncate">{user?.email || 'No email'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Transaction Details */}
                                  <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Invoice ID:</span>
                                      <span className="text-white font-mono text-xs">{inv.invoiceid.slice(0, 8)}...</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Payment:</span>
                                      <span className="text-white">{tx?.paymentmethod || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                                      <span className="text-slate-400 font-medium">Amount:</span>
                                      <span className="text-emerald-400 font-bold text-lg">{formatCurrency(tx?.price ?? 0)}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex gap-2">
                                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors text-sm font-medium">
                                      <Download className="w-4 h-4" />
                                      <span>Download</span>
                                    </button>
                                    <button
                                      onClick={() => navigate(`/invoiceAdmin/${inv.invoiceid}`)}
                                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                      <Eye className="w-4 h-4" />
                                      <span>View</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
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