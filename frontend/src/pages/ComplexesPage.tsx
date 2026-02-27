import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, MapPin } from 'lucide-react';
import { apartmentsApi, Complex } from '../api/apartments';
import { getAssetUrl } from '../api/client';

const ComplexesPage = () => {
  const { data: complexes, isLoading } = useQuery({
    queryKey: ['complexes', 'list'],
    queryFn: apartmentsApi.getComplexes,
    retry: 1,
  });

  const complexList: Complex[] = complexes || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Turar-joy komplekslari
          </h1>
          <p className="text-lg text-gray-600">
            Toshkent City, Olmazor City va boshqa loyihalar
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : complexList.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            Hozircha komplekslar topilmadi.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {complexList.map((complex) => {
              const name =
                (complex.name as any)?.en ||
                (complex.name as any)?.uz ||
                (complex.name as any)?.ru ||
                (typeof complex.name === 'string'
                  ? complex.name
                  : 'Kompleks');

              const address =
                (complex.address as any)?.en ||
                (complex.address as any)?.uz ||
                (complex.address as any)?.ru ||
                (typeof complex.address === 'string'
                  ? complex.address
                  : '');
              const cover = getAssetUrl(
                complex.teaserImage ||
                  complex.teaserImageUrl ||
                  complex.bannerImage ||
                  complex.coverImage ||
                  complex.bannerImageUrl ||
                  null
              );

              return (
                <Link
                  key={complex.id}
                  to={`/complexes/${complex.id}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  {cover && (
                    <div className="h-44 w-full overflow-hidden">
                      <img
                        src={cover}
                        alt={name}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {name}
                    </h2>
                    <p className="text-sm text-gray-500 mb-3">{address}</p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span>
                          {complex._count?.apartments ?? 0} ta kvartira
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{complex.city}</span>
                      </div>
                    </div>
                    {(complex.walkabilityRating != null ||
                      complex.airQualityRating != null) && (
                      <div className="mt-3 flex gap-3 text-xs text-gray-600">
                        {complex.walkabilityRating != null && (
                          <span className="px-2 py-1 rounded-full bg-green-50 text-green-700">
                            Walkability: {complex.walkabilityRating}/10
                          </span>
                        )}
                        {complex.airQualityRating != null && (
                          <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                            Air: {complex.airQualityRating}/10
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplexesPage;
