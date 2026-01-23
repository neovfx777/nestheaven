import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Users, 
  Settings, 
  FileText, 
  BarChart3,
  Shield,
  UserPlus,
  Eye,
  EyeOff,
  LogOut,
  Menu,
  X,
  User,
  Filter,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

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
        return <User className="h-5 w-5 text-gray-600" />;
      default:
        return <User className="h-5 w-5" />;
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
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigation = [
    // Common for all roles
    { 
      name: 'Overview', 
      href: '/dashboard', 
      icon: Home, 
      roles: ['USER', 'SELLER', 'ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN'] 
    },
    
    // USER specific
    { 
      name: 'My Favorites', 
      href: '/dashboard/user/favorites', 
      icon: Eye, 
      roles: ['USER'] 
    },
    { 
      name: 'Saved Searches', 
      href: '/dashboard/user/searches', 
      icon: FileText, 
      roles: ['USER'] 
    },
    
    // SELLER specific
    { 
      name: 'My Listings', 
      href: '/dashboard/seller/listings', 
      icon: Building2, 
      roles: ['SELLER'] 
    },
    { 
      name: 'Create Listing', 
      href: '/dashboard/seller/listings/new', 
      icon: Building2, 
      roles: ['SELLER'] 
    },
    { 
      name: 'Sales Analytics', 
      href: '/dashboard/seller/analytics', 
      icon: BarChart3, 
      roles: ['SELLER'] 
    },
    
    // ADMIN specific
    { 
      name: 'Apartment Moderation', 
      href: '/dashboard/admin/apartments', 
      icon: Filter, 
      roles: ['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN'] 
    },
    { 
      name: 'Flagged Content', 
      href: '/dashboard/admin/flagged', 
      icon: AlertTriangle, 
      roles: ['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN'] 
    },
    { 
      name: 'Status History', 
      href: '/dashboard/admin/history', 
      icon: CheckCircle, 
      roles: ['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN'] 
    },
    
    // MANAGER_ADMIN specific
    { 
      name: 'Admin Management', 
      href: '/dashboard/manager/admins', 
      icon: UserPlus, 
      roles: ['MANAGER_ADMIN', 'OWNER_ADMIN'] 
    },
    { 
      name: 'Moderation Logs', 
      href: '/dashboard/manager/logs', 
      icon: FileText, 
      roles: ['MANAGER_ADMIN', 'OWNER_ADMIN'] 
    },
    
    // OWNER_ADMIN specific
    { 
      name: 'User Management', 
      href: '/dashboard/owner/users', 
      icon: Users, 
      roles: ['OWNER_ADMIN'] 
    },
    { 
      name: 'System Settings', 
      href: '/dashboard/owner/settings', 
      icon: Settings, 
      roles: ['OWNER_ADMIN'] 
    },
    { 
      name: 'Billing & Payments', 
      href: '/dashboard/owner/billing', 
      icon: BarChart3, 
      roles: ['OWNER_ADMIN'] 
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || 'USER')
  );

  // Check if current path matches any navigation item
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-600"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <span className="ml-4 font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user?.role || 'USER')}`}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-200 ease-in-out lg:static lg:inset-auto lg:z-auto
        `}>
          {/* Sidebar Header */}
          <div className="h-16 border-b border-gray-200 flex items-center justify-center px-6">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold">NestHeaven</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <div className="font-medium">{user?.fullName}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
                <div className="flex items-center mt-1">
                  {getRoleIcon(user?.role || 'USER')}
                  <span className="ml-2 text-sm font-medium">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {filteredNavigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${active
                      ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;