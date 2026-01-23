import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  PlusCircle, 
  Eye, 
  EyeOff, 
  DollarSign, 
  BarChart3,
  Edit3,
  Trash2,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { apartmentsApi } from '../../api/apartments';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface Listing {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  price: number;
  rooms: number;
  area: number;
  status: 'ACTIVE' | 'HIDDEN' | 'SOLD';
  coverImage: string | null;
  createdAt: string;
  views?: number;
  inquiries?: number;
}

const SellerDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    hiddenListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    estimatedRevenue: 0,
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      // Note: You'll need to implement this API endpoint in your backend
      const response = await apartmentsApi.getMyListings?.();
      if (response) {
        setListings(response);
        calculateStats(response);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (listingsData: Listing[]) => {
    const statsData = {
      totalListings: listingsData.length,
      activeListings: listingsData.filter(l => l.status === 'ACTIVE').length,
      soldListings: listingsData.filter(l => l.status === 'SOLD').length,
      hiddenListings: listingsData.filter(l => l.status === 'HIDDEN').length,
      totalViews: listingsData.reduce((sum, l) => sum + (l.views || 0), 0),
      totalInquiries: listingsData.reduce((sum, l) => sum + (l.inquiries || 0), 0),
      estimatedRevenue: listingsData.filter(l => l.status === 'SOLD').reduce((sum, l) => sum + l.price, 0),
    };
    setStats(statsData);
  };

  const handleDeleteListing = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        // Note: You'll need to implement delete functionality in your API
        // await apartmentsApi.deleteListing(id);
        setListings(listings.filter(l => l.id !== id));
        // You should show a success toast here
      } catch (error) {
        console.error('Failed to delete listing:', error);
        // You should show an error toast here
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'SOLD':
        return <Badge variant="destructive">Sold</Badge>;
      case 'HIDDEN':
        return <Badge variant="secondary">Hidden</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTitle = (listing: Listing) => {
    const lang = 'en'; // You can make this dynamic based on user preference
    switch (lang) {
      case 'uz':
        return listing.titleUz;
      case 'ru':
        return listing.titleRu;
      default:
        return listing.titleEn;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your apartment listings and track performance
            </p>
          </div>
          <Link to="/dashboard/seller/apartments/new">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Create New Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Listings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeListings}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Estimated Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${stats.estimatedRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalViews}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Inquiries</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalInquiries}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {['listings', 'analytics'].map((tab) => (
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Your Listings</h3>
                <div className="flex gap-2">
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
                {listings.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No listings yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Create your first listing to get started
                    </p>
                    <Link to="/dashboard/seller/apartments/new" className="mt-4 inline-block">
                      <Button>Create Listing</Button>
                    </Link>
                  </div>
                ) : (
                  listings.map((listing) => (
                    <Card key={listing.id} className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="font-medium">{getTitle(listing)}</div>
                            {getStatusBadge(listing.status)}
                          </div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>${listing.price.toLocaleString()} • {listing.rooms} rooms • {listing.area} m²</p>
                            <p>Listed on {new Date(listing.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/apartments/${listing.id}`}
                            className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                            title="View"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link
                            to={`/dashboard/seller/apartments/edit/${listing.id}`}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Listing Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Performance Overview</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Active Listings</span>
                        <span>{stats.activeListings}/{stats.totalListings}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-600 rounded-full" 
                          style={{ width: `${(stats.activeListings / stats.totalListings) * 100 || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Views per Listing</span>
                        <span>{stats.totalListings > 0 ? Math.round(stats.totalViews / stats.totalListings) : 0}</span>
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
                        <span>{stats.totalViews > 0 ? ((stats.totalInquiries / stats.totalViews) * 100).toFixed(1) : '0'}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full" 
                          style={{ width: `${stats.totalViews > 0 ? (stats.totalInquiries / stats.totalViews) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
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
                </Card>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Seller Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </Card>
    </div>
  );
};

export default SellerDashboard;