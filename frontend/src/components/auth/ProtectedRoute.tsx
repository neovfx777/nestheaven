import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Allowed roles. Old prop name kept for backward compatibility.
   * Prefer using `roles`, but `requireRole` is also supported.
   */
  roles?: string[];
  requireRole?: string[];
}

const ProtectedRoute = ({ children, roles, requireRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowedRoles = requireRole || roles;

  if (!user) {
    // Prevent access when auth state is inconsistent (token flag without user profile)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    let redirectPath = '/dashboard';

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
