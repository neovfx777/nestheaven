import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Loader2, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { ApartmentCarousel } from '../components/apartments/ApartmentCarousel';
import { apartmentsApi, Apartment, Complex } from '../api/apartments';
import { useAuthStore } from '../stores/authStore';
import { useTranslation } from '../hooks/useTranslation';

const HomePage = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  // Check if user is premium (has paid role)
  const isPremiumUser = user?.role === 'SELLER' || user?.role === 'ADMIN' || 
                       user?.role === 'MANAGER_ADMIN' || user?.role === 'OWNER_ADMIN';

  // Fetch apartments from API
  const {
    data: apartmentsData,
    isLoading,
  } = useQuery({
    queryKey: ['apartments', 'home'],
    queryFn: async () => {
      try {
        const result = await apartmentsApi.getApartments({ page: 1, limit: 16 });
        return result || { apartments: [], pagination: { page: 1, limit: 16, total: 0, totalPages: 0 } };
      } catch (error) {
        console.error('API fetch failed:', error);
        return { apartments: [], pagination: { page: 1, limit: 16, total: 0, totalPages: 0 } };
      }
    },
    retry: 1,
  });

  // Filter apartments for carousels
  const featuredApartments = apartmentsData?.apartments?.slice(0, 8) || [];
  const recommendedApartments = apartmentsData?.apartments?.slice(8, 16) || [];

  // Complexes for home page (API + fallback to default data)
  const {
    data: complexesData,
  } = useQuery({
    queryKey: ['complexes', 'home'],
    queryFn: apartmentsApi.getComplexes,
    retry: 1,
  });

  const homeComplexes: Complex[] = complexesData && complexesData.length > 0 ? complexesData.slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-14 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              NestHeaven
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-blue-100 mb-6 sm:mb-8">
              {t('footer.tagline')}
            </p>
          </div>
        </div>
      </section>

      {/* Complexes Grid Section */}
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t('home.newComplexes')}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {t('home.popularProjects')}
              </p>
            </div>
            <Link
              to="/complexes"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('home.viewAllComplexes')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {homeComplexes.map((complex) => {
              const complexName =
                (complex.name as any)?.en ||
                (complex.name as any)?.uz ||
                (complex.name as any)?.ru ||
                (typeof complex.name === 'string' ? complex.name : 'Kompleks');

              const complexAddress =
                (complex.address as any)?.en ||
                (complex.address as any)?.uz ||
                (complex.address as any)?.ru ||
                (typeof complex.address === 'string'
                  ? complex.address
                  : '');

              return (
                <Link
                  key={complex.id}
                  to={`/complexes/${complex.id}`}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow block"
                >
                  {complex.coverImage && (
                    <div className="h-36 sm:h-40 w-full overflow-hidden">
                      <img
                        src={complex.coverImage}
                        alt={complexName}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      {complexName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3">
                      {complexAddress}
                    </p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 gap-2">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span>
                          {complex._count?.apartments ?? 0} {t('home.apartmentsCount')}
                        </span>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        {complex.city}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Apartments Carousel */}
      {featuredApartments.length > 0 && (
        <ApartmentCarousel
          title={t('home.featuredTitle')}
          subtitle={t('home.featuredSubtitle')}
          apartments={featuredApartments}
          showBadge={true}
          badgeText="BEPUL"
          badgeColor="green"
        />
      )}

      {/* Recommended Apartments Carousel */}
      {recommendedApartments.length > 0 && (
        <ApartmentCarousel
          title={t('home.recommendedTitle')}
          subtitle={t('home.recommendedSubtitle')}
          apartments={recommendedApartments}
          showBadge={true}
          badgeText="PREMIUM"
          badgeColor="purple"
        />
      )}

      {/* Loading State */}
      {isLoading && featuredApartments.length === 0 && recommendedApartments.length === 0 && (
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {t('home.ctaTitle')}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-8 max-w-2xl mx-auto">
            {t('home.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/apartments"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('home.browseAllApartments')}
            </Link>
            <Link
              to="/complexes"
              className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              {t('home.viewAllComplexes')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
