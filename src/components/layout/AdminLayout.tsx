import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Film, Users, Calendar, TicketIcon, Tag, Layout as LayoutIcon, 
  LogOut, Menu, X, ChevronDown, ChevronRight, Home,
  UsbIcon,
  User2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
  subItems?: { to: string; label: string }[];
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  to, icon, label, active, onClick, subItems 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = subItems && subItems.length > 0;
  const location = useLocation();
  
  const isSubItemActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSubMenu = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      <Link
        to={hasSubItems ? '#' : to}
        className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
          active
            ? 'bg-primary-700 text-white'
            : 'text-secondary-200 hover:bg-secondary-700'
        }`}
        onClick={(e) => {
          if (hasSubItems) {
            toggleSubMenu(e);
          } else if (onClick) {
            onClick();
          }
        }}
      >
        <span className="mr-3">{icon}</span>
        <span className="flex-1">{label}</span>
        {hasSubItems && (
          <span className="ml-auto">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </Link>

      {hasSubItems && isOpen && (
        <div className="ml-6 mt-1 space-y-1">
          {subItems.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className={`block px-4 py-2 text-sm rounded-md ${
                isSubItemActive(item.to)
                  ? 'bg-primary-700 text-white'
                  : 'text-secondary-300 hover:bg-secondary-700'
              }`}
              onClick={onClick}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Kiểm tra authentication và role
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    if (currentUser?.role !== 'Admin' && currentUser?.role !== 'Staff') {
      navigate('/');
      return;
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    {
      to: '/admin/dashboard',
      icon: <Home size={20} />,
      label: 'Dashboard',
    },
    {
      to: '/admin/movies',
      icon: <Film size={20} />,
      label: 'Movies',
      subItems: [
        { to: '/admin/movies', label: 'Movie List' },
        { to: '/admin/movies/add', label: 'Add Movie' },
      ],
    },
    {
      to: '/admin/employees',
      icon: <Users size={20} />,
      label: 'Employees',
      subItems: [
        { to: '/admin/employees', label: 'Employee List' },
        { to: '/admin/employees/add', label: 'Add Employee' },
      ],
    },
    {
      to: '/admin/members',
      icon: <User2 size={20} />,
      label: 'Members',
      subItems: [
        { to: '/admin/members', label: 'Member List' },
        { to: '/admin/members/add', label: 'Add Members' },
      ],
    },
    {
      to: '/admin/cinema-rooms',
      icon: <LayoutIcon size={20} />,
      label: 'Cinema Rooms',
      subItems: [
        { to: '/admin/cinema-rooms', label: 'Room List' },
        { to: '/admin/cinema-rooms/add', label: 'Add Room' },
      ],
    },
    {
      to: '/admin/showtimes',
      icon: <Calendar size={20} />,
      label: 'Showtimes',
      subItems: [
        { to: '/admin/showtimes', label: 'Showtime List' },
        { to: '/admin/showtimes/add', label: 'Add Showtime' },
      ],
    },
    {
      to: '/admin/tickets',
      icon: <TicketIcon size={20} />,
      label: 'Ticket Management',
      subItems: [
        { to: '/admin/tickets/selling', label: 'Ticket Selling' },
        { to: '/admin/tickets/bookings', label: 'Booking Management' },
      ],
    },
    {
      to: '/admin/promotions',
      icon: <Tag size={20} />,
      label: 'Promotions',
      subItems: [
        { to: '/admin/promotions', label: 'Promotion List' },
        { to: '/admin/promotions/add', label: 'Add Promotion' },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-secondary-900 text-secondary-100">
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-40 md:hidden bg-secondary-900 bg-opacity-80 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-secondary-800 border-r border-secondary-700 transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-700">
          <Link to="/admin/dashboard" className="flex items-center text-xl font-bold text-white">
            <Film className="h-7 w-7 mr-2 text-primary-400" />
            <span>Admin Panel</span>
          </Link>
          <button
            className="md:hidden p-1 rounded-md text-secondary-400 hover:text-white focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto py-4 space-y-1 px-2">
          {navItems.map((item, index) => (
            <SidebarItem
              key={index}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={isActive(item.to)}
              onClick={() => setSidebarOpen(false)}
              subItems={item.subItems}
            />
          ))}

          <div className="mt-auto pt-4 border-t border-secondary-700 px-2">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-sm text-secondary-400">Theme</span>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm rounded-md text-secondary-200 hover:bg-secondary-700"
            >
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <div className="bg-secondary-800 border-b border-secondary-700 h-16 flex items-center px-4 md:px-6">
          <button
            className="md:hidden p-2 rounded-md text-secondary-400 hover:text-white focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-2 md:ml-0 text-xl font-semibold">
            {navItems.find(item => isActive(item.to))?.label || 'Dashboard'}
          </h1>
          <div className="ml-auto flex items-center">
            <Link to="/" className="text-sm text-primary-400 hover:text-primary-300 mr-4">
              View Site
            </Link>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-secondary-900 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;