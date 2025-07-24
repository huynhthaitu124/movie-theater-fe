import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Film, 
  Users, 
  UserCircle, 
  Activity,
  Calendar,
  Ticket as TicketIcon,
  DollarSign
} from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import { movieService } from '../../services/modules/movie.service';
import { staffService } from '../../services/modules/staff.service';
import { transactionService } from '../../services/modules/transaction.service';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, value, icon, change, changeType = 'neutral' 
}) => {
  const changeColorClass = 
    changeType === 'increase' 
      ? 'text-success-500' 
      : changeType === 'decrease' 
        ? 'text-accent-500' 
        : 'text-secondary-500';

  return (
    <div className="bg-secondary-800 rounded-lg p-6 shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-secondary-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${changeColorClass} flex items-center`}>
                {changeType === 'increase' && <TrendingUp size={14} className="mr-1" />}
                {changeType === 'decrease' && <TrendingUp size={14} className="mr-1 transform rotate-180" />}
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-secondary-700 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon, link }) => (
  <Link 
    to={link}
    className="bg-secondary-800 rounded-lg p-6 shadow-md hover:bg-secondary-700 transition-colors"
  >
    <div className="flex items-start">
      <div className="p-3 bg-secondary-700 rounded-full mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-secondary-400">{description}</p>
      </div>
    </div>
  </Link>
);

