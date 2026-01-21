import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  PlusCircle, 
  Eye, 
  EyeOff, 
  DollarSign, 
  BarChart3,
  Edit3,
  Trash2
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const SellerDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('listings');

  // Mock data
  const mockListings = [
    { id: 1, title: 'Modern 3-bedroom apartment', price: 150000, status: 'ACTIVE', views: 124, inquiries: 8 },
    { id: 2, title: 'Luxury penthouse', price: 350000, status: 'SOLD', views: 256, inquiries: 15 },
    { id: 3, title: 'City center studio', price: 85000, status: 'HIDDEN', views: 45, inquiries: 3 },
    { id: 4, title: 'Family apartment with garden', price: 220000, status: 'ACTIVE', views: 89, inquiries: 5 },
  ];

  const mockStats = {
    totalListings: 4,
    activeListings: 2,
    soldListings: 1,
    hiddenListings: 1,
    totalViews: 514,
    totalInquiries: 31,
    estimatedRevenue: 350000,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your apartment listings and track performance
            </p>
          </div>
          <Link
            to="/dashboard/listings/create"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Create New Listing
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Listings</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.activeListings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Estimated Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${mockStats.estimatedRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Eye className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.totalViews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inquiries</p>
              <p className="text-2xl font-semibold text-gray-900">{mockStats.totalInquiries}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {['listings', 'analytics', 'performance'].map((tab) => (
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
          {activeTab === 'listings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Your Listings</h3>
                <div className="flex space-x-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Sold</option>
                    <option>Hidden</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>Sort by: Newest</option>
                    <option>Sort by: Price</option>
                    <option>Sort by: Views</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {mockListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="font-medium">{listing.title}</div>
                        <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${
                          listing.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : listing.status === 'SOLD'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        ${listing.price.toLocaleString()} • {listing.views} views • {listing.inquiries} inquiries
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/apartments/${listing.id}`}
                        className="text-primary-600 hover:text-primary-700 p-2"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        className="text-gray-600 hover:text-gray-800 p-2"
                        title="Edit"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-red-600 p-2"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Listing Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Performance Overview</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Active Listings</span>
                        <span>{mockStats.activeListings}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-600 rounded-full" 
                          style={{ width: `${(mockStats.activeListings / mockStats.totalListings) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Views per Listing</span>
                        <span>{Math.round(mockStats.totalViews / mockStats.totalListings)}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600 rounded-full" 
                          style={{ width: '65%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Inquiry Conversion Rate</span>
                        <span>{((mockStats.totalInquiries / mockStats.totalViews) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full" 
                          style={{ width: `${(mockStats.totalInquiries / mockStats.totalViews) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-medium">Mark as Sold</div>
                      <div className="text-sm text-gray-500">Update sold listings</div>
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-medium">Hide/Show Listings</div>
                      <div className="text-sm text-gray-500">Manage listing visibility</div>
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-medium">Update Prices</div>
                      <div className="text-sm text-gray-500">Bulk price updates</div>
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-medium">Export Data</div>
                      <div className="text-sm text-gray-500">Download analytics</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Performance analytics coming soon</p>
              <p className="text-sm text-gray-400 mt-2">
                Detailed performance metrics and insights will be available here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Seller Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="font-medium text-blue-800 mb-2">High-Quality Photos</div>
            <p className="text-sm text-blue-700">
              Listings with professional photos get 3x more views.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="font-medium text-blue-800 mb-2">Detailed Descriptions</div>
            <p className="text-sm text-blue-700">
              Complete all multi-language fields for better reach.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="font-medium text-blue-800 mb-2">Quick Responses</div>
            <p className="text-sm text-blue-700">
              Respond to inquiries within 24 hours for best results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;