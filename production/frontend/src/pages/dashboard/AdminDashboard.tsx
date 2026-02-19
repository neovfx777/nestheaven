import React, { useState } from 'react';
import { EyeOff, CheckCircle, AlertTriangle, Filter, Eye, Shield } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { AdminApartments } from './admin/AdminApartments';
import { ComplexList } from './admin/ComplexList';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';
import { UserManagement } from './admin/UserManagement';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { apartmentsApi } from '../../api/apartments';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('apartments');

  // Fetch real statistics - YANGI VA XAVFSIZ VERSIYA
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        // O'zaro chaqiruvlardan qochish uchun oddiyroq yondashuv
        const apartmentsResponse = await apartmentsApi.getAllApartments({ 
          limit: 500 // 500 ta bilan cheklaymiz, server yukini kamaytiramiz
        });
        
        const allApartments = apartmentsResponse.apartments || [];
        
        // Statuslarni birlashtiramiz (backend katta/kichik harflar bilan qaytarishi mumkin)
        const activeCount = allApartments.filter(a => 
          a.status?.toUpperCase() === 'ACTIVE' || a.status === 'active'
        ).length;
        
        const hiddenCount = allApartments.filter(a => 
          a.status?.toUpperCase() === 'HIDDEN' || a.status === 'hidden'
        ).length;
        
        const soldCount = allApartments.filter(a => 
          a.status?.toUpperCase() === 'SOLD' || a.status === 'sold'
        ).length;
        
        // Pending reviews uchun oddiyroq hisob
        const pendingReviews = allApartments.filter(a => 
          (a.status?.toUpperCase() === 'ACTIVE' || a.status === 'active') && 
          (!a.images || a.images.length === 0)
        ).length;

        return {
          pendingReviews,
          activeListings: activeCount,
          hiddenListings: hiddenCount,
          soldListings: soldCount,
          totalListings: allApartments.length,
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
        return {
          pendingReviews: 0,
          activeListings: 0,
          hiddenListings: 0,
          soldListings: 0,
          totalListings: 0,
        };
      }
    },
    retry: 1, // 1 marta qayta urinish
    staleTime: 5 * 60 * 1000, // 5 daqiqa
  });

  const statsData = stats || {
    pendingReviews: 0,
    activeListings: 0,
    hiddenListings: 0,
    soldListings: 0,
    totalListings: 0,
  };

  // Manager/Owner-only areas (admin role should only moderate listings)
  const canAccessUserManagement = user?.role === 'OWNER_ADMIN' || user?.role === 'MANAGER_ADMIN';
  const canAccessComplexes = user?.role === 'MANAGER_ADMIN' || user?.role === 'OWNER_ADMIN';
  const canAccessAnalytics = user?.role === 'MANAGER_ADMIN' || user?.role === 'OWNER_ADMIN';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Moderate content and manage platform integrity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-green-100 text-green-800">
              <span className="text-sm font-medium">Role: {user?.role}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? '...' : statsData.pendingReviews}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Eye className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Listings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? '...' : statsData.activeListings}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <EyeOff className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hidden Listings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? '...' : statsData.hiddenListings}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sold Listings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? '...' : statsData.soldListings}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Card className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap">
            {[
              { id: 'apartments', label: 'Apartments', visible: true },
              { id: 'complexes', label: 'Complexes', visible: canAccessComplexes },
              { id: 'analytics', label: 'Analytics', visible: canAccessAnalytics },
              { id: 'users', label: 'Users', visible: canAccessUserManagement },
              { id: 'flagged', label: 'Flagged', visible: true },
              { id: 'reports', label: 'Reports', visible: true },
            ].map((tab) => {
              if (!tab.visible) return null;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'apartments' && <AdminApartments />}
          
          {activeTab === 'complexes' && canAccessComplexes && <ComplexList />}
          
          {activeTab === 'analytics' && canAccessAnalytics && <AnalyticsDashboard />}
          
          {activeTab === 'users' && canAccessUserManagement && <UserManagement />}
          
          {activeTab === 'flagged' && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Flagged Content Management</p>
              <p className="text-sm text-gray-400 mt-2">
                This feature is coming soon. Currently, you can manage flagged content through apartment moderation.
              </p>
              <Button
                onClick={() => setActiveTab('apartments')}
                className="mt-4"
              >
                Go to Apartment Moderation
              </Button>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Analytics & Reports</p>
              <p className="text-sm text-gray-400 mt-2">
                Detailed analytics and reporting features will be available in the next update.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="font-medium text-gray-900">Quick Stats</div>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div>Total Listings: {statsData.totalListings}</div>
                    <div>Active Rate: {statsData.totalListings > 0 
                      ? ((statsData.activeListings / statsData.totalListings) * 100).toFixed(1) 
                      : 0}%</div>
                    <div>Hidden Rate: {statsData.totalListings > 0 
                      ? ((statsData.hiddenListings / statsData.totalListings) * 100).toFixed(1) 
                      : 0}%</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="font-medium text-gray-900">Export Options</div>
                  <div className="mt-2 space-y-2">
                    <Button variant="outline" size="sm" className="w-full">Export All Listings</Button>
                    <Button variant="outline" size="sm" className="w-full">Export Hidden Listings</Button>
                    <Button variant="outline" size="sm" className="w-full">Export User Activity</Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Admin Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                setActiveTab('apartments');
                // You could add logic here to filter to only hidden apartments
              }}
              className="p-4 bg-white border border-blue-100 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <EyeOff className="h-5 w-5 text-blue-600" />
                <div className="font-medium text-blue-800">Review Hidden</div>
              </div>
              <div className="text-sm text-blue-700">
                Review and unhide hidden listings
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('apartments');
                // Filter to only active apartments
              }}
              className="p-4 bg-white border border-blue-100 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Eye className="h-5 w-5 text-green-600" />
                <div className="font-medium text-blue-800">Review New</div>
              </div>
              <div className="text-sm text-blue-700">
                Review newly added active listings
              </div>
            </button>

            {canAccessComplexes && (
              <button
                onClick={() => setActiveTab('complexes')}
                className="p-4 bg-white border border-blue-100 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <div className="font-medium text-blue-800">Manage Complexes</div>
                </div>
                <div className="text-sm text-blue-700">
                  Manage housing complexes and developers
                </div>
              </button>
            )}

            <button
              onClick={() => setActiveTab('reports')}
              className="p-4 bg-white border border-blue-100 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-orange-600" />
                <div className="font-medium text-blue-800">Generate Report</div>
              </div>
              <div className="text-sm text-blue-700">
                Generate moderation activity report
              </div>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
