import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/home/Home';
import Dashboard from './components/admin/Dashboard';
import EmployeeList from './pages/admin/employees/EmployeeList';
import AddEmployee from './pages/admin/employees/AddEmployee';
import EditEmployee from './pages/admin/employees/EditEmployee';
import BookTicket from './pages/booking/BookTicket';
import Movies from './pages/movies/Movies';
import Promotions from './pages/promotions/Promotions';
import EditProfile from './pages/profile/EditProfile';
import ProtectedRoute from './components/ProtectedRoute';
import MovieList from './pages/admin/movies/MovieList';
import AddEditMovie from './pages/admin/movies/AddEditMovie';
import RoomList from './pages/admin/rooms/RoomList';
import AddEditRoom from './pages/admin/rooms/AddEditRoom';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/employees/add" element={<AddEmployee />} />
            <Route
              path="/admin/employees/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <EditEmployee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/movies"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <MovieList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/movies/add"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <AddEditMovie />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/movies/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <AddEditMovie />
                </ProtectedRoute>
              }
            />
            
            {/* Room Management Routes */}
            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <RoomList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms/add"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <AddEditRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager']}>
                  <AddEditRoom />
                </ProtectedRoute>
              }
            />
            
            {/* Booking Route */}
            <Route path="/book/:movieId" element={<BookTicket />} />
            
            {/* Movies Route */}
            <Route path="/movies" element={<Movies />} />
            
            {/* Promotions Route */}
            <Route path="/promotions" element={<Promotions />} />
            
            {/* Profile Route */}
            <Route 
              path="/profile/edit" 
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;