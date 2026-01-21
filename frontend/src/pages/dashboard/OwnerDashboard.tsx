import { useState } from 'react';
import { Shield, Users, Settings, BarChart3, Globe, CreditCard, Server, Bell } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const OwnerDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const mockSystemStats = {
    totalUsers: 1245,
    totalSellers: 89,
    totalAdmins: 8,
    totalListings: 456,
    activeListings: 423,
    platformRevenue: 125000,
    growthRate: 24.5,
    uptime: 99.9,
  };

  const mockRecentActivity = [
    { id: 1, action: 'New seller registered', user: 'John Doe', time: '10 min ago', type: 'user' },
    { id: 2, action: 'Apartment marked as sold', user: 'Sarah Smith', time: '25 min ago', type: 'sale' },
    { id: 3, action: 'Admin created new manager', user: 'Alex Johnson', time: '1 hour ago', type: 'admin' },
    { id: 4, action: 'System backup completed', user: 'System', time: '2 hours ago', type: 'system' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Complete system oversight and management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 rounded-full bg-purple-100 text-purple-800 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <span className="font-medium">OWNER_ADMIN</span>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{mockSystemStats.totalUsers}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600 font-medium">
            +{mockSystemStats.growthRate}% growth
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${mockSystemStats.platformRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600 font-medium">
            Monthly revenue
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-semibold text-gray-900">{mockSystemStats.uptime}%</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Server className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600 font-medium">
            Last 30 days
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Listings</p>
              <p className="text-2xl font-semibold text-gray-900">{mockSystemStats.activeListings}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <Globe className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            of {mockSystemStats.totalListings} total
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Management</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Management */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-900">User Management</h4>
                </div>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • Create new seller account
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • Create manager admin
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • View all users
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • Export user data
                  </button>
                </div>
              </div>

              {/* System Settings */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Settings className="h-5 w-5 text-purple-600 mr-2" />
                  <h4 className="font-medium text-gray-900">System Settings</h4>
                </div>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • Platform configuration
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • Email templates
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • Payment settings
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • API keys
                  </button>
                </div>
              </div>

              {/* Analytics */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Analytics & Reports</h4>
                </div>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • Generate financial report
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • User activity analytics
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • Platform performance
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • Export all data
                  </button>
                </div>
              </div>

              {/* System Tools */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Server className="h-5 w-5 text-red-600 mr-2" />
                  <h4 className="font-medium text-gray-900">System Tools</h4>
                </div>
                <div className="space-y-2">
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • Database backup
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • Cache clearing
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • System logs
                  </button>
                  <button className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded">
                    • Maintenance mode
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                    <Bell className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-gray-500">
                      by {activity.user} • {activity.time}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.type === 'user' ? 'bg-blue-100 text-blue-800' :
                    activity.type === 'sale' ? 'bg-green-100 text-green-800' :
                    activity.type === 'admin' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - System Status */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">API Service</span>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  Online
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Database</span>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  Healthy
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">File Storage</span>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  78% used
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Email Service</span>
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  Active
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Backup System</span>
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                  Pending
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Run System Diagnostics
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">New Users Today</div>
                <div className="text-2xl font-bold text-gray-900">18</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">New Listings Today</div>
                <div className="text-2xl font-bold text-gray-900">7</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">API Requests (24h)</div>
                <div className="text-2xl font-bold text-gray-900">24.5K</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Avg Response Time</div>
                <div className="text-2xl font-bold text-gray-900">142ms</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500 mb-2">System Load</div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 rounded-full" style={{ width: '65%' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>65%</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;