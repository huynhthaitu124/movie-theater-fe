import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Film, User, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import Button from '../common/Button';
import { UserRole } from '../../types/role';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    console.log('Current user role:', currentUser?.role);
    if (currentUser?.role === 'Admin') {
      navigate('/admin/dashboard');
    } else if (currentUser?.role === 'Staff') {
      navigate('/staff/dashboard');
    } else {
      navigate('/account');
    }
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Debug log whenever currentUser changes
  useEffect(() => {
    console.log('Navbar - Current user:', currentUser);
  }, [currentUser]);

  return (
    <nav className="bg-secondary-900 border-b border-secondary-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-xl font-bold text-primary-600 dark:text-primary-400">
              <Film className="h-8 w-8 mr-2" />
              <span>CinemaPlus</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary-100 dark:hover:bg-secondary-700">
              Home
            </Link>
            <Link to="/movies" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary-100 dark:hover:bg-secondary-700">
              Movies
            </Link>
            <Link to="/promotions" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary-100 dark:hover:bg-secondary-700">
              Promotions
            </Link>
            


            {isAuthenticated ? (
              <div className="relative ml-3">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-secondary-200 hover:text-white"
                >
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser?.avatar}
                      alt="User Avatar"
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                   <UserCircle size={24} />
                  )}
                  <span>{currentUser?.displayname || 'User'}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-secondary-800 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-secondary-700">
                      {/* <p className="text-sm font-medium text-white">{currentUser?.displayname}</p> */}
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-secondary-200 hover:bg-secondary-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    {(currentUser?.role === 'Admin' || currentUser?.role === 'Staff') && (
                    <button
                      onClick={handleDashboardClick}
                      className="block w-full text-left px-4 py-2 text-sm text-secondary-200 hover:bg-secondary-700"
                    >
                      Dashboard
                    </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-secondary-200 hover:bg-secondary-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-800 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-secondary-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary-200 hover:bg-secondary-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/movies"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary-200 hover:bg-secondary-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Movies
            </Link>
            <Link
              to="/promotions"
              className="block px-3 py-2 rounded-md text-base font-medium text-secondary-200 hover:bg-secondary-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Promotions
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile/edit"
                  className="block px-3 py-2 rounded-md text-base font-medium text-secondary-200 hover:bg-secondary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <Link
                  to={currentUser?.role === 'Admin' ? '/admin/dashboard' : '/account'}
                  className="block px-3 py-2 rounded-md text-base font-medium text-secondary-200 hover:bg-secondary-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-accent-600 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 p-2">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    navigate('/login');
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    navigate('/register');
                    setIsMenuOpen(false);
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;