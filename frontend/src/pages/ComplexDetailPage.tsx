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
} from 'lucide-react';
import { apartmentsApi, Apartment, Complex } from '../api/apartments';
import { getAssetUrl } from '../api/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ComplexLocationMap } from '../components/maps/ComplexLocationMap';
import { useTranslation } from '../hooks/useTranslation';

const ComplexDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, getLocalizedContent } = useTranslation();

  // Fetch all complexes and find current one
  const {
    data: complexes,
    isLoading: complexesLoading,
  } = useQuery({
    queryKey: ['complexes'],
    queryFn: apartmentsApi.getComplexes,
    retry: 1,
  });

  const complex: Complex | undefined =
    complexes?.find((c) => c.id === id) || undefined;

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

  if (complexesLoading || apartmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Kompleks ma&apos;lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!complex) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complex topilmadi
          </h2>
          <p className="text-gray-600 mb-6">
            Siz qidirayotgan kompleks mavjud emas yoki o&apos;chirilgan bo&apos;lishi mumkin.
          </p>
          <Button onClick={() => navigate('/complexes')}>Barcha komplekslar</Button>
        </div>
      </div>
    );
  }

  const complexName =
    (complex.name as any)?.en ||
    (complex.name as any)?.uz ||
    (complex.name as any)?.ru ||
    (typeof complex.name === 'string' ? complex.name : 'Kompleks');

  const complexTitle =
    (typeof complex.title === 'string' && complex.title) ||
    (complex.title as any)?.en ||
    (complex.title as any)?.uz ||
    (complex.title as any)?.ru ||
    complexName;

  const complexAddress =
    (typeof complex.locationText === 'string' && complex.locationText) ||
    (complex.locationText as any)?.en ||
    (complex.locationText as any)?.uz ||
    (complex.locationText as any)?.ru ||
    (complex.address as any)?.en ||
    (complex.address as any)?.uz ||
    (complex.address as any)?.ru ||
    (typeof complex.address === 'string' ? complex.address : '');

  const bannerUrl = getAssetUrl(
    complex.bannerImageUrl || complex.coverImage || null
  );
  const permissionLinks = [
    { label: 'Permission 1', url: complex.permission1Url },
    { label: 'Permission 2', url: complex.permission2Url },
    { label: 'Permission 3', url: complex.permission3Url },
  ]
    .map((item) => ({ ...item, url: getAssetUrl(item.url || null) }))
    .filter((item) => item.url);

  const amenities = complex.amenities || [];
  const nearbyPlaces = complex.nearbyPlaces || complex.nearby || [];

  const totalApartments =
    complex._count?.apartments ?? apartments.length ?? 0;

  // Get description in current language
  const complexDescription = complex.description
    ? typeof complex.description === 'string'
      ? JSON.parse(complex.description)
      : complex.description
    : null;
  
  const descriptionText = complexDescription
    ? getLocalizedContent(complexDescription)
    : null;

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
            Orqaga
          </Button>
          <Link
            to="/complexes"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Barcha komplekslarni ko‘rish
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {bannerUrl && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <img
              src={bannerUrl}
              alt={complexTitle}
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
        )}
        {/* Header / Hero */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-blue-600" />
              </div>
              <div>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-700">
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-500 mb-1">Kvartiralar soni</div>
                <div className="text-lg font-semibold">
                  {totalApartments} ta uy
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className="text-lg font-semibold">Faol loyiha</div>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Footprints className="h-3 w-3" />
                  Walkability
                </div>
                <div className="text-lg font-semibold">
                  {walkability != null ? `${walkability}/10` : '—'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  Air Quality
                </div>
                <div className="text-lg font-semibold">
                  {airQuality != null ? `${airQuality}/10` : '—'}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Description */}
        {descriptionText && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tavsif</CardTitle>
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
                Joylashuv
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">{complexAddress || '—'}</p>
                {complex.developer && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Developer:</span> {complex.developer}
                  </p>
                )}
                {complex.blockCount && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Block Count:</span> {complex.blockCount}
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
            <CardTitle className="text-lg">Kompleks haqida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm text-gray-700">
            {/* Ratings */}
            {(walkability != null || airQuality != null) && (
              <div>
                <div className="text-xs text-gray-500 mb-2 font-medium">Baholar</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {walkability != null && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Footprints className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Walkability</div>
                        <div className="text-xs text-gray-600">{walkability}/10</div>
                      </div>
                    </div>
                  )}
                  {airQuality != null && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <Wind className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Air Quality</div>
                        <div className="text-xs text-gray-600">{airQuality}/10</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {amenities.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">Ichki imkoniyatlar</div>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {nearbyPlaces.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-3 font-medium">Yaqin joylar</div>
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
                <div className="text-xs text-gray-500 mb-2">Ruxsatnomalar</div>
                <div className="flex flex-wrap gap-3">
                  {permissionLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.url as string}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {item.label}
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
              Bu kompleksdagi uylar ({apartments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apartments.length === 0 ? (
              <p className="text-sm text-gray-600">
                Hozircha bu kompleksga biriktirilgan uylar mavjud emas.
              </p>
            ) : (
              <div className="space-y-4">
                {apartments.map((apt) => {
                  const title =
                    (apt.title as any)?.en ||
                    (apt.title as any)?.uz ||
                    (apt.title as any)?.ru ||
                    'Apartment';

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
                              {apt.area} m²
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Layers className="h-4 w-4" />
                              {apt.floor}/{apt.totalFloors || '—'} qavat
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

