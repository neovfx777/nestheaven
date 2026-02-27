import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Building2, Filter } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import apiClient from '../../../api/client';
import { getAssetUrl } from '../../../api/client';
import { toast } from 'react-hot-toast';
import { useLanguageStore } from '../../../stores/languageStore';
import { getLocalizedContent } from '../../../utils/translations';
import { useTranslation } from '../../../hooks/useTranslation';

interface Complex {
  id: string;
  title: string | { uz: string; ru: string; en: string };
  developer: string;
  city: string;
  blockCount: number;
  amenities: string[];
  nearbyPlaces: any[];
  coverImage?: string | null;
  images?: Array<{ id: string; url: string; order: number }>;
  _count?: {
    apartments: number;
  };
}

export function ComplexManagement() {
  const { language } = useLanguageStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['complexes', 'admin', searchQuery, cityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (cityFilter) params.append('city', cityFilter);
      params.append('limit', '50');

      const response = await apiClient.get(`/complexes?${params.toString()}`);
      return response.data?.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/complexes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complexes'] });
      toast.success(t('messages.complexDeleted'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t('messages.deleteComplexFailed'));
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm(t('messages.confirmDeleteComplex'))) {
      deleteMutation.mutate(id);
    }
  };

  const complexes: Complex[] = data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.complexManagementTitle')}</h1>
          <p className="text-gray-600 mt-1">{t('dashboard.complexManagementSubtitle')}</p>
        </div>
        <Link to="/dashboard/admin/complexes/new">
          <Button className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>{t('dashboard.createComplex')}</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder={t('dashboard.searchComplexes')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder={t('dashboard.filterByCity')}
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
            {(searchQuery || cityFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setCityFilter('');
                }}
              >
                {t('dashboard.clearFilters')}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Complexes List */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : complexes.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('emptyState.noComplexesFound')}</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || cityFilter
                ? t('emptyState.adjustFilters')
                : t('emptyState.createFirstComplex')}
            </p>
            <Link to="/dashboard/admin/complexes/new">
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                {t('dashboard.createComplex')}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complexes.map((complex) => {
            const title = getLocalizedContent(complex.title, language);
            const amenities = Array.isArray(complex.amenities) ? complex.amenities : [];
            const nearbyPlaces = Array.isArray(complex.nearbyPlaces) ? complex.nearbyPlaces : [];

            return (
              <Card key={complex.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Cover image (first complex image) */}
                {(complex.coverImage || complex.images?.[0]?.url) && (
                  <div className="h-48 overflow-hidden bg-gray-200">
                    <img
                      src={getAssetUrl(complex.coverImage || complex.images?.[0]?.url)}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {title}
                  </h3>

                  {/* Developer & City */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Building2 className="h-4 w-4 mr-1" />
                    <span>{complex.developer}</span>
                    <span className="mx-2">•</span>
                    <span>{complex.city}</span>
                  </div>

                  {/* Block Count */}
                  <div className="mb-3">
                    <Badge variant="outline">
                      {complex.blockCount} {complex.blockCount === 1 ? t('dashboard.block') : t('dashboard.blocks')}
                    </Badge>
                  </div>

                  {/* Amenities Preview */}
                  {amenities.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.amenitiesLabel')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {amenities.slice(0, 3).map((amenityId: string) => (
                          <Badge key={amenityId} variant="secondary" className="text-xs">
                            {amenityId}
                          </Badge>
                        ))}
                        {amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nearby Places Preview */}
                  {nearbyPlaces.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">{t('dashboard.nearbyLabel')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {nearbyPlaces.slice(0, 3).map((place: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {place.name}
                          </Badge>
                        ))}
                        {nearbyPlaces.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{nearbyPlaces.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Apartment Count */}
                  {complex._count && (
                    <div className="mb-4 text-sm text-gray-600">
                      {complex._count.apartments} {complex._count.apartments === 1 ? t('dashboard.apartment') : t('dashboard.apartments')}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <Link
                      to={`/dashboard/admin/complexes/${complex.id}/edit`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        {t('dashboard.edit')}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(complex.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
