import React from 'react';
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
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Bookings"
            value="1,248"
            icon={<TicketIcon size={24} className="text-primary-400" />}
            change="+12% vs. last month"
            changeType="increase"
          />
          <StatCard
            title="Revenue"
            value="$24,350"
            icon={<DollarSign size={24} className="text-green-400" />}
            change="+8.5% vs. last month"
            changeType="increase"
          />
          <StatCard
            title="Active Movies"
            value="14"
            icon={<Film size={24} className="text-purple-400" />}
            change="2 new releases"
            changeType="neutral"
          />
          <StatCard
            title="Employees"
            value="32"
            icon={<Users size={24} className="text-blue-400" />}
            change="-1 since last month"
            changeType="decrease"
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
            
            <div className="h-64 flex items-end justify-between">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="flex flex-col items-center space-y-2">
                  <div className="relative w-10">
                    <div 
                      className="w-4 bg-secondary-600 rounded-t-sm mx-auto" 
                      style={{ height: `${30 + Math.random() * 70}px` }}
                    ></div>
                    <div 
                      className="w-4 bg-primary-500 rounded-t-sm absolute bottom-0 left-0 right-0 mx-auto" 
                      style={{ height: `${20 + Math.random() * 100}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-secondary-400">{day}</span>
                </div>
              ))}
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

        <div className="mt-8">
          <Link to="/admin/rooms" className="text-primary-500 hover:underline">
            Room List
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;