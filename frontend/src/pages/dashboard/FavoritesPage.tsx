import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Search, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { apartmentsApi, Apartment } from '../../api/apartments';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface FavoriteItem {
  id: string;
  apartmentId: string;
  createdAt: string;
  apartment: Apartment;
}

const FavoritesPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);

  // Fetch favorites
  const {
    data: favorites = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      try {
        const response = await usersApi.getFavorites();
        
        // Agar response array bo'lsa
        if (Array.isArray(response)) {
          // Har bir favorite uchun apartment ma'lumotlarini olish
          const favoritesWithDetails = await Promise.all(
            response.map(async (favorite: any) => {
              try {
                const apartment = await apartmentsApi.getApartmentById(favorite.apartmentId);
                return {
                  id: favorite.id || favorite._id || Math.random().toString(),
                  apartmentId: favorite.apartmentId,
                  createdAt: favorite.createdAt || new Date().toISOString(),
                  apartment: apartment
                };
              } catch (error) {
                console.error(`Failed to fetch apartment ${favorite.apartmentId}:`, error);
                return null;
              }
            })
          );
          
          return favoritesWithDetails.filter(Boolean) as FavoriteItem[];
        }
        
        // Agar response object bo'lsa
        if (response && typeof response === 'object' && response.success) {
          const favoritesData = response.data || response.favorites || [];
          if (Array.isArray(favoritesData)) {
            const favoritesWithDetails = await Promise.all(
              favoritesData.map(async (favorite: any) => {
                try {
                  const apartment = await apartmentsApi.getApartmentById(favorite.apartmentId || favorite.id);
                  return {
                    id: favorite.id || favorite._id || Math.random().toString(),
                    apartmentId: favorite.apartmentId || favorite.id,
                    createdAt: favorite.createdAt || new Date().toISOString(),
                    apartment: apartment
                  };
                } catch (error) {
                  console.error(`Failed to fetch apartment:`, error);
                  return null;
                }
              })
            );
            return favoritesWithDetails.filter(Boolean) as FavoriteItem[];
          }
        }
        
        return [];
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (apartmentId: string) => {
      await usersApi.removeFavorite(apartmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setSelectedFavorites([]);
    },
  });

  // Remove selected favorites
  const removeSelectedFavorites = async () => {
    if (selectedFavorites.length === 0) return;
    
    try {
      for (const apartmentId of selectedFavorites) {
        await removeFavoriteMutation.mutateAsync(apartmentId);
      }
    } catch (error) {
      console.error('Failed to remove selected favorites:', error);
    }
  };

  // Filter favorites
  const filteredFavorites = favorites.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return item.apartment.status === 'active' || item.apartment.status === 'ACTIVE';
    }
    if (filter === 'sold') {
      return item.apartment.status === 'sold' || item.apartment.status === 'SOLD';
    }
    return true;
  });

  // Toggle selection
  const toggleSelection = (apartmentId: string) => {
    if (selectedFavorites.includes(apartmentId)) {
      setSelectedFavorites(selectedFavorites.filter(id => id !== apartmentId));
    } else {
      setSelectedFavorites([...selectedFavorites, apartmentId]);
    }
  };

  // Select all filtered
  const selectAllFiltered = () => {
    const filteredIds = filteredFavorites.map(item => item.apartmentId);
    if (selectedFavorites.length === filteredIds.length) {
      setSelectedFavorites([]);
    } else {
      setSelectedFavorites(filteredIds);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view favorites</h2>
          <p className="text-gray-600 mb-6">Please sign in to see your saved apartments.</p>
          <div className="space-x-4">
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading favorites</h2>
          <p className="text-gray-600 mb-6">We couldn't load your saved apartments. Please try again.</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            <p className="text-gray-600 mt-2">
              {favorites.length === 0 
                ? "You haven't saved any apartments yet"
                : `You have ${favorites.length} saved apartment${favorites.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          
          {favorites.length > 0 && (
            <div className="flex items-center gap-3">
              {selectedFavorites.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={removeSelectedFavorites}
                  disabled={removeFavoriteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Selected ({selectedFavorites.length})
                </Button>
              )}
              <Button variant="outline" onClick={selectAllFiltered}>
                {selectedFavorites.length === filteredFavorites.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {favorites.length > 0 && (
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter by:</span>
                </div>
                <div className="flex gap-2">
                  {['all', 'active', 'sold'].map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === filterType
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                      {filterType === 'all' && ` (${favorites.length})`}
                      {filterType === 'active' && ` (${favorites.filter(f => 
                        f.apartment.status === 'active' || f.apartment.status === 'ACTIVE'
                      ).length})`}
                      {filterType === 'sold' && ` (${favorites.filter(f => 
                        f.apartment.status === 'sold' || f.apartment.status === 'SOLD'
                      ).length})`}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                Showing {filteredFavorites.length} of {favorites.length} favorites
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <Card className="text-center py-16">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start browsing apartments and click the heart icon to save your favorites here.
          </p>
          <div className="space-x-4">
            <Link to="/apartments">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Browse Apartments
              </Button>
            </Link>
          </div>
        </Card>
      ) : filteredFavorites.length === 0 ? (
        <Card className="text-center py-16">
          <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No matches found</h2>
          <p className="text-gray-600 mb-6">
            No favorites match your current filter. Try changing the filter criteria.
          </p>
          <Button variant="outline" onClick={() => setFilter('all')}>
            Show All Favorites
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((item) => {
            const apartment = item.apartment;
            const isSelected = selectedFavorites.includes(item.apartmentId);
            
            return (
              <div key={item.id} className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(item.apartmentId)}
                    className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFavoriteMutation.mutate(item.apartmentId)}
                  disabled={removeFavoriteMutation.isPending}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                {/* Apartment Card */}
                <Link to={`/apartments/${item.apartmentId}`}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    {/* Image */}
                    <div className="h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      {apartment.coverImage ? (
                        <img
                          src={apartment.coverImage}
                          alt={apartment.title?.en || apartment.titleEn || 'Apartment'}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      {/* Status Badge */}
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                        apartment.status === 'active' || apartment.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : apartment.status === 'sold' || apartment.status === 'SOLD'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {apartment.status.toUpperCase()}
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {apartment.title?.en || apartment.titleEn || 'Apartment'}
                      </h3>
                      
                      {/* Price */}
                      <div className="text-2xl font-bold text-primary-600 mb-3">
                        {formatPrice(apartment.price)}
                      </div>
                      
                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center bg-gray-50 rounded-lg py-2">
                          <div className="font-bold">{apartment.rooms}</div>
                          <div className="text-xs text-gray-500">Rooms</div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg py-2">
                          <div className="font-bold">{apartment.area}</div>
                          <div className="text-xs text-gray-500">m²</div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg py-2">
                          <div className="font-bold">{apartment.floor}</div>
                          <div className="text-xs text-gray-500">Floor</div>
                        </div>
                      </div>
                      
                      {/* Location */}
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                        <span className="truncate">
                          {apartment.complex?.address?.en || apartment.complex?.address || 'Location not specified'}
                        </span>
                      </div>
                      
                      {/* Added Date */}
                      <div className="text-xs text-gray-500">
                        Added {formatDate(item.createdAt)}
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedFavorites.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="shadow-xl border border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                  {selectedFavorites.length}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedFavorites.length} selected</div>
                  <div className="text-sm text-gray-500">Click apartments to select/deselect</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFavorites([])}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={removeSelectedFavorites}
                  disabled={removeFavoriteMutation.isPending}
                >
                  {removeFavoriteMutation.isPending ? 'Removing...' : 'Remove Selected'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;