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
  Info,
} from 'lucide-react';
import { apartmentsApi, Apartment, Complex } from '../api/apartments';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const ComplexDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  const complexAddress =
    (complex.address as any)?.en ||
    (complex.address as any)?.uz ||
    (complex.address as any)?.ru ||
    (typeof complex.address === 'string' ? complex.address : '');

  const totalApartments =
    complex._count?.apartments ?? apartments.length ?? 0;

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
        {/* Header / Hero */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl">
                  {complexName}
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
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
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
            </div>
          </CardHeader>
        </Card>

        {/* Info about materials / infrastructure (overall) */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Materiallar va infratuzilma</CardTitle>
          </CardHeader>
          <CardContent>
            {apartments.length === 0 ? (
              <p className="text-sm text-gray-600">
                Hozircha bu kompleksga bog‘langan uylar yo‘q.
              </p>
            ) : (
              <div className="space-y-4 text-sm text-gray-700">
                <p>
                  Quyida keltirilgan uylar misolida siz kompleksda
                  ishlatilgan <strong>qurilish materiallari</strong> va{' '}
                  <strong>atrofidagi infratuzilma</strong> haqida ma’lumotlarni
                  ko‘rishingiz mumkin.
                </p>
                <p className="text-gray-500">
                  Batafsil ma’lumot har bir uy kartasida &quot;Materiallar&quot; va
                  &quot;Atrof infratuzilma&quot; bo‘limlarida ko‘rsatilgan.
                </p>
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

                  const materials =
                    (apt.materials as any)?.en ||
                    (apt.materials as any)?.uz ||
                    (apt.materials as any)?.ru ||
                    '';

                  const infra =
                    (apt.infrastructureNote as any)?.en ||
                    (apt.infrastructureNote as any)?.uz ||
                    (apt.infrastructureNote as any)?.ru ||
                    '';

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
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
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
                          {materials && (
                            <p className="text-sm text-gray-700 mb-2">
                              <span className="font-medium">Materiallar:</span>{' '}
                              {materials}
                            </p>
                          )}
                          {infra && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">
                                Atrof infratuzilma:
                              </span>{' '}
                              {infra}
                            </p>
                          )}
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

