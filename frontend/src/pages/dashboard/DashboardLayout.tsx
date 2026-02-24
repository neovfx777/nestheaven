import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Building2,
  Users,
  Settings,
  FileText,
  BarChart3,
  Shield,
  UserPlus,
  LogOut,
  Menu,
  X,
  User,
  Heart,
  List,
  PlusCircle
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import { LanguageSelector } from '../../components/ui/LanguageSelector';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();

  /* =========================
     Helpers
  ========================= */

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER_ADMIN':
        return <Shield className="h-5 w-5 text-purple-600" />;
      case 'MANAGER_ADMIN':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'ADMIN':
        return <Shield className="h-5 w-5 text-green-600" />;
      case 'SELLER':
        return <Building2 className="h-5 w-5 text-orange-600" />;
      case 'USER':
      default:
        return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER_ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'MANAGER_ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'ADMIN':
        return 'bg-green-100 text-green-800';
      case 'SELLER':
        return 'bg-orange-100 text-orange-800';
      case 'USER':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  /* =========================
     Navigation
  ========================= */

  const navigation = [
    { nameKey: 'dashboard.overview', href: '/dashboard', icon: Home, roles: ['USER', 'SELLER', 'ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN'] },
    { nameKey: 'dashboard.myFavorites', href: '/dashboard/favorites', icon: Heart, roles: ['USER'] },
    { nameKey: 'dashboard.manageListings', href: '/dashboard/seller/listings', icon: List, roles: ['SELLER', 'OWNER_ADMIN'] },
    { nameKey: 'dashboard.userManagement', href: '/dashboard/admin/users', icon: Users, roles: ['MANAGER_ADMIN', 'OWNER_ADMIN'] },
    { nameKey: 'dashboard.complexes', href: '/dashboard/admin/complexes', icon: Building2, roles: ['MANAGER_ADMIN', 'OWNER_ADMIN'] },
    { nameKey: 'dashboard.analytics', href: '/dashboard/admin/analytics', icon: BarChart3, roles: ['MANAGER_ADMIN', 'OWNER_ADMIN'] },
    { nameKey: 'dashboard.adminManagement', href: '/dashboard/manager/admins', icon: UserPlus, roles: ['MANAGER_ADMIN', 'OWNER_ADMIN'] },
    { nameKey: 'dashboard.moderationLogs', href: '/dashboard/manager/logs', icon: FileText, roles: ['MANAGER_ADMIN', 'OWNER_ADMIN'] },
    { nameKey: 'dashboard.systemSettings', href: '/dashboard/owner/settings', icon: Settings, roles: ['OWNER_ADMIN'] },
    { nameKey: 'dashboard.billingPayments', href: '/dashboard/owner/billing', icon: BarChart3, roles: ['OWNER_ADMIN'] },
  ];

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user?.role || 'USER')
  );

  /* =========================
     Render
  ========================= */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b px-4 py-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X /> : <Menu />}
        </button>
        <span className="font-semibold">{t('navigation.dashboard')}</span>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <span
            className={`px-3 py-1 rounded-full text-sm ${getRoleColor(
              user?.role || 'USER'
            )}`}
          >
            {user?.role ? t(`roles.${user.role}` as any) : ''}
          </span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-30 w-64 bg-white border-r flex flex-col h-screen
            transform transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static
          `}
        >
          {/* Logo + Language */}
          <div className="h-16 flex items-center justify-between border-b px-4">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold">NestHeaven</span>
            </Link>
            <div className="hidden lg:block">
              <LanguageSelector />
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{user?.fullName}</div>
                <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                <div className="flex items-center mt-1">
                  {getRoleIcon(user?.role || 'USER')}
                  <span className="ml-2 text-sm font-medium">
                    {user?.role ? t(`roles.${user.role}` as any) : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredNavigation.map(item => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center px-4 py-3 rounded-lg text-sm font-medium
                  ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }
                `}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {t(item.nameKey as any)}
              </Link>
            ))}
          </nav>

          {/* Quick Create Button */}
          {(user?.role === 'SELLER' || user?.role === 'ADMIN' || user?.role === 'MANAGER_ADMIN' || user?.role === 'OWNER_ADMIN') && (
            <div className="p-4 border-t">
              <Link
                to="/dashboard/seller/apartments/new"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                {t('dashboard.createNewListing')}
              </Link>
            </div>
          )}

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <LogOut className="h-5 w-5 mr-3" />
              {t('dashboard.logout')}
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
