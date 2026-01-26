import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Users, Home, Building, TrendingUp, DollarSign, 
  MapPin, Heart, Search, Download, Calendar,
  BarChart3, PieChart as PieChartIcon, Map
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';

// Color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const STATUS_COLORS = {
  ACTIVE: '#10B981',
  SOLD: '#3B82F6',
  HIDDEN: '#6B7280'
};

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  // Fetch analytics data
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/overview');
      if (!response.ok) throw new Error('Failed to fetch overview');
      return response.json();
    }
  });

  const { data: userGrowth, isLoading: growthLoading } = useQuery({
    queryKey: ['analytics-user-growth', dateRange],
    queryFn: async () => {
      const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : dateRange === '1y' ? 365 : 30;
      const response = await fetch(`/api/analytics/user-growth?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch user growth');
      return response.json();
    }
  });

  const { data: apartmentGrowth, isLoading: apartmentLoading } = useQuery({
    queryKey: ['analytics-apartment-growth', dateRange],
    queryFn: async () => {
      const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : dateRange === '1y' ? 365 : 30;
      const response = await fetch(`/api/analytics/apartment-growth?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch apartment growth');
      return response.json();
    }
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/revenue?months=12');
      if (!response.ok) throw new Error('Failed to fetch revenue data');
      return response.json();
    }
  });

  const { data: topPerformers, isLoading: performersLoading } = useQuery({
    queryKey: ['analytics-top-performers'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/top-performers?limit=10');
      if (!response.ok) throw new Error('Failed to fetch top performers');
      return response.json();
    }
  });

  const { data: geographicData, isLoading: geoLoading } = useQuery({
    queryKey: ['analytics-geographic'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/geographic');
      if (!response.ok) throw new Error('Failed to fetch geographic data');
      return response.json();
    }
  });

  const { data: userEngagement, isLoading: engagementLoading } = useQuery({
    queryKey: ['analytics-user-engagement', dateRange],
    queryFn: async () => {
      const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : dateRange === '1y' ? 365 : 30;
      const response = await fetch(`/api/analytics/user-engagement?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch user engagement');
      return response.json();
    }
  });

  const { data: listingPerformance, isLoading: performanceLoading } = useQuery({
    queryKey: ['analytics-listing-performance', period],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/listing-performance?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch listing performance');
      return response.json();
    }
  });

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch(`/api/analytics/export?type=${format}`);
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${format}-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${format}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export analytics data');
    }
  };

  const isLoading = overviewLoading || growthLoading || apartmentLoading || 
                    revenueLoading || performersLoading || geoLoading || 
                    engagementLoading || performanceLoading;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Platform insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={dateRange}
            onValueChange={(value: any) => setDateRange(value)}
            className="w-32"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </Select>
          <Select
            value={period}
            onValueChange={(value: any) => setPeriod(value)}
            className="w-32"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </Select>
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
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
              {overview?.data?.totals?.users?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +{overview?.data?.growth?.users?.slice(-1)[0]?.count || 0} this period
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
              {overview?.data?.totals?.activeApartments?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {overview?.data?.totals?.apartments?.toLocaleString() || 0} total listings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue (Sold)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenueData?.data?.slice(-1)[0]?.revenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Last month
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
              {overview?.data?.totals?.complexes?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {overview?.data?.totals?.apartments && overview?.data?.totals?.complexes 
                ? Math.round(overview.data.totals.apartments / overview.data.totals.complexes) 
                : 0} avg. listings/complex
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              User Growth
            </CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowth?.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="New Users" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Listing Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Listing Status Distribution
            </CardTitle>
            <CardDescription>Current status of all listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: overview?.data?.totals?.activeApartments || 0 },
                      { name: 'Sold', value: overview?.data?.totals?.soldApartments || 0 },
                      { name: 'Hidden', value: (overview?.data?.totals?.apartments || 0) - 
                        (overview?.data?.totals?.activeApartments || 0) - 
                        (overview?.data?.totals?.soldApartments || 0) }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill={STATUS_COLORS.ACTIVE} />
                    <Cell fill={STATUS_COLORS.SOLD} />
                    <Cell fill={STATUS_COLORS.HIDDEN} />
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Listings']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Monthly Revenue
            </CardTitle>
            <CardDescription>Revenue from sold apartments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData?.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(month) => format(new Date(month + '-01'), 'MMM yy')}
                  />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip 
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    labelFormatter={(month) => format(new Date(month + '-01'), 'MMMM yyyy')}
                  />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    name="Revenue" 
                    fill="#10B981" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Sold Apartments" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              User Engagement
            </CardTitle>
            <CardDescription>Favorites, searches, and logins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userEngagement?.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="favorites" 
                    name="Favorites" 
                    stroke="#EC4899" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="searches" 
                    name="Searches" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="logins" 
                    name="Logins" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Performing Complexes
          </CardTitle>
          <CardDescription>Complexes with most listings and sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Complex</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total Listings</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Active</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sold</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Highest Price</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers?.data?.complexes?.map((complex: any, index: number) => (
                  <tr key={complex.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold">{index + 1}</span>
                        </div>
                        <span className="font-medium">{complex.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{complex.totalListings}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {complex.activeListings}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {complex.soldListings}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      ${complex.highestPrice?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Listing Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Listing Performance
          </CardTitle>
          <CardDescription>Top performing listings by views and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Listing</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Complex</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Views</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Favorites</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Views/Day</th>
                </tr>
              </thead>
              <tbody>
                {listingPerformance?.data?.slice(0, 10).map((listing: any) => (
                  <tr key={listing.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{listing.title}</td>
                    <td className="py-3 px-4">{listing.complexName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        listing.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">${listing.price?.toLocaleString()}</td>
                    <td className="py-3 px-4">{listing.views}</td>
                    <td className="py-3 px-4">{listing.favorites}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{listing.viewsPerDay?.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}