const Dashboard: React.FC = () => {
  const [movieCount, setMovieCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalBookings, setTotalBookings] = useState<number>(0);
  
  // Comparison data for last month
  const [lastMonthRevenue, setLastMonthRevenue] = useState<number>(0);
  const [lastMonthBookings, setLastMonthBookings] = useState<number>(0);
  const [revenueChange, setRevenueChange] = useState<string>('');
  const [bookingChange, setBookingChange] = useState<string>('');
  const [revenueChangeType, setRevenueChangeType] = useState<'increase' | 'decrease' | 'neutral'>('neutral');
  const [bookingChangeType, setBookingChangeType] = useState<'increase' | 'decrease' | 'neutral'>('neutral');

  useEffect(() => {
    // Fetch total movies (active only)
    movieService.getAll().then(res => {
      const activeMovies = (res.data || []).filter((movie: any) => movie.status !== 'INACTIVE');
      setMovieCount(activeMovies.length || 0);
    });
    // Fetch total staff
    staffService.getAll().then(res => {
      setStaffCount(res.data?.length || 0);
    });
    // Fetch transactions for revenue and booking count
    transactionService.getAll?.().then(res => {
      const transactions = res.data || [];
      
      // Calculate current month data
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Calculate last month data
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      // Filter transactions for current month
      const currentMonthTransactions = transactions.filter((t: any) => {
        if (!t.paymentdate) return false;
        const date = new Date(t.paymentdate);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      
      // Filter transactions for last month
      const lastMonthTransactions = transactions.filter((t: any) => {
        if (!t.paymentdate) return false;
        const date = new Date(t.paymentdate);
        return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
      });
      
      // Calculate current month metrics
      const currentMonthBookings = currentMonthTransactions.length;
      const currentMonthRevenue = currentMonthTransactions.reduce((sum: number, t: any) => sum + (t.price || 0), 0);
      
      // Calculate last month metrics
      const lastMonthBookingsCount = lastMonthTransactions.length;
      const lastMonthRevenueAmount = lastMonthTransactions.reduce((sum: number, t: any) => sum + (t.price || 0), 0);
      
      // Set total values (all transactions)
      setTotalBookings(transactions.length);
      const totalRevenueAmount = transactions.reduce((sum: number, t: any) => sum + (t.price || 0), 0);
      setTotalRevenue(totalRevenueAmount);
      
      // Set last month values
      setLastMonthBookings(lastMonthBookingsCount);
      setLastMonthRevenue(lastMonthRevenueAmount);
      
      // Calculate percentage changes
      const revenuePercentChange = lastMonthRevenueAmount > 0 
        ? ((currentMonthRevenue - lastMonthRevenueAmount) / lastMonthRevenueAmount * 100)
        : (currentMonthRevenue > 0 ? 100 : 0);
      
      const bookingPercentChange = lastMonthBookingsCount > 0 
        ? ((currentMonthBookings - lastMonthBookingsCount) / lastMonthBookingsCount * 100)
        : (currentMonthBookings > 0 ? 100 : 0);
      
      // Set revenue change
      if (Math.abs(revenuePercentChange) < 0.1) {
        setRevenueChange('No change vs. last month');
        setRevenueChangeType('neutral');
      } else {
        setRevenueChange(`${revenuePercentChange >= 0 ? '+' : ''}${revenuePercentChange.toFixed(1)}% vs. last month`);
        setRevenueChangeType(revenuePercentChange >= 0 ? 'increase' : 'decrease');
      }
      
      // Set booking change
      if (Math.abs(bookingPercentChange) < 0.1) {
        setBookingChange('No change vs. last month');
        setBookingChangeType('neutral');
      } else {
        setBookingChange(`${bookingPercentChange >= 0 ? '+' : ''}${bookingPercentChange.toFixed(1)}% vs. last month`);
        setBookingChangeType(bookingPercentChange >= 0 ? 'increase' : 'decrease');
      }
      
      // Calculate monthly revenue
      const monthlyData = calculateMonthlyRevenue(transactions);
      setMonthlyRevenue(monthlyData);
      
      // Calculate weekly revenue
      const weeklyData = calculateWeeklyRevenue(transactions);
      setWeeklyRevenue(weeklyData);
    });
  }, []);

  // Calculate weekly revenue from transactions
  const calculateWeeklyRevenue = (transactions: any[]) => {
    const now = new Date();
    const thisWeekData: { [key: string]: number } = {};
    const lastWeekData: { [key: string]: number } = {};
    
    // Get start of this week (Monday)
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay() + 1);
    thisWeekStart.setHours(0, 0, 0, 0);
    
    // Get start of last week
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setTime(thisWeekStart.getTime() - 1);

    transactions.forEach((transaction: any) => {
      if (transaction.paymentdate && transaction.price) {
        const date = new Date(transaction.paymentdate);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Check if transaction is in this week
        if (date >= thisWeekStart && date <= now) {
          thisWeekData[dayName] = (thisWeekData[dayName] || 0) + (transaction.price || 0);
        }
        // Check if transaction is in last week
        else if (date >= lastWeekStart && date <= lastWeekEnd) {
          lastWeekData[dayName] = (lastWeekData[dayName] || 0) + (transaction.price || 0);
        }
      }
    });

    // Create week data for Mon-Sun
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weekDays.map(day => ({
      day,
      revenue: thisWeekData[day] || 0,
      lastWeek: lastWeekData[day] || 0
    }));
  };

  // Monthly and weekly revenue data
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<{ day: string; revenue: number; lastWeek: number }[]>([]);

  // Format revenue as VND
  const formatVND = (amount: number) =>
    amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  // Calculate monthly revenue from transactions
  const calculateMonthlyRevenue = (transactions: any[]) => {
    const monthlyData: { [key: string]: number } = {};
    
    transactions.forEach((transaction: any) => {
      if (transaction.paymentdate && transaction.price) {
        const date = new Date(transaction.paymentdate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (transaction.price || 0);
      }
    });

    // Get last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      months.push({
        month: monthName,
        revenue: monthlyData[monthKey] || 0
      });
    }
    
    return months;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Employee Management"
            description="Manage staff and their roles"
            icon={<Users size={24} className="text-primary-500" />}
            link="/admin/employees"
          />
          
          <DashboardCard
            title="Member Management"
            description="Manage cinema members"
            icon={<UserCircle size={24} className="text-primary-500" />}
            link="/admin/members"
          />

          <DashboardCard
            title="Movie Management"
            description="Manage movies and showtimes"
            icon={<Film size={24} className="text-primary-500" />}
            link="/admin/movies"
          />
          
          <DashboardCard
            title="Cinema Management"
            description="Manage cinema rooms and seating"
            icon={<Calendar size={24} className="text-primary-500" />}
            link="/admin/rooms"
          />
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Bookings"
            value={totalBookings.toString()}
            icon={<TicketIcon size={24} className="text-primary-400" />}
            change={bookingChange}
            changeType={bookingChangeType}
          />
          <StatCard
            title="Revenue"
            value={formatVND(totalRevenue)}
            icon={<DollarSign size={24} className="text-green-400" />}
            change={revenueChange}
            changeType={revenueChangeType}
          />
          <StatCard
            title="Active Movies"
            value={movieCount.toString()}
            icon={<Film size={24} className="text-purple-400" />}
            // change="Updated from API"
            changeType="neutral"
          />
          <StatCard
            title="Employees"
            value={staffCount.toString()}
            icon={<Users size={24} className="text-blue-400" />}
            // change="Updated from API"
            changeType="neutral"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-secondary-800 rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Weekly Revenue</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                  <span className="text-sm text-secondary-400">This Week</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-secondary-600 rounded-full"></div>
                  <span className="text-sm text-secondary-400">Last Week</span>
                </div>
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between space-x-2">
              {weeklyRevenue.map((dayData, i) => {
                const maxRevenue = Math.max(...weeklyRevenue.map(d => Math.max(d.revenue, d.lastWeek)));
                const thisWeekHeight = maxRevenue > 0 ? (dayData.revenue / maxRevenue) * 200 : 20;
                const lastWeekHeight = maxRevenue > 0 ? (dayData.lastWeek / maxRevenue) * 200 : 20;
                
                return (
                  <div key={dayData.day} className="flex flex-col items-center space-y-2 flex-1">
                    <div className="relative w-full max-w-10 h-52 flex items-end justify-center space-x-1">
                      <div 
                        className="w-4 bg-secondary-600 rounded-t-sm transition-all duration-300 hover:opacity-80" 
                        style={{ height: `${Math.max(lastWeekHeight, 10)}px` }}
                        title={`Last Week: ${formatVND(dayData.lastWeek)}`}
                      ></div>
                      <div 
                        className="w-4 bg-primary-500 rounded-t-sm transition-all duration-300 hover:opacity-80" 
                        style={{ height: `${Math.max(thisWeekHeight, 10)}px` }}
                        title={`This Week: ${formatVND(dayData.revenue)}`}
                      ></div>
                    </div>
                    <span className="text-xs text-secondary-400">{dayData.day}</span>
                    <span className="text-xs text-primary-400 font-medium">
                      {dayData.revenue > 0 ? formatVND(dayData.revenue).replace('₫', '').replace(',', 'K') : '0'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-secondary-800 rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Top Movies</h2>
              <span className="text-xs px-2 py-1 bg-secondary-700 rounded-full text-secondary-300">This Week</span>
            </div>
            
            <div className="space-y-4">
              {[
                { title: "The Dark Universe", tickets: 432, percentage: 85 },
                { title: "Last Summer in Paris", tickets: 327, percentage: 65 },
                { title: "Midnight Heist", tickets: 256, percentage: 50 },
                { title: "Ghost in the Machine", tickets: 193, percentage: 38 },
              ].map((movie, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-200">{movie.title}</span>
                    <span className="text-secondary-400">{movie.tickets} tickets</span>
                  </div>
                  <div className="w-full bg-secondary-700 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full" 
                      style={{ width: `${movie.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-secondary-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Monthly Revenue Trend</h2>
            <span className="text-xs px-2 py-1 bg-secondary-700 rounded-full text-secondary-300">Last 6 Months</span>
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-4">
            {monthlyRevenue.map((monthData, i) => {
              const maxRevenue = Math.max(...monthlyRevenue.map(d => d.revenue));
              const height = maxRevenue > 0 ? (monthData.revenue / maxRevenue) * 200 : 20;
              
              return (
                <div key={monthData.month} className="flex flex-col items-center space-y-2 flex-1">
                  <div className="w-full max-w-16 h-52 flex items-end justify-center">
                    <div 
                      className="w-8 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer" 
                      style={{ height: `${Math.max(height, 10)}px` }}
                      title={`${monthData.month}: ${formatVND(monthData.revenue)}`}
                    ></div>
                  </div>
                  <span className="text-xs text-secondary-400 font-medium">{monthData.month}</span>
                  <span className="text-xs text-primary-400 font-semibold">
                    {monthData.revenue > 0 ? 
                      (monthData.revenue >= 1000000 ? 
                        `${(monthData.revenue / 1000000).toFixed(1)}M` : 
                        `${(monthData.revenue / 1000).toFixed(0)}K`
                      ) : '0'
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-secondary-800 rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Upcoming Showtimes</h2>
              <span className="text-xs px-2 py-1 bg-secondary-700 rounded-full text-secondary-300">Today</span>
            </div>
            
            <div className="space-y-4">
              {[
                { time: "14:00", movie: "The Dark Universe", room: "Grand Theater", bookings: "82/120" },
                { time: "16:30", movie: "Last Summer in Paris", room: "Premium Hall", bookings: "45/80" },
                { time: "19:00", movie: "Midnight Heist", room: "Intimate Screening", bookings: "32/50" },
                { time: "21:30", movie: "The Dark Universe", room: "Grand Theater", bookings: "114/120" },
              ].map((showtime, i) => (
                <div key={i} className="flex items-center p-3 rounded-lg hover:bg-secondary-700 transition-colors">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-secondary-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium">{showtime.time}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{showtime.movie}</p>
                    <p className="text-secondary-400 text-sm">{showtime.room}</p>
                  </div>
                  <div className="flex items-center text-secondary-300">
                    <Activity size={16} className="mr-1" />
                    <span>{showtime.bookings}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-secondary-800 rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <span className="text-xs px-2 py-1 bg-secondary-700 rounded-full text-secondary-300">Live Feed</span>
            </div>
            
            <div className="space-y-4">
              {[
                { action: "New booking", details: "John D. booked 2 tickets for The Dark Universe", time: "2 minutes ago", icon: <TicketIcon size={16} className="text-green-400" /> },
                { action: "Ticket sale", details: "Sarah processed a ticket sale for Last Summer in Paris", time: "15 minutes ago", icon: <DollarSign size={16} className="text-blue-400" /> },
                { action: "Employee login", details: "Mike Chen signed in at the box office", time: "32 minutes ago", icon: <Users size={16} className="text-yellow-400" /> },
                { action: "New movie added", details: "Admin added 'The Lost Kingdom' to the movie list", time: "1 hour ago", icon: <Film size={16} className="text-purple-400" /> },
                { action: "Showtime updated", details: "Evening showtime for Midnight Heist was rescheduled", time: "2 hours ago", icon: <Calendar size={16} className="text-red-400" /> },
              ].map((activity, i) => (
                <div key={i} className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 bg-secondary-700 rounded-full flex items-center justify-center">
                      {activity.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{activity.action}</p>
                    <p className="text-secondary-400 text-sm">{activity.details}</p>
                    <p className="text-secondary-500 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;