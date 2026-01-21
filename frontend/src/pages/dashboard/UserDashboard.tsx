import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Bell, Eye } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const UserDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('favorites');

  // Mock data - in real app, this would come from API
  const mockFavorites = [
    { id: 1, title: 'Modern 3-bedroom apartment', price: 150000, status: 'ACTIVE' },
    { id: 2, title: 'Luxury penthouse', price: 350000, status: 'SOLD' },
    { id: 3, title: 'City center studio', price: 85000, status: 'ACTIVE' },
  ];

  const mockSearches = [
    { id: 1, query: '3 bedroom apartments', count: 24, lastUsed: '2024-01-15' },
    { id: 2, query: 'apartments near metro', count: 18, lastUsed: '2024-01-10' },
    { id: 3, query: 'new buildings', count: 42, lastUsed: '2024-01-05' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.fullName}!</h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your account.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100 text-pink-600">
              <Heart className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Favorites</p>
              <p className="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Search className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Saved Searches</p>
              <p className="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Eye className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recently Viewed</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {['favorites', 'searches', 'notifications'].map((tab) => (
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
          {activeTab === 'favorites' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Favorite Apartments</h3>
              {mockFavorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't saved any apartments yet.</p>
                  <Link
                    to="/apartments"
                    className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Browse apartments →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockFavorites.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium">{apt.title}</div>
                        <div className="text-sm text-gray-500">${apt.price.toLocaleString()}</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {apt.status}
                        </span>
                        <Link
                          to={`/apartments/${apt.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'searches' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Searches</h3>
              <div className="space-y-4">
                {mockSearches.map((search) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{search.query}</div>
                      <div className="text-sm text-gray-500">
                        {search.count} results • Last used {search.lastUsed}
                      </div>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Run Search
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No new notifications</p>
              <p className="text-sm text-gray-400 mt-2">
                We'll notify you when there are new apartments matching your criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/apartments"
            className="p-4 border border-gray-200 rounded-lg text-center hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Search className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <div className="font-medium">Browse Apartments</div>
          </Link>
          <Link
            to="/apartments?sortBy=createdAt&sortOrder=desc"
            className="p-4 border border-gray-200 rounded-lg text-center hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Eye className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <div className="font-medium">New Listings</div>
          </Link>
          <Link
            to="/complexes"
            className="p-4 border border-gray-200 rounded-lg text-center hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <Building2 className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <div className="font-medium">View Complexes</div>
          </Link>
          <button
            onClick={() => {/* Update profile */}}
            className="p-4 border border-gray-200 rounded-lg text-center hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <User className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <div className="font-medium">Edit Profile</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;