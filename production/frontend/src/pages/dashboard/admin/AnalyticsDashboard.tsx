import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, Home, Building, TrendingUp, DollarSign, 
  BarChart3, PieChart as PieChartIcon, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import apiClient from '../../../api/client';

// Color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const STATUS_COLORS = {
  active: '#10B981',
  sold: '#3B82F6',
  hidden: '#6B7280'
};

export function AnalyticsDashboard() {
  // Fetch analytics data from backend
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: any }>(
        '/analytics/stats'
      );
      if (!response.data?.success) {
        throw new Error('Failed to fetch analytics');
      }
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600">Failed to load analytics data</p>
          <p className="text-gray-500 text-sm mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  const data = stats?.data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Platform insights and performance metrics</p>
        </div>
      </div>

      {/* Overview Cards */}
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
              {data.users?.total?.toLocaleString() || 0}
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
              {data.apartments?.active?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.apartments?.total?.toLocaleString() || 0} total listings
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
              {data.apartments?.sold?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.apartments?.hidden?.toLocaleString() || 0} hidden
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
              {data.complexes?.total?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.apartments?.total && data.complexes?.total 
                ? Math.round(data.apartments.total / data.complexes.total) 
                : 0} avg. listings/complex
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Listing Status Distribution
            </CardTitle>
            <CardDescription>Current status of all listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Active</span>
                </div>
                <span className="text-sm font-bold">{data.apartments?.active?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Sold</span>
                </div>
                <span className="text-sm font-bold">{data.apartments?.sold?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-sm font-medium">Hidden</span>
                </div>
                <span className="text-sm font-bold">{data.apartments?.hidden?.toLocaleString() || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Overview
            </CardTitle>
            <CardDescription>User distribution by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium">Regular Users</span>
                </div>
                <span className="text-sm font-bold">{data.users?.total?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium">Sellers</span>
                </div>
                <span className="text-sm font-bold">{data.users?.sellers?.toLocaleString() || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}