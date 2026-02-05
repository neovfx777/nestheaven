import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Filter, Eye, EyeOff, CheckCircle, Building2 } from 'lucide-react';
import { apartmentsApi, Apartment } from '../../../api/apartments';
import { Button } from '../../../components/ui/Button';

type LogStatus = 'ALL' | 'ACTIVE' | 'HIDDEN' | 'SOLD';

export const ModerationLogsPage = () => {
  const [statusFilter, setStatusFilter] = useState<LogStatus>('ALL');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['moderation-logs'],
    queryFn: async () => {
      // Get up to 200 apartments for moderation overview
      return apartmentsApi.getAllApartments({ limit: 200 });
    },
    staleTime: 60_000,
  });

  const apartments: Apartment[] = data?.apartments || [];

  const logs = useMemo(() => {
    const list = apartments
      .map((apt) => {
        const title = apt.titleEn || apt.title?.en || apt.title?.uz || apt.title?.ru || 'Untitled';
        const complexName =
          (apt.complex?.name as any)?.en ||
          (apt.complex?.name as any)?.uz ||
          (apt.complex?.name as any)?.ru ||
          '';
        const status = apt.status?.toUpperCase() as Apartment['status'];

        return {
          id: apt.id,
          title,
          complexName,
          status,
          createdAt: apt.createdAt,
          price: apt.price,
        };
      })
      // More recent first
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    if (statusFilter === 'ALL') return list;
    return list.filter((log) => log.status === statusFilter);
  }, [apartments, statusFilter]);

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'ACTIVE')
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Eye className="h-3 w-3 mr-1" />
          ACTIVE
        </span>
      );
    if (s === 'HIDDEN')
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <EyeOff className="h-3 w-3 mr-1" />
          HIDDEN
        </span>
      );
    if (s === 'SOLD')
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          SOLD
        </span>
      );
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderation Logs</h1>
          <p className="text-gray-600">
            Overview of recently created, hidden, and sold listings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LogStatus)}
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="HIDDEN">Hidden</option>
            <option value="SOLD">Sold</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <Filter className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <span>Failed to load moderation logs.</span>
        </div>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
            <p className="mt-2 text-gray-600">Loading moderation logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No moderation events found</h3>
            <p className="text-gray-500 mt-1 text-sm">
              Try changing the status filter or check again later.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Listing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Complex
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{log.title}</div>
                            <div className="text-xs text-gray-500">ID: {log.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {log.complexName || '—'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {log.price ? `$${log.price.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ModerationLogsPage;

