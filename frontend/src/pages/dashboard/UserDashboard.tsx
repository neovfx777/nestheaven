import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, Bell, Eye, Building2, User, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { usersApi } from '../../api/users';
import { apartmentsApi } from '../../api/apartments';
import { FavoriteButton } from '../../components/apartments/FavoriteButton';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('favorites');
  const queryClient = useQueryClient();

  // Fetch favorites
  const {
    data: favoritesData,
    isLoading: favoritesLoading,
    refetch: refetchFavorites,
  } = useQuery({
    queryKey: ['user-favorites'],
    queryFn: () => usersApi.getFavorites(1, 10),
    enabled: activeTab === 'favorites',
  });

  // Fetch saved searches
  const {
    data: savedSearches = [],
    isLoading: searchesLoading,
    refetch: refetchSearches,
  } = useQuery({
    queryKey: ['user-saved-searches'],
    queryFn: () => usersApi.getSavedSearches(),
    enabled: activeTab === 'searches',
  });

  // Delete saved search mutation
  const deleteSearchMutation = useMutation({
    mutationFn: (searchId: string) => usersApi.deleteSavedSearch(searchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-saved-searches'] });
      toast.success('Search deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete search');
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: (apartmentId: string) => usersApi.removeFavorite(apartmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      toast.success('Removed from favorites');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove favorite');
    },
  });

  const handleRunSearch = async (searchId: string, filters: any) => {
    try {
      await usersApi.updateLastUsed(searchId);
      // Convert filters to URL params and redirect to apartments page
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });
      window.location.href = `/apartments?${params.toString()}`;
    } catch (error: any) {
      toast.error(error.message || 'Failed to run search');
    }
  };

  const handleRemoveFavorite = async (apartmentId: string) => {
    if (window.confirm('Are you sure you want to remove this from favorites?')) {
      await removeFavoriteMutation.mutateAsync(apartmentId);
    }
  };

  const stats = {
    favorites: favoritesData?.pagination.total || 0,
    savedSearches: savedSearches.length || 0,
    // For recently viewed, we'd need to implement this separately
    recentlyViewed: 0,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderContent = () => {
    if (activeTab === 'favorites') {
      if (favoritesLoading) {
        return (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading favorites...</p>
          </div>
        );
      }

      const favorites = favoritesData?.apartments || [];

      if (favorites.length === 0) {
        return (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You haven't saved any apartments yet.</p>
            <Link
              to="/apartments"
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
            >
              Browse apartments →
            </Link>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {favorites.map((apartment: any) => (
            <Card key={apartment.id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-medium text-gray-900">{apartment.titleEn}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apartment.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : apartment.status === 'SOLD'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {apartment.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>${apartment.price.toLocaleString()} • {apartment.rooms} rooms • {apartment.area}m²</p>
                    <p>Saved on {formatDate(apartment.favoritedAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Link
                    to={`/apartments/${apartment.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFavorite(apartment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {favoritesData && favoritesData.pagination.total > 10 && (
            <div className="text-center pt-4">
              <Link to="/dashboard/favorites">
                <Button variant="outline">
                  View All Favorites ({favoritesData.pagination.total})
                </Button>
              </Link>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'searches') {
      if (searchesLoading) {
        return (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-500">Loading saved searches...</p>
          </div>
        );
      }

      if (savedSearches.length === 0) {
        return (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">You haven't saved any searches yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Save your search criteria while browsing apartments
            </p>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {savedSearches.map((search) => (
            <Card key={search.id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">{search.name}</div>
                  <div className="text-sm text-gray-600">
                    Last used: {formatDate(search.lastUsed)}
                    {search.resultsCount && ` • ${search.resultsCount} results last time`}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Filters: {Object.keys(search.filters || {}).length} applied
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunSearch(search.id, search.filters)}
                  >
                    Run Search
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSearchMutation.mutate(search.id)}
                    disabled={deleteSearchMutation.isPending}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (activeTab === 'notifications') {
      return (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No new notifications</p>
          <p className="text-sm text-gray-400 mt-2">
            We'll notify you when there are new apartments matching your criteria
          </p>
        </div>
      );
    }

    return null;
  };

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
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-pink-100 text-pink-600">
              <Heart className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Favorites</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.favorites}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Search className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Saved Searches</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.savedSearches}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Eye className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recently Viewed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.recentlyViewed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="mb-8">
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
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'favorites' && 'Your Favorite Apartments'}
              {activeTab === 'searches' && 'Saved Searches'}
              {activeTab === 'notifications' && 'Notifications'}
            </h3>
          </div>
          {renderContent()}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
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
      </Card>
    </div>
  );
};

export default UserDashboard;