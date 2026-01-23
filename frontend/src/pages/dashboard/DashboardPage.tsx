import { useAuthStore } from '../../stores/authStore';
import DashboardLayout from './DashboardLayout';
import UserDashboard from './UserDashboard';
import SellerDashboard from './SellerDashboard';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import OwnerDashboard from './OwnerDashboard';
import { Navigate, Routes, Route } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuthStore();

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

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default DashboardPage;