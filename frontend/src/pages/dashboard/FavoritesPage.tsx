import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { toast } from 'react-hot-toast';

const FavoritesPage = () => {
  const [page, setPage] = useState(1);
  const limit = 20;
  const queryClient = useQueryClient();

  const {
    data: favoritesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user-favorites-all', page],
    queryFn: () => usersApi.getFavorites(page, limit),
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (apartmentId: string) => usersApi.removeFavorite(apartmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites-all'] });
      toast.success('Removed from favorites');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove favorite');
    },
  });

  const handleRemoveFavorite = async (apartmentId: string) => {
    if (window.confirm('Are you sure you want to remove this from favorites?')) {
      await removeFavoriteMutation.mutateAsync(apartmentId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Favorites</h2>
          <p className="text-gray-600">Please try again later.</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const favorites = favoritesData?.apartments || [];
  const pagination = favoritesData?.pagination;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            </div>
            <p className="text-gray-600">
              All your saved apartments in one place
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-pink-50 text-pink-700 rounded-lg">
              <div className="text-sm font-medium">Total Favorites</div>
              <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <Card className="py-16 text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-6">
            Start saving apartments by clicking the heart icon on any listing
          </p>
          <Link to="/apartments">
            <Button>Browse Apartments</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {favorites.map((apartment: any) => (
              <Card key={apartment.id} className="overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  {apartment.images?.[0]?.url ? (
                    <img
                      src={apartment.images[0].url}
                      alt={apartment.titleEn}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveFavorite(apartment.id)}
                      disabled={removeFavoriteMutation.isPending}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    <Link to={`/apartments/${apartment.id}`} className="hover:text-primary-600">
                      {apartment.titleEn}
                    </Link>
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="font-semibold">${apartment.price.toLocaleString()}</p>
                    <p>{apartment.rooms} rooms • {apartment.area}m² • Floor {apartment.floor}</p>
                    <p className="text-gray-500">Saved on {formatDate(apartment.favoritedAt)}</p>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      apartment.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : apartment.status === 'SOLD'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {apartment.status}
                    </span>
                    
                    <Link
                      to={`/apartments/${apartment.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> favorites
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesPage;