import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Calendar, LogOut, Menu, X, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNProgress } from '@tanem/react-nprogress';

const sidebarVariants = {
  open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  closed: { x: "-100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
};

const contentVariants = {
  open: { marginLeft: "18rem", transition: { duration: 0.3 } },
  closed: { marginLeft: 0, transition: { duration: 0.3 } }
};

const sidebarMediaVariants = (sidebarOpen: boolean) => ({
  mobile: { variants: sidebarVariants, initial: false, animate: sidebarOpen ? "open" : "closed" },
  desktop: { initial: false, animate: { x: 0, opacity: 1 } }
});

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, active, onClick }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
        active
          ? 'bg-primary-600/10 text-primary-500 font-medium'
          : 'text-secondary-300 hover:bg-secondary-700/50 hover:text-white'
      }`}
      onClick={onClick}
    >
      <motion.span className="mr-3" animate={{ scale: active ? 1.1 : 1 }} transition={{ type: "spring", stiffness: 300 }}>
        {icon}
      </motion.span>
      <span className="flex-1">{label}</span>
    </Link>
  </motion.div>
);

const StaffLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const { animationDuration, isFinished, progress } = useNProgress({ isAnimating: isRouteChanging });

  useEffect(() => {
    // Only allow staff (or admin, if you want)
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    if (currentUser?.role !== 'Staff') {
      navigate('/');
      return;
    }
  }, [isAuthenticated, currentUser, navigate]);

  useEffect(() => {
    setIsRouteChanging(true);
    const timeout = setTimeout(() => setIsRouteChanging(false), 500);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    {
      to: '/staff/movies',
      icon: <Film size={20} />,
      label: 'Movies',
    },
    {
      to: '/staff/showtimes',
      icon: <Calendar size={20} />,
      label: 'Showtimes',
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
      <AnimatePresence>
        <motion.div
          {...(window.innerWidth < 768 ? sidebarMediaVariants(sidebarOpen).mobile : sidebarMediaVariants(sidebarOpen).desktop)}
          className={`
            fixed md:static inset-y-0 left-0 z-50 w-72 
            bg-secondary-800/95 backdrop-blur-sm border-r border-secondary-700/50 
            shadow-xl md:translate-x-0
          `}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-700/50">
            <Link to="/staff/movies" className="flex items-center space-x-3">
              <Film className="h-8 w-8 text-primary-500" />
              <div>
                <span className="text-lg font-bold text-white">Cinema Staff</span>
                <p className="text-xs text-secondary-400">Staff Portal</p>
              </div>
            </Link>
            <button
              className="md:hidden p-1 rounded-lg text-secondary-400 hover:text-white focus:outline-none hover:bg-secondary-700/50"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col h-[calc(100%-4rem)] px-4 py-6">
            <div className="space-y-1 mb-6">
              {navItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={isActive(item.to)}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </div>

            <div className="mt-auto space-y-4">
              <div className="p-4 rounded-lg bg-secondary-700/30 backdrop-blur">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                    <Film size={20} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {currentUser?.displayname || 'Staff User'}
                    </p>
                    <p className="text-xs text-secondary-400">
                      {currentUser?.role || 'Staff'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm rounded-lg text-white bg-secondary-700/50 hover:bg-secondary-700 transition-colors"
                >
                  <LogOut size={16} className="mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content area */}
      <motion.div
        className="flex-1 flex flex-col overflow-hidden"
        variants={contentVariants}
        initial={false}
        animate={sidebarOpen ? "open" : "closed"}
      >
        {/* Top navigation */}
        <div className="bg-secondary-800/95 backdrop-blur-sm border-b border-secondary-700/50 h-16">
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center space-x-4">
              <button
                className="md:hidden p-2 rounded-lg text-secondary-400 hover:text-white hover:bg-secondary-700/50 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              <div className="hidden md:flex items-center space-x-2">
                <h1 className="text-lg font-medium">
                  {navItems.find(item => isActive(item.to))?.label || 'Movies'}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-sm px-4 py-2 rounded-lg text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 transition-colors"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {!isFinished && (
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-primary-500 z-50"
            initial={{ width: "0%" }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: animationDuration }}
          />
        )}

        {/* Main content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto bg-secondary-900 p-6"
        >
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>
      </motion.div>
    </div>
  );
};

export default StaffLayout;