import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (roles && user && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    let redirectPath = '/dashboard';
    
    // You could add specific redirects for different roles if needed
    // if (user.role === 'USER') redirectPath = '/dashboard/user';
    // else if (user.role === 'SELLER') redirectPath = '/dashboard/seller';
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;