import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Building2, CheckCircle } from 'lucide-react';
import { ComplexLocationMap } from '../maps/ComplexLocationMap';
import { getLocalizedContent } from '../../utils/translations';
import { useLanguageStore } from '../../stores/languageStore';
import { AMENITY_CATEGORIES } from '../../constants/amenities';
import apiClient from '../../api/client';
import { Card } from '../ui/Card';

interface InheritedComplexDataProps {
  complexId: string | null;
}

export function InheritedComplexData({ complexId }: InheritedComplexDataProps) {
  const { language } = useLanguageStore();

  const { data: complex } = useQuery({
    queryKey: ['complex', complexId],
    queryFn: async () => {
      if (!complexId) return null;
      const response = await apiClient.get(`/complexes/${complexId}`);
      return response.data?.data ?? response.data;
    },
    enabled: !!complexId,
  });

  if (!complexId || !complex) {
    return null;
  }

  // Parse complex data
  const title = typeof complex.title === 'string'
    ? JSON.parse(complex.title)
    : complex.title || { uz: '', ru: '', en: '' };

  const location = typeof complex.location === 'string'
    ? JSON.parse(complex.location)
    : complex.location || {
        lat: complex.locationLat || 41.3111,
        lng: complex.locationLng || 69.2797,
        address: typeof complex.address === 'string'
          ? JSON.parse(complex.address)
          : complex.address || { uz: '', ru: '', en: '' },
      };

  const nearbyPlaces = typeof complex.nearby === 'string'
    ? JSON.parse(complex.nearby)
    : complex.nearby || [];

  const amenities = typeof complex.amenities === 'string'
    ? JSON.parse(complex.amenities)
    : complex.amenities || [];

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-900">
              Inherited from Complex: {getLocalizedContent(title, language)}
            </h3>
          </div>
          <p className="text-sm text-blue-700">
            The following information is automatically inherited from the selected complex and cannot be edited.
          </p>
        </div>
      </Card>

      {/* Location */}
      <Card>
        <div className="p-4">
          <div className="flex items-center mb-3">
            <MapPin className="h-5 w-5 text-primary-600 mr-2" />
            <h4 className="font-semibold">Location</h4>
          </div>
          {location.lat && location.lng && (
            <div className="mb-3">
              <ComplexLocationMap
                latitude={location.lat}
                longitude={location.lng}
                locationText={getLocalizedContent(location.address, language)}
                complexName={getLocalizedContent(title, language)}
                heightClassName="h-48"
              />
            </div>
          )}
          <p className="text-sm text-gray-600">
            {getLocalizedContent(location.address, language)}
          </p>
        </div>
      </Card>

      {/* Nearby Places */}
      {nearbyPlaces.length > 0 && (
        <Card>
          <div className="p-4">
            <h4 className="font-semibold mb-3">Nearby Places</h4>
            <div className="space-y-2">
              {nearbyPlaces.slice(0, 5).map((place: any, index: number) => {
                const distanceText =
                  place.distanceMeters < 1000
                    ? `${place.distanceMeters}m`
                    : `${(place.distanceMeters / 1000).toFixed(1)}km`;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-2"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{place.name}</span>
                      {place.note && (
                        <span className="text-xs text-gray-500 ml-2">({place.note})</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{distanceText}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Amenities */}
      {amenities.length > 0 && (
        <Card>
          <div className="p-4">
            <div className="flex items-center mb-3">
              <Building2 className="h-5 w-5 text-primary-600 mr-2" />
              <h4 className="font-semibold">Amenities</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenityId: string) => {
                const amenity = AMENITY_CATEGORIES.flatMap((cat) => cat.amenities).find(
                  (a) => a.id === amenityId
                );
                if (!amenity) return null;

                return (
                  <span
                    key={amenityId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {getLocalizedContent(amenity.label, language)}
                  </span>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
