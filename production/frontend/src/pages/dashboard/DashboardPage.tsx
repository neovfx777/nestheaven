import { useAuthStore } from '../../stores/authStore';
import DashboardLayout from './DashboardLayout';
import UserDashboard from './UserDashboard';
import SellerDashboard from './SellerDashboard';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import OwnerDashboard from './OwnerDashboard';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  // If user is on a seller-specific route, don't render the role-based dashboard
  // Instead, let the App.tsx routes handle it
  const isSellerRoute = location.pathname.includes('/dashboard/seller');
  const isAdminRoute = location.pathname.includes('/dashboard/admin');
  
  if (isSellerRoute || isAdminRoute) {
    // These routes are handled by App.tsx
    return null;
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'USER':
        return <UserDashboard />;
      case 'SELLER':
        return <SellerDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      case 'MANAGER_ADMIN':
        return <ManagerDashboard />;
      case 'OWNER_ADMIN':
        return <OwnerDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return renderDashboard();
};

export default DashboardPage;