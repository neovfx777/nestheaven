import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Loader2, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { ApartmentCarousel } from '../components/apartments/ApartmentCarousel';
import { apartmentsApi, Apartment, Complex } from '../api/apartments';
import { defaultComplexData, defaultApartmentsData } from '../data/defaultData';
import { DefaultApartmentData } from '../data/types';
import { useAuthStore } from '../stores/authStore';

const HomePage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [useDefaultData, setUseDefaultData] = useState(false);

  // Check if user is premium (has paid role)
  const isPremiumUser = user?.role === 'SELLER' || user?.role === 'ADMIN' || 
                       user?.role === 'MANAGER_ADMIN' || user?.role === 'OWNER_ADMIN';

  // Try to fetch apartments from API
  const {
    data: apartmentsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['apartments', 'home'],
    queryFn: async () => {
      try {
        const result = await apartmentsApi.getApartments({ page: 1, limit: 6 });
        return result || { apartments: [], pagination: { page: 1, limit: 6, total: 0, totalPages: 0 } };
      } catch (error) {
        console.error('API fetch failed, using default data:', error);
        return { apartments: [], pagination: { page: 1, limit: 6, total: 0, totalPages: 0 } };
      }
    },
    retry: 1,
  });

  const complexData = defaultComplexData;

  // Use default data if API fails or no data
  useEffect(() => {
    if (isError || (!isLoading && (!apartmentsData || !apartmentsData.apartments || apartmentsData.apartments.length === 0))) {
      setUseDefaultData(true);
    }
  }, [isError, isLoading, apartmentsData]);

  // Filter apartments for carousels based on user type
  const featuredApartments = useDefaultData
    ? defaultApartmentsData.filter((apt: DefaultApartmentData) => apt.isFeatured).slice(0, 8)
    : apartmentsData?.apartments?.slice(0, 8) || [];

  const recommendedApartments = useDefaultData
    ? defaultApartmentsData.filter((apt: DefaultApartmentData) => apt.isRecommended).slice(0, 8)
    : isPremiumUser ? apartmentsData?.apartments?.slice(8, 16) || [] : apartmentsData?.apartments?.slice(8, 16) || [];

  // Convert default data format to API format
  const convertToApiFormat = (apt: DefaultApartmentData): Apartment => ({
    ...apt,
    complex: apt.complex || {
      id: typeof complexData.name === 'string' ? complexData.name.toLowerCase().replace(/\s+/g, '-') : complexData.name?.en?.toLowerCase().replace(/\s+/g, '-') || 'nestheaven',
      name: complexData.name,
      address: complexData.address,
      city: complexData.city || 'Tashkent',
      coverImage: complexData.coverImage,
    },
    createdAt: apt.createdAt || new Date().toISOString(),
    updatedAt: apt.updatedAt || new Date().toISOString(),
    titleUz: apt.title?.uz || apt.title?.en,
    titleRu: apt.title?.ru || apt.title?.en,
    titleEn: apt.title?.en,
    descriptionUz: apt.description?.uz || apt.description?.en,
    descriptionRu: apt.description?.ru || apt.description?.en,
    descriptionEn: apt.description?.en,
    address: apt.address,
    developerName: apt.developerName || 'NestHeaven Development',
    images: apt.images?.map((img, index) => ({
      id: `img-${index}`,
      url: img.url,
      order: img.order
    })) || [],
  });

  const featuredFormatted = useDefaultData
    ? featuredApartments.map(convertToApiFormat)
    : featuredApartments;

  const recommendedFormatted = useDefaultData
    ? recommendedApartments.map(convertToApiFormat)
    : recommendedApartments;

  // Complexes for home page (API + fallback to default data)
  const {
    data: complexesData,
  } = useQuery({
    queryKey: ['complexes', 'home'],
    queryFn: apartmentsApi.getComplexes,
    retry: 1,
  });

  const homeComplexes: Complex[] =
    complexesData && complexesData.length > 0
      ? complexesData.slice(0, 4)
      : [
          {
            id: 'default-complex',
            name: defaultComplexData.name,
            address: defaultComplexData.address,
            city: defaultComplexData.city,
            coverImage: defaultComplexData.coverImage,
            _count: {
              apartments: defaultComplexData.totalApartments,
            },
          },
        ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Complex Info */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {typeof complexData.name === 'string' ? complexData.name : complexData.name?.en || 'NestHeaven'}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              {typeof complexData.description === 'string' ? complexData.description : complexData.description?.en}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{typeof complexData.address === 'string' ? complexData.address : complexData.address?.en}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span>{complexData.totalApartments} Apartments</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Completion: {new Date(complexData.completionDate).getFullYear()}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>{complexData.investmentGrowthPercent}% Growth</span>
              </div>
            </div>
          </div>

          {/* Complex Features */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {complexData.features.map((feature: string, index: number) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20"
                >
                  <p className="text-sm font-medium">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Complexes Grid Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Yangi turar-joy komplekslari
              </h2>
              <p className="text-gray-600">
                NestHeaven platformasidagi mashhur loyihalar
              </p>
            </div>
            <Link
              to="/complexes"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Barcha komplekslarni ko‘rish
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow block"
                >
                  {complex.coverImage && (
                    <div className="h-40 w-full overflow-hidden">
                      <img
                        src={complex.coverImage}
                        alt={complexName}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {complexName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {complexAddress}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span>
                          {complex._count?.apartments ?? 0} ta kvartira
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

      {/* Featured Apartments Carousel (Free) */}
      {featuredFormatted.length > 0 && (
        <ApartmentCarousel
          title="Qaynoq sotilyotgan uylar"
          subtitle="Eng ko'p ko'rilgan va qiziqilgan uy-joylar"
          apartments={featuredFormatted}
          showBadge={true}
          badgeText="BEPUL"
          badgeColor="green"
        />
      )}

      {/* Recommended Apartments Carousel (Paid) */}
      {recommendedFormatted.length > 0 && (
        <ApartmentCarousel
          title="Tavsiya etilgan uylar"
          subtitle="Premium uy-joylar - sizga mos keladigan variantlar"
          apartments={recommendedFormatted}
          showBadge={true}
          badgeText="PREMIUM"
          badgeColor="purple"
        />
      )}

      {/* Loading State */}
      {isLoading && !useDefaultData && featuredFormatted.length === 0 && recommendedFormatted.length === 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse our complete collection of newly built apartments and find the perfect place for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/apartments"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse All Apartments
            </Link>
            <Link
              to="/complexes"
              className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              View Complexes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;