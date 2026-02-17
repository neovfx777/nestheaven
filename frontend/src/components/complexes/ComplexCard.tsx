import { Link } from 'react-router-dom';
import { Building2, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useTranslation } from '../../hooks/useTranslation';
import { AMENITY_CATEGORIES } from '../../constants/amenities';

interface ComplexCardProps {
  complex: {
    id: string;
    title: string | { uz: string; ru: string; en: string };
    developer?: string;
    city: string;
    blockCount?: number;
    amenities?: string[];
    nearbyPlaces?: Array<{
      type: string;
      name: string;
      distanceMeters: number;
      note?: string;
    }>;
    bannerImage?: string;
    location?: {
      address: { uz: string; ru: string; en: string };
    };
    _count?: {
      apartments: number;
    };
  };
}

export function ComplexCard({ complex }: ComplexCardProps) {
  const { t, getLocalizedContent } = useTranslation();

  const title = getLocalizedContent(complex.title);
  const amenities = Array.isArray(complex.amenities) ? complex.amenities : [];
  const nearbyPlaces = Array.isArray(complex.nearbyPlaces) ? complex.nearbyPlaces : [];

  // Get amenity labels
  const amenityLabels = amenities
    .map((id) => {
      const amenity = AMENITY_CATEGORIES.flatMap((cat) => cat.amenities).find((a) => a.id === id);
      return amenity ? getLocalizedContent(amenity.label) : null;
    })
    .filter(Boolean)
    .slice(0, 5);

  return (
    <Link to={`/complexes/${complex.id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Banner Image */}
        {complex.bannerImage ? (
          <div className="h-48 overflow-hidden bg-gray-200">
            <img
              src={complex.bannerImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <Building2 className="h-12 w-12 text-blue-400" />
          </div>
        )}

        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>

          {/* Developer & City */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            {complex.developer && (
              <>
                <Building2 className="h-4 w-4 mr-1" />
                <span>{complex.developer}</span>
                <span className="mx-2">•</span>
              </>
            )}
            <MapPin className="h-4 w-4 mr-1" />
            <span>{complex.city}</span>
          </div>

          {/* Block Count */}
          {complex.blockCount && (
            <div className="mb-3">
              <Badge variant="outline">
                {complex.blockCount} {complex.blockCount === 1 ? (t('common.block') || 'Block') : (t('common.blocks') || 'Blocks')}
              </Badge>
            </div>
          )}

          {/* Amenities - Only show checked ones */}
          {amenityLabels.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 font-medium">{t('complex.amenities')}:</p>
              <div className="flex flex-wrap gap-1">
                {amenityLabels.map((label, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
                {amenities.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{amenities.length - 5} {t('common.more')}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Nearby Places - Show first 3 */}
          {nearbyPlaces.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 font-medium">{t('common.nearby')}:</p>
              <div className="space-y-1">
                {nearbyPlaces.slice(0, 3).map((place, idx) => {
                  const distanceText =
                    place.distanceMeters < 1000
                      ? `${place.distanceMeters}m`
                      : `${(place.distanceMeters / 1000).toFixed(1)}km`;

                  return (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{place.name}</span>
                      <span className="text-gray-500">{distanceText}</span>
                    </div>
                  );
                })}
                {nearbyPlaces.length > 3 && (
                  <p className="text-xs text-gray-500">
                    +{nearbyPlaces.length - 3} {t('common.morePlaces')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Apartment Count */}
          {complex._count && complex._count.apartments > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                {complex._count.apartments} {complex._count.apartments === 1 ? (t('apartment.title') || 'Apartment') : (t('common.apartments') || 'Apartments')} {t('common.available') || 'Available'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
