import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Bed,
  Square,
  Layers,
  Calendar,
  Wind,
  Footprints,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { apartmentsApi, Apartment, Complex } from '../api/apartments';
import { getAssetUrl } from '../api/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ComplexLocationMap } from '../components/maps/ComplexLocationMap';
import { useTranslation } from '../hooks/useTranslation';
import { AMENITY_CATEGORIES } from '../constants/amenities';

const ComplexDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, getLocalizedContent, language } = useTranslation();

  const getStrictLocalizedContent = (
    content: { uz?: string; ru?: string; en?: string } | string | null | undefined
  ): string => {
    if (!content) return '';

    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          return parsed[language] || '';
        }
      } catch {
        return content;
      }
      return '';
    }

    return content[language] || '';
  };

  // Fetch complex by ID
  const {
    data: complex,
    isLoading: complexLoading,
  } = useQuery<Complex | null>({
    queryKey: ['complex', id],
    queryFn: () => (id ? apartmentsApi.getComplexById(id) : Promise.resolve(null)),
    enabled: !!id,
    retry: 1,
  });

  // Fetch apartments in this complex
  const {
    data: apartmentsData,
    isLoading: apartmentsLoading,
  } = useQuery({
    queryKey: ['apartments', 'complex', id],
    queryFn: () =>
      apartmentsApi.getApartments({
        complexId: id,
        page: 1,
        limit: 100,
      }),
    enabled: !!id,
    retry: 1,
  });

  const apartments: Apartment[] = apartmentsData?.apartments || [];

  if (complexLoading || apartmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('complexDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (!complex) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('complexDetail.notFound')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('complexDetail.notFoundDescription')}
          </p>
          <Button onClick={() => navigate('/complexes')}>{t('complexDetail.backToComplexes')}</Button>
        </div>
      </div>
    );
  }

  const complexName =
    getLocalizedContent(complex.name as any) || t('complex.title');

  const complexTitle =
    getLocalizedContent(complex.title as any) || complexName;

  const complexAddress =
    getLocalizedContent(complex.locationText as any) ||
    getLocalizedContent(complex.location?.address as any) ||
    getLocalizedContent(complex.address as any) ||
    '';

  const complexImages = (complex.images || [])
    .map((img) => ({ ...img, url: getAssetUrl(img.url) }))
    .filter((img) => img.url);
  const coverImageUrl = complexImages.length > 0 ? complexImages[0].url : null;
  const parsedPermissions =
    typeof complex.permissions === 'string'
      ? (() => {
          try {
            return JSON.parse(complex.permissions);
          } catch {
            return null;
          }
        })()
      : complex.permissions;
  const permissionLinks = [
    {
      label: t('complexDetail.permission1'),
      url: complex.permission1Url || parsedPermissions?.permission1,
    },
    {
      label: t('complexDetail.permission2'),
      url: complex.permission2Url || parsedPermissions?.permission2,
    },
    {
      label: t('complexDetail.permission3'),
      url: complex.permission3Url || parsedPermissions?.permission3,
    },
  ]
    .map((item) => ({ ...item, url: getAssetUrl(item.url || null) }))
    .filter((item) => item.url);

  const amenities = complex.amenities || [];
  const nearbyPlaces = complex.nearbyPlaces || complex.nearby || [];

  const totalApartments =
    complex._count?.apartments ?? apartments.length ?? 0;

  const descriptionText = getStrictLocalizedContent(complex.description as any);

  // Get walkability and airQuality (backend returns as walkability/airQuality, not walkabilityRating/airQualityRating)
  const walkability = complex.walkability ?? complex.walkabilityRating ?? null;
  const airQuality = complex.airQuality ?? complex.airQualityRating ?? null;

  // Get location coordinates
  const locationLat = complex.locationLat ?? complex.location?.lat ?? null;
  const locationLng = complex.locationLng ?? complex.location?.lng ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('navigation.back')}
          </Button>
          <Link
            to="/complexes"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('complexDetail.backToComplexes')}
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cover and gallery: first complex image or placeholder */}
        {coverImageUrl ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <img
              src={coverImageUrl}
              alt={complexTitle}
              className="w-full h-56 sm:h-64 md:h-80 lg:h-96 object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-56 sm:h-64 md:h-80 lg:h-96 rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <Building2 className="h-20 w-20 text-blue-300" />
          </div>
        )}

        {/* Complex images gallery */}
        {complexImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 rounded-xl border border-gray-200 bg-white p-2">
            {complexImages.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt=""
                className="h-24 w-32 flex-shrink-0 rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {/* Title and info card */}
        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-7 w-7 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-2xl md:text-3xl">
                  {complexTitle}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {complexAddress}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                    {complex.city}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-700">
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-500 mb-1">{t('complexDetail.apartmentCount')}</div>
                <div className="text-lg font-semibold">
                  {totalApartments}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Footprints className="h-3 w-3" />
                  {t('complexDetail.walkability')}
                </div>
                <div className="text-lg font-semibold">
                  {walkability != null ? `${walkability}/10` : '-'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  {t('complexDetail.airQuality')}
                </div>
                <div className="text-lg font-semibold">
                  {airQuality != null ? `${airQuality}/10` : '-'}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Description */}
        {descriptionText && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('complexDetail.description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {descriptionText}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Location Map */}
        {locationLat != null && locationLng != null && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                {t('complexDetail.location')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">{complexAddress || '-'}</p>
                {complex.developer && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('complexDetail.developer')}:</span> {complex.developer}
                  </p>
                )}
                {complex.blockCount && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{t('complexDetail.blockCount')}:</span> {complex.blockCount}
                  </p>
                )}
              </div>
              <ComplexLocationMap
                latitude={locationLat}
                longitude={locationLng}
                locationText={complexAddress}
                complexName={complexTitle}
                heightClassName="h-96"
              />
            </CardContent>
          </Card>
        )}

        {/* Complex info */}
        <Card>
          <CardHeader>
<CardTitle className="text-lg">{t('complexDetail.aboutComplex')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-gray-700">
            {/* Ratings */}
            {(walkability != null || airQuality != null) && (
              <div>
                <div className="text-xs text-gray-500 mb-2 font-medium">{t('complexDetail.ratings')}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {walkability != null && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Footprints className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">{t('complexDetail.walkability')}</div>
                        <div className="text-xs text-gray-600">{walkability}/10</div>
                      </div>
                    </div>
                  )}
                  {airQuality != null && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <Wind className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-gray-900">{t('complexDetail.airQuality')}</div>
                        <div className="text-xs text-gray-600">{airQuality}/10</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {amenities.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">{t('complexDetail.amenitiesLabel')}</div>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenityId) => {
                    const amenity = AMENITY_CATEGORIES.flatMap((cat) => cat.amenities).find(
                      (a) => a.id === amenityId
                    );
                    if (!amenity) return null;
                    
                    return (
                      <span
                        key={amenityId}
                        className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs"
                      >
                        {getLocalizedContent(amenity.label)}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {nearbyPlaces.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-3 font-medium">{t('complexDetail.nearbyPlacesLabel')}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nearbyPlaces.map((place, idx) => (
                    <div 
                      key={`${place.name}-${idx}`} 
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{place.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {place.distanceMeters ? `${place.distanceMeters} m` : place.distanceKm ? `${place.distanceKm} km` : ''}
                          {place.type && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              {place.type}
                            </span>
                          )}
                        </div>
                        {place.note && (
                          <div className="text-xs text-gray-500 mt-1">{place.note}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {permissionLinks.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-3 font-medium">
                  {t('complexDetail.permissionsLabel')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {permissionLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.url as string}
                      target="_self"
                      rel="noopener"
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-blue-700 hover:text-blue-800 hover:border-blue-200"
                    >
                      <span className="inline-flex items-center gap-2 font-medium">
                        <FileText className="h-4 w-4" />
                        {item.label}
                      </span>
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Apartments list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {t('complexDetail.apartmentsInComplex')} ({apartments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apartments.length === 0 ? (
              <p className="text-sm text-gray-600">
                {t('complexDetail.noApartments')}
              </p>
            ) : (
              <div className="space-y-4">
                {apartments.map((apt) => {
                  const title = getLocalizedContent(apt.title) || 'Apartment';

                  return (
                    <Link
                      key={apt.id}
                      to={`/apartments/${apt.id}`}
                      className="block border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="p-4 flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              {apt.rooms} xonali
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Square className="h-4 w-4" />
                              {apt.area} m2
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Layers className="h-4 w-4" />
                              {apt.floor}/{apt.totalFloors || '-'} qavat
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(apt.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplexDetailPage;

