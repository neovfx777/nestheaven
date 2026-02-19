import { useState } from 'react';
import { Users, UserPlus, Shield, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const ManagerDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('admins');

  // Mock data
  const mockAdmins = [
    { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'ADMIN', created: '2024-01-15', active: true },
    { id: 2, name: 'Maria Garcia', email: 'maria@example.com', role: 'ADMIN', created: '2024-01-10', active: true },
    { id: 3, name: 'David Smith', email: 'david@example.com', role: 'ADMIN', created: '2024-01-05', active: false },
  ];

  const mockAdminRequests = [
    { id: 1, name: 'Robert Brown', email: 'robert@example.com', requested: '2 days ago', experience: '3 years' },
    { id: 2, name: 'Lisa Wang', email: 'lisa@example.com', requested: '1 day ago', experience: '5 years' },
  ];

  const mockStats = {
    totalAdmins: 8,
    activeAdmins: 7,
    pendingRequests: 2,
    newAdminsThisMonth: 3,
    adminActivity: 94,
    averageResponseTime: '2.4 hours',
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage administrator accounts and oversee platform operations
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800">
          <Shield className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Role: {user?.role}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.totalAdmins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Admins</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.activeAdmins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <UserPlus className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admin Activity</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.adminActivity}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {['admins', 'requests', 'performance'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'admins' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Administrator Accounts</h3>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New Admin
                </button>
              </div>

              <div className="space-y-4">
                {mockAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{admin.name}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                        <div className="text-xs text-gray-400 mt-1">Created: {admin.created}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        admin.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {admin.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                        {admin.role}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                          {admin.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Admin Requests</h3>
              <div className="space-y-4">
                {mockAdminRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium">{request.name}</div>
                        <div className="text-sm text-gray-500">{request.email}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                        Pending
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                      Experience: {request.experience} • Requested: {request.requested}
                    </div>
                    
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                        Approve
                      </button>
                      <button className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
                        Reject
                      </button>
                      <button className="flex-1 border border-gray-300 py-2 rounded-md hover:bg-gray-50 text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Admin Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Activity Overview</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Response Time</span>
                        <span>{mockStats.averageResponseTime}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Content Approval Rate</span>
                        <span>92%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>User Satisfaction</span>
                        <span>4.8/5</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: '96%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-medium">Generate Performance Report</div>
                      <div className="text-sm text-gray-500">Create monthly admin performance report</div>
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-medium">Schedule Training</div>
                      <div className="text-sm text-gray-500">Organize admin training sessions</div>
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-medium">Review Admin Permissions</div>
                      <div className="text-sm text-gray-500">Audit and update admin access levels</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manager Tools */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manager Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <div className="font-medium text-gray-900">Admin Onboarding</div>
            <div className="text-sm text-gray-500 mt-1">Setup new admin accounts</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <div className="font-medium text-gray-900">Permission Management</div>
            <div className="text-sm text-gray-500 mt-1">Manage admin permissions</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <div className="font-medium text-gray-900">Audit Logs</div>
            <div className="text-sm text-gray-500 mt-1">Review admin activity logs</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;