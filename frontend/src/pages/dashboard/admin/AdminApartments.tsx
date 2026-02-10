import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Filter, Eye, EyeOff, CheckCircle,
  AlertTriangle, RefreshCw
} from 'lucide-react';
import { apartmentsApi } from '../../../api/apartments';
import { statusApi } from '../../../api/status';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Star, Sparkles } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { StatusChangeModal } from './StatusChangeModal';
import { BulkOperations } from './BulkOperations';
import { toast } from 'react-hot-toast';

interface ApartmentWithActions {
  id: string;
  title: string;
  price: number;
  rooms: number;
  area: number;
  status: 'ACTIVE' | 'HIDDEN' | 'SOLD';
  sellerName: string;
  sellerEmail: string;
  createdAt: string;
  selected: boolean;
}

export const AdminApartments: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedApartments, setSelectedApartments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    minPrice: '',
    maxPrice: '',
    minRooms: '',
    maxRooms: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [showBulkOperations, setShowBulkOperations] = useState(false);

  // Fetch apartments
  const { data: apartmentsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-apartments', filters, searchTerm],
    queryFn: () => apartmentsApi.getApartments({
      ...filters,
      search: searchTerm || undefined,
      status: filters.status || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minRooms: filters.minRooms ? Number(filters.minRooms) : undefined,
      maxRooms: filters.maxRooms ? Number(filters.maxRooms) : undefined,
    }),
  });

  // Status change mutation
  const statusMutation = useMutation({
    mutationFn: ({ apartmentId, status, reason }: { apartmentId: string; status: string; reason?: string }) =>
      statusApi.changeStatus(apartmentId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-apartments'] });
      toast.success('Status updated successfully');
      setShowStatusModal(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    },
  });

  const handleStatusChange = (apartmentId: string, status: string, reason?: string) => {
    statusMutation.mutate({ apartmentId, status, reason });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && apartmentsData?.apartments) {
      setSelectedApartments(apartmentsData.apartments.map(apt => apt.id));
    } else {
      setSelectedApartments([]);
    }
  };

  const handleSelectApartment = (apartmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedApartments(prev => [...prev, apartmentId]);
    } else {
      setSelectedApartments(prev => prev.filter(id => id !== apartmentId));
    }
  };

  const getStatusBadge = (status: string) => {
    const normalized = status?.toUpperCase();
    switch (normalized) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'HIDDEN':
        return <Badge variant="secondary">Hidden</Badge>;
      case 'SOLD':
        return <Badge variant="destructive">Sold</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    const normalized = status?.toUpperCase();
    switch (normalized) {
      case 'ACTIVE':
        return <Eye className="h-4 w-4 text-green-600" />;
      case 'HIDDEN':
        return <EyeOff className="h-4 w-4 text-gray-600" />;
      case 'SOLD':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const handleQuickAction = (apartmentId: string, action: 'hide' | 'unhide') => {
    const status = action === 'hide' ? 'HIDDEN' : 'ACTIVE';
    handleStatusChange(apartmentId, status, `Quick ${action} by admin`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Apartment Moderation</h2>
          <p className="text-gray-600 mt-1">
            Review and manage apartment listings
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {selectedApartments.length > 0 && (
            <Button onClick={() => setShowBulkOperations(true)}>
              <Filter className="h-4 w-4 mr-2" />
              Bulk Actions ({selectedApartments.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Input
              placeholder="Search apartments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          
          <Select
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            options={[
              { value: '', label: 'All Status' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'HIDDEN', label: 'Hidden' },
              { value: 'SOLD', label: 'Sold' },
            ]}
          />
          
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
            />
          </div>
          
          <Select
            value={filters.sortBy}
            onChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
            options={[
              { value: 'createdAt', label: 'Newest' },
              { value: 'price', label: 'Price' },
              { value: 'area', label: 'Area' },
              { value: 'rooms', label: 'Rooms' },
            ]}
          />
          
          <Select
            value={filters.sortOrder}
            onChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value as 'asc' | 'desc' }))}
            options={[
              { value: 'desc', label: 'Descending' },
              { value: 'asc', label: 'Ascending' },
            ]}
          />
        </div>
      </Card>

      {/* Bulk Operations Bar */}
      {selectedApartments.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">
                {selectedApartments.length} apartment(s) selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(selectedApartments[0], 'hide')}
              >
                <EyeOff className="h-4 w-4 mr-1" />
                Hide All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(selectedApartments[0], 'unhide')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Unhide All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedApartments([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Apartments Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading apartments...</p>
          </div>
        ) : apartmentsData?.apartments.length === 0 ? (
          <div className="p-8 text-center">
            <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No apartments found</p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedApartments.length === apartmentsData?.apartments.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apartment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apartmentsData?.apartments.map((apartment) => (
                  <tr key={apartment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedApartments.includes(apartment.id)}
                        onChange={(e) => handleSelectApartment(apartment.id, e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {apartment.titleUz || apartment.titleEn || 'No title'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${apartment.price.toLocaleString()}
                        </div>
                        <div className="flex gap-2 mt-1">
                          {(apartment as any).isFeatured && (
                            <Badge variant="success" className="text-xs flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Featured (Free)
                            </Badge>
                          )}
                          {(apartment as any).isRecommended && (
                            <Badge variant="info" className="text-xs flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Recommended (Paid)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium">{apartment.seller?.fullName || 'Unknown'}</div>
                        <div className="text-gray-500">{apartment.seller?.email || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {apartment.rooms} rooms • {apartment.area} m²
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(apartment.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(apartment.status)}
                        {getStatusBadge(apartment.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedApartmentId(apartment.id);
                            setShowStatusModal(true);
                          }}
                        >
                          Change Status
                        </Button>
                        
                        {apartment.status === 'ACTIVE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAction(apartment.id, 'hide')}
                          >
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hide
                          </Button>
                        )}
                        
                        {apartment.status === 'HIDDEN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAction(apartment.id, 'unhide')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Unhide
                          </Button>
                        )}
                        
                        <button
                          onClick={() => {
                            // Toggle featured/recommended status
                            // This would need API endpoint to update apartment flags
                            toast.success('Feature toggle functionality - to be implemented with API');
                          }}
                          className={`text-xs px-2 py-1 rounded ${
                            (apartment as any).isFeatured
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title="Toggle Featured (Free)"
                        >
                          {(apartment as any).isFeatured ? '★ Featured' : '☆ Feature'}
                        </button>
                        <button
                          onClick={() => {
                            // Toggle recommended status
                            toast.success('Recommend toggle functionality - to be implemented with API');
                          }}
                          className={`text-xs px-2 py-1 rounded ${
                            (apartment as any).isRecommended
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title="Toggle Recommended (Paid)"
                        >
                          {(apartment as any).isRecommended ? '✓ Recommended' : '○ Recommend'}
                        </button>
                        <a
                          href={`/apartments/${apartment.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {apartmentsData && apartmentsData.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((filters.page - 1) * filters.limit) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(filters.page * filters.limit, apartmentsData.pagination.total)}
                </span> of{' '}
                <span className="font-medium">{apartmentsData.pagination.total}</span> results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= apartmentsData.pagination.totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showStatusModal && selectedApartmentId && (
        <StatusChangeModal
          apartmentId={selectedApartmentId}
          currentStatus={apartmentsData?.apartments.find(a => a.id === selectedApartmentId)?.status || 'ACTIVE'}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedApartmentId(null);
          }}
          onStatusChange={handleStatusChange}
        />
      )}

      {showBulkOperations && (
        <BulkOperations
          apartmentIds={selectedApartments}
          onClose={() => setShowBulkOperations(false)}
          onSuccess={() => {
            setSelectedApartments([]);
            refetch();
          }}
        />
      )}
    </div>
  );
};
