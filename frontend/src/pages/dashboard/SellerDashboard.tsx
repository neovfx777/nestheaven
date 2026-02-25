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
  MessageSquare,
  List,
  FileText,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { apartmentsApi, Apartment } from '../../api/apartments';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

interface Listing {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  price: number;
  rooms: number;
  area: number;
  status: 'ACTIVE' | 'HIDDEN' | 'SOLD' | 'active' | 'hidden' | 'sold';
  coverImage: string | null;
  createdAt: string;
  views?: number;
  inquiries?: number;
  complex?: {
    id: string;
    name: string;
  };
  title?: { uz: string; ru: string; en: string };
  images?: Array<{ id: string; url: string; order: number }>;
  seller?: {
    id: string;
    fullName: string;
    email: string;
  };
}

const SellerDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const listingsData = await apartmentsApi.getMyListings();
      
      const formattedListings: Listing[] = listingsData.map((apartment: Apartment) => ({
        id: apartment.id,
        titleUz: apartment.title?.uz || apartment.titleUz || '',
        titleRu: apartment.title?.ru || apartment.titleRu || '',
        titleEn: apartment.title?.en || apartment.titleEn || '',
        price: apartment.price,
        rooms: apartment.rooms,
        area: apartment.area,
        status: (apartment.status?.toUpperCase() as any) || 'ACTIVE',
        coverImage: apartment.coverImage || (apartment.images?.[0]?.url || null),
        createdAt: apartment.createdAt,
        views: 0,
        inquiries: 0,
        complex: apartment.complex ? {
          id: apartment.complex.id,
          name: typeof apartment.complex.name === 'string' 
            ? apartment.complex.name 
            : apartment.complex.name?.uz || apartment.complex.name?.en || apartment.complex.name?.ru || 'Unknown'
        } : undefined,
        title: apartment.title,
        images: apartment.images,
        seller: apartment.seller
      }));
      
      setListings(formattedListings);
      calculateStats(formattedListings);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setListings([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (listingsData: Listing[]) => {
    const dataArray = Array.isArray(listingsData) ? listingsData : [];
    
    const statsData = {
      totalListings: dataArray.length,
      activeListings: dataArray.filter(l => 
        l.status === 'ACTIVE' || l.status === 'active'
      ).length,
      soldListings: dataArray.filter(l => 
        l.status === 'SOLD' || l.status === 'sold'
      ).length,
      hiddenListings: dataArray.filter(l => 
        l.status === 'HIDDEN' || l.status === 'hidden'
      ).length,
      totalViews: dataArray.reduce((sum, l) => sum + (l.views || 0), 0),
      totalInquiries: dataArray.reduce((sum, l) => sum + (l.inquiries || 0), 0),
      estimatedRevenue: dataArray.filter(l => 
        l.status === 'SOLD' || l.status === 'sold'
      ).reduce((sum, l) => sum + l.price, 0),
    };
    setStats(statsData);
  };

  const handleDeleteListing = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        setListings(listings.filter(l => l.id !== id));
      } catch (error) {
        console.error('Failed to delete listing:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
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
    return listing.titleEn || listing.titleUz || listing.titleRu || 'Untitled';
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = searchTerm === '' || 
      getTitle(listing).toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.complex?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      listing.status === statusFilter ||
      listing.status.toUpperCase() === statusFilter.toUpperCase();
    
    return matchesSearch && matchesStatus;
  });

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
              Good afternoon, {user?.email}! Manage your listings and track performance
            </p>
          </div>
          {activeTab === 'listings' && (
            <Link to="/dashboard/seller/apartments/new">
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Create New Listing
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'listings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Manage Listings
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </div>
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
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
                  <p className="text-xs text-gray-500">Available properties</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Sold Properties</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.soldListings}</p>
                  <p className="text-xs text-gray-500">Successfully sold</p>
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
                  <p className="text-xs text-gray-500">Listing views</p>
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
                  <p className="text-xs text-gray-500">Customer inquiries</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* FIXED: Changed to correct route */}
                <Link to="/dashboard/seller/listings">
                  <Card className="p-4 border hover:border-primary-500 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <List className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">My Listings</div>
                        <div className="text-sm text-gray-500">Manage your properties</div>
                      </div>
                    </div>
                  </Card>
                </Link>
                <button onClick={() => setActiveTab('analytics')}>
                  <Card className="p-4 border hover:border-primary-500 transition-colors cursor-pointer w-full text-left">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-50 text-green-600">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Sales Analytics</div>
                        <div className="text-sm text-gray-500">Track your performance</div>
                      </div>
                    </div>
                  </Card>
                </button>
                <Link to="/dashboard/seller/apartments/new">
                  <Card className="p-4 border hover:border-primary-500 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                        <PlusCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">Add Listing</div>
                        <div className="text-sm text-gray-500">Create new property listing</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <Card>
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Manage Your Listings</h3>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="md:w-64"
                />
                
                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'SOLD', label: 'Sold' },
                    { value: 'HIDDEN', label: 'Hidden' },
                  ]}
                  className="w-full md:w-40"
                />
                
                <Button onClick={fetchListings} variant="outline">
                  Refresh
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredListings.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No listings found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try changing your search filters' 
                      : 'Create your first listing to get started'}
                  </p>
                  <Link to="/dashboard/seller/apartments/new" className="mt-4 inline-block">
                    <Button>Create New Listing</Button>
                  </Link>
                </div>
              ) : (
                filteredListings.map((listing) => (
                  <Card key={listing.id} className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-medium">{getTitle(listing)}</div>
                          {getStatusBadge(listing.status)}
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>${listing.price.toLocaleString()} • {listing.rooms} rooms • {listing.area} m²</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span>Complex: {listing.complex?.name || 'None'}</span>
                            <span>•</span>
                            <span>Listed on {new Date(listing.createdAt).toLocaleDateString()}</span>
                            {listing.views !== undefined && listing.views > 0 && (
                              <>
                                <span>•</span>
                                <span>{listing.views} views</span>
                              </>
                            )}
                            {listing.inquiries !== undefined && listing.inquiries > 0 && (
                              <>
                                <span>•</span>
                                <span>{listing.inquiries} inquiries</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
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
                        {(listing.status === 'ACTIVE' || listing.status === 'active') && (
                          <button
                            onClick={() => handleDeleteListing(listing.id)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                      style={{ width: `${stats.totalListings > 0 ? (stats.activeListings / stats.totalListings) * 100 : 0}%` }}
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
                      style={{ width: `${Math.min(100, stats.totalListings > 0 ? Math.round(stats.totalViews / stats.totalListings) / 50 * 100 : 0)}%` }}
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
                      style={{ width: `${stats.totalViews > 0 ? Math.min(100, (stats.totalInquiries / stats.totalViews) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Status Distribution</h4>
              <div className="space-y-4">
                {[
                  { label: 'Active', value: stats.activeListings, color: 'bg-green-500', text: 'text-green-700' },
                  { label: 'Sold', value: stats.soldListings, color: 'bg-red-500', text: 'text-red-700' },
                  { label: 'Hidden', value: stats.hiddenListings, color: 'bg-gray-400', text: 'text-gray-700' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.value}</span>
                      <span className={`text-sm ${item.text}`}>
                        ({stats.totalListings > 0 ? ((item.value / stats.totalListings) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Listing Management</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                className="text-left p-4 border rounded-lg hover:border-primary-500 hover:bg-blue-50 transition-colors"
                onClick={() => navigate('/dashboard/seller/apartments/new')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <PlusCircle className="h-5 w-5 text-blue-600" />
                  <div className="font-medium">Create New</div>
                </div>
                <div className="text-sm text-gray-600">Add new apartment listing</div>
              </button>
              
              <button 
                className="text-left p-4 border rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                onClick={() => {/* Mark as sold logic */}}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="font-medium">Mark as Sold</div>
                </div>
                <div className="text-sm text-gray-600">Update sold listings</div>
              </button>
              
              <button 
                className="text-left p-4 border rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
                onClick={() => {/* Hide/Show logic */}}
              >
                <div className="flex items-center gap-2 mb-2">
                  <EyeOff className="h-5 w-5 text-yellow-600" />
                  <div className="font-medium">Hide/Show</div>
                </div>
                <div className="text-sm text-gray-600">Manage listing visibility</div>
              </button>
              
              <button 
                className="text-left p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                onClick={() => {/* Export logic */}}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <div className="font-medium">Export Data</div>
                </div>
                <div className="text-sm text-gray-600">Download analytics report</div>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Tips Section */}
      {activeTab === 'overview' && (
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
      )}
    </div>
  );
};

export default SellerDashboard;
