import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import { AuthContext } from './AuthWrapper.jsx';

/**
 * ProtectedRoute.jsx
 * Checks if the user is authenticated and, optionally, if they have required roles.
 * If not authenticated or lacking required roles, redirects appropriately.
 */
export default function ProtectedRoute({ children, requiredRoles }) {
  const isAuthenticated = useIsAuthenticated();
  const { user } = useContext(AuthContext);

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If requiredRoles is provided, check user roles from AuthContext
  if (requiredRoles && Array.isArray(requiredRoles)) {
    const userRoles = user?.roles || [];
    const hasRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return <Navigate to="/dashboard" replace />; // redirect to dashboard if lacking role
    }
  }

  // Otherwise render the protected page
  return children;
}
