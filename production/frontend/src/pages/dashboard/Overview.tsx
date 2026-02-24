import { useQuery } from '@tanstack/react-query';
import { 
  Users, Home, Building, DollarSign, TrendingUp, 
  BarChart3, Eye, Heart, Search, Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import apiClient from '../../api/client';

export function Overview() {
  const { user, token } = useAuthStore();

  // Fetch basic stats for overview
  const { data: stats, isLoading } = useQuery({
    queryKey: ['overview-stats'],
    queryFn: async () => {
      if (!token) return null;
      const response = await apiClient.get('/analytics/stats');
      return response.data;
    }
  });

  const data = stats?.data || {};

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleBasedContent = () => {
    switch (user?.role) {
      case 'OWNER_ADMIN':
        return {
          title: 'System Overview',
          description: 'Complete system statistics and management tools'
        };
      case 'MANAGER_ADMIN':
        return {
          title: 'Admin Dashboard',
          description: 'Manage administrators and system operations'
        };
      case 'ADMIN':
        return {
          title: 'Moderation Dashboard',
          description: 'Content moderation and user management'
        };
      case 'SELLER':
        return {
          title: 'Sales Dashboard',
          description: 'Manage your listings and track performance'
        };
      default:
        return {
          title: 'User Dashboard',
          description: 'Your favorites and saved searches'
        };
    }
  };

  const roleContent = getRoleBasedContent();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getWelcomeMessage()}, {user?.fullName || user?.email}!
        </h1>
        <p className="text-blue-100">
          {roleContent.description}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.users?.total?.toLocaleString() || 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.users?.admins?.toLocaleString() || 0} admins, {data.users?.sellers?.toLocaleString() || 0} sellers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Home className="w-4 h-4" />
              Active Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.apartments?.active?.toLocaleString() || 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Available properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Complexes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.complexes?.total?.toLocaleString() || 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Property complexes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Sold Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.apartments?.sold?.toLocaleString() || 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Successfully sold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role-based Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks based on your role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user?.role === 'OWNER_ADMIN' && (
              <>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Users className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-medium">User Management</h3>
                  <p className="text-sm text-gray-600">Manage all users and permissions</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-medium">Analytics</h3>
                  <p className="text-sm text-gray-600">View system statistics</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Building className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-medium">Complex Management</h3>
                  <p className="text-sm text-gray-600">Manage property complexes</p>
                </div>
              </>
            )}
            
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER_ADMIN') && (
              <>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-medium">User Management</h3>
                  <p className="text-sm text-gray-600">Manage users and roles</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Home className="w-8 h-8 text-orange-600 mb-2" />
                  <h3 className="font-medium">Apartments</h3>
                  <p className="text-sm text-gray-600">Moderate property listings</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-medium">Analytics</h3>
                  <p className="text-sm text-gray-600">View platform statistics</p>
                </div>
              </>
            )}

            {user?.role === 'SELLER' && (
              <>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Home className="w-8 h-8 text-orange-600 mb-2" />
                  <h3 className="font-medium">My Listings</h3>
                  <p className="text-sm text-gray-600">Manage your properties</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-medium">Sales Analytics</h3>
                  <p className="text-sm text-gray-600">Track your performance</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Plus className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-medium">Add Listing</h3>
                  <p className="text-sm text-gray-600">Create new property listing</p>
                </div>
              </>
            )}

            {user?.role === 'USER' && (
              <>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Heart className="w-8 h-8 text-red-600 mb-2" />
                  <h3 className="font-medium">My Favorites</h3>
                  <p className="text-sm text-gray-600">View saved properties</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Search className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-medium">Search Properties</h3>
                  <p className="text-sm text-gray-600">Find your dream home</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Eye className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-medium">Recent Views</h3>
                  <p className="text-sm text-gray-600">Recently viewed properties</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
