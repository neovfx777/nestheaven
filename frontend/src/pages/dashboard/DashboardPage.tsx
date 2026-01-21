import { useAuthStore } from '../../stores/authStore';
import { Building2, Home, Settings, Users } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import DashboardLayout from './DashboardLayout';
import UserDashboard from './UserDashboard';
import SellerDashboard from './SellerDashboard';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import OwnerDashboard from './OwnerDashboard';

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
        return <UserDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default DashboardPage;
const DashboardPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.fullName}!
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800">
          <span className="text-sm font-medium">Role: {user?.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Home className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Apartments</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Complexes</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Users</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Settings className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Settings</p>
              <p className="text-2xl font-semibold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific content */}
      <div className="mt-12 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Role Information
        </h2>
        <p className="text-gray-600">
          Your role <span className="font-semibold">{user?.role}</span> determines what actions you can perform in the system.
          {user?.role === 'SELLER' && ' You can create and manage your own apartment listings.'}
          {user?.role === 'ADMIN' && ' You can moderate listings and manage content.'}
          {user?.role === 'MANAGER_ADMIN' && ' You can create and manage regular admins.'}
          {user?.role === 'OWNER_ADMIN' && ' You have full system access and can create managers and sellers.'}
          {user?.role === 'USER' && ' You can browse and save favorite apartments.'}
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;