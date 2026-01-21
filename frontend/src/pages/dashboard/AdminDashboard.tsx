import { useState } from 'react';
import { EyeOff, CheckCircle, XCircle, AlertTriangle, Filter } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('pending');

  // Mock data
  const mockPendingReviews = [
    { id: 1, title: 'Luxury apartment in downtown', seller: 'John Smith', submitted: '2 hours ago', issues: 0 },
    { id: 2, title: 'Family house with garden', seller: 'Sarah Johnson', submitted: '5 hours ago', issues: 2 },
    { id: 3, title: 'Modern studio apartment', seller: 'Mike Wilson', submitted: '1 day ago', issues: 1 },
  ];

  const mockFlaggedContent = [
    { id: 1, title: 'Suspicious pricing', reporter: 'user123', reason: 'Price seems too low', status: 'unresolved' },
    { id: 2, title: 'Inappropriate images', reporter: 'user456', reason: 'Non-apartment photos', status: 'resolved' },
    { id: 3, title: 'False information', reporter: 'user789', reason: 'Wrong location data', status: 'investigating' },
  ];

  const mockStats = {
    pendingReviews: 12,
    todayApprovals: 8,
    todayRejections: 2,
    flaggedContent: 5,
    hiddenListings: 3,
    suspendedUsers: 1,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Moderate content and manage platform integrity
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
          <span className="text-sm font-medium">Role: {user?.role}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.pendingReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Approvals</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.todayApprovals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Rejections</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.todayRejections}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <EyeOff className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hidden Listings</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.hiddenListings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {['pending', 'flagged', 'hidden', 'users'].map((tab) => (
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
          {activeTab === 'pending' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Pending Reviews</h3>
                <div className="flex items-center space-x-3">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>All Sellers</option>
                    <option>New Sellers</option>
                    <option>Verified Sellers</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {mockPendingReviews.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Seller: {item.seller} • Submitted: {item.submitted}
                        {item.issues > 0 && (
                          <span className="ml-3 text-red-600">
                            {item.issues} issue{item.issues !== 1 ? 's' : ''} found
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
                        Reject
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium">
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'flagged' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Flagged Content</h3>
              <div className="space-y-4">
                {mockFlaggedContent.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{item.title}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'resolved'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'investigating'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Reporter: {item.reporter} • Reason: {item.reason}
                    </div>
                    <div className="flex space-x-3">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View Details
                      </button>
                      <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                        Contact Reporter
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                        Remove Content
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hidden' && (
            <div className="text-center py-8">
              <EyeOff className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Hidden listings management</p>
              <p className="text-sm text-gray-400 mt-2">
                View and manage all hidden apartment listings
              </p>
              <button className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                View Hidden Listings
              </button>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">User management tools</p>
              <p className="text-sm text-gray-400 mt-2">
                Manage user accounts, warnings, and suspensions
              </p>
              <button className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Manage Users
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Tools */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <div className="font-medium text-gray-900">Bulk Hide/Unhide</div>
            <div className="text-sm text-gray-500 mt-1">Hide or unhide multiple listings</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <div className="font-medium text-gray-900">Content Export</div>
            <div className="text-sm text-gray-500 mt-1">Export listing data for review</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <div className="font-medium text-gray-900">Analytics Report</div>
            <div className="text-sm text-gray-500 mt-1">Generate platform analytics</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;