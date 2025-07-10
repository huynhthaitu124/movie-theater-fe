import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import CompleteRegister from './pages/auth/CompleteRegister';
import Home from './pages/home/Home';
import Dashboard from './components/admin/Dashboard';
import EmployeeList from './pages/admin/employees/EmployeeList';
import AddEmployee from './pages/admin/employees/AddEmployee';
import EditEmployee from './pages/admin/employees/EditEmployee';
import InactiveEmployees from './pages/admin/employees/InactiveEmployees';
import BookTicket from './pages/booking/BookTicket';
import PaymentReturn from './pages/booking/PaymentReturn';
import Movies from './pages/movies/Movies';
import Promotions from './pages/promotions/Promotions';
import EditProfile from './pages/profile/EditProfile';
import ProtectedRoute from './components/ProtectedRoute';
import MovieList from './pages/admin/movies/MovieList';
import AddEditMovie from './pages/admin/movies/AddEditMovie';
import MemberList from './pages/admin/members/MemberList';
import AddMember from './pages/admin/members/AddMember';
import InactiveMembers from './pages/admin/members/InactiveMembers';
import MovieDetails from './pages/movies/MovieDetails';
import CinemaManagement from './pages/admin/cinemas/CinemaManagement';
import ShowtimeManagement from './pages/admin/showtimes/ShowtimeManagement';
import SeatTypeManagement from '../src/components/seatType/SeatTypeManagement';
import SeatManagement from '../src/components/seatManagement/SeatManagement';
import PromotionManagement from './pages/admin/promotions/PromotionManagement';
import MembershipManagement from './pages/admin/memberships/MembershipManagement';
import ProductManagement  from './pages/admin/products/ProductManagement';

//Staff Dashboard imports
import StaffDashboard from './components/staff/StaffDashboard';
import StaffMovieList from './pages/staff/movies/StaffMovieList';
import StaffShowtimeList from './pages/staff/showtime/StaffShowtimeList';

//User Dashboard 
import UserDashboard from './components/userDashboard/Dashboard';
import InvoiceSection from '../src/components/userDashboard/InvoiceSection';

import { Toaster } from 'react-hot-toast';

const NotFound = () => {
  const location = useLocation();
  
  // If the current path starts with /admin, redirect to admin dashboard
  if (location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // Otherwise, redirect to home
  return <Navigate to="/" replace />;
};

const App: React.FC = () => {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/complete-register" element={<CompleteRegister />} />
              
              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <EmployeeList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees/inactive"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <InactiveEmployees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees/add"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AddEmployee />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/employees/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <EditEmployee />
                  </ProtectedRoute>
                }
              />

              {/* Movie Management Routes */}
              <Route
                path="/admin/movies"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <MovieList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/movies/add"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AddEditMovie />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/movies/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AddEditMovie />
                  </ProtectedRoute>
                }
              />            
              {/* Member Management Routes */}
              <Route
                path="/admin/members"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <MemberList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/members/add"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AddMember />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/members/inactive"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <InactiveMembers />
                  </ProtectedRoute>
                }
              />
              
              {/* Cinema Management Route */}
              <Route
                path="/admin/cinemas"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <CinemaManagement />
                  </ProtectedRoute>
                }
              />
              
              {/* Membership Management Route */}
              <Route
                path="/admin/memberships"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <MembershipManagement />
                  </ProtectedRoute>
                }
              />

              {/* Showtime Management Route */}
              <Route
                path="/admin/showtimes"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <ShowtimeManagement />
                  </ProtectedRoute>
                }
              />

              {/* Promotion Management Route */}
              <Route
                path="/admin/promotions"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <PromotionManagement />
                  </ProtectedRoute>
                }
              />

              {/* Product Management Route */}
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <ProductManagement />
                  </ProtectedRoute>
                }
              />

              {/* Seat Type Management Route */}
              <Route
                path="/admin/seat-types"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <SeatTypeManagement />
                  </ProtectedRoute>
                }
              />

              {/* Seat Type Management Route */}
              <Route
                path="/admin/seats/:roomId"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <SeatManagement />
                  </ProtectedRoute>
                }
              />

              {/* Staff Routes */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Staff']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/staff/movies"
                element={
                  <ProtectedRoute allowedRoles={['Staff']}>
                    <StaffMovieList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/staff/showtimes"
                element={
                  <ProtectedRoute allowedRoles={['Staff']}>
                    <StaffShowtimeList />
                  </ProtectedRoute>
                }
              />
              
              
              {/* Public Routes that require authentication */}
              <Route path="/book/:movieId" element={
                <ProtectedRoute>
                  <BookTicket />
                </ProtectedRoute>
              } />
              <Route path="/booking/payment-return" element={
                <ProtectedRoute>
                  <PaymentReturn />
                </ProtectedRoute>
              } />
              
              {/* Public Routes */}
              <Route path="/movies" element={<Movies />} />
              <Route path="/movies/:id" element={<MovieDetails />} />
              <Route path="/promotions" element={<Promotions />} />

              {/* User Dashboard Route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Profile Route */}
              <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                } 
              />
              
              <Route
               path="/invoice/:invoiceid" 
               element={<InvoiceSection />} />
              
              {/* Not Found Route - must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;

