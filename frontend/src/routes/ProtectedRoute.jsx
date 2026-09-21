import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>403 - Unauthorized Access</h2>
        <p>Your role ({role}) does not have permission to view this section.</p>
      </div>
    );
  }

  return <Outlet />;
};
