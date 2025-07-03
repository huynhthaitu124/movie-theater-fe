import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  const userRole = currentUser?.role || '';
  
  // Debug logging
  // console.log('Protected Route - Authorization check:', {
  //   currentUser,
  //   userRole,
  //   allowedRoles
  // });

  // Direct role check (no case conversion needed since both are in Title Case)
  const hasRequiredRole = allowedRoles.length === 0 || 
    (userRole && allowedRoles.includes(userRole));

  if (!hasRequiredRole) {
    console.log('Protected Route - Access denied:', {
      userRole,
      requiredRoles: allowedRoles,
      reason: !userRole ? 'No user role' : 'Role not allowed'
    });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;