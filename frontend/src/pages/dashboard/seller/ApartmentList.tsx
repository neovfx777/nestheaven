import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apartmentsApi, type Apartment as ApiApartment } from '../../../api/apartments'; // FIXED: apartmentsApi
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { 
  Eye, 
  Edit3, 
  Building2, 
  Filter,
  Search,
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export const SellerApartmentList: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: apartments = [], isLoading, refetch } = useQuery<ApiApartment[]>({
    queryKey: ['seller-apartments'],
    queryFn: apartmentsApi.getMyListings,
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'destructive' | 'secondary' | 'default'> = {
      'ACTIVE': 'success',
      'active': 'success',
      'SOLD': 'destructive',
      'sold': 'destructive',
      'HIDDEN': 'secondary',
      'hidden': 'secondary'
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const getTitle = (apartment: ApiApartment) => {
    return apartment.title?.en || apartment.title?.uz || apartment.title?.ru || 'Untitled';
  };

  const getComplexName = (apartment: ApiApartment) => {
    const value = apartment.complex?.name;
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.en || value.uz || value.ru || '';
  };

  const formatRenovationStatus = (status?: string | null) => {
    if (!status) return 'N/A';
    switch (status) {
      case 'qora_suvoq':
        return 'Qora suvoq';
      case 'oq_suvoq':
        return 'Oq suvoq';
      case 'toliq_remont_qilingan':
        return "To'liq remont";
      default:
        return status;
    }
  };

  const filteredApartments = apartments.filter((apt) => {
    const matchesSearch = searchTerm === '' || 
      getTitle(apt).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getComplexName(apt).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || apt.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Listings</h1>
          <p className="text-gray-600">View and manage all your apartment listings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link to="/dashboard/seller/apartments/new">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title or complex..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'SOLD', label: 'Sold' },
                { value: 'HIDDEN', label: 'Hidden' },
              ]}
              className="w-40"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Showing {filteredApartments.length} of {apartments?.length || 0} listings</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            Active: {apartments.filter((a) => a.status === 'ACTIVE' || a.status === 'active').length}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            Sold: {apartments.filter((a) => a.status === 'SOLD' || a.status === 'sold').length}
          </span>
        </div>
      </div>

      {/* Apartments Grid */}
      {filteredApartments.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('emptyState.noListings')}</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? t('emptyState.adjustFilters') 
              : t('emptyState.createFirstListing')}
          </p>
          <Link to="/dashboard/seller/apartments/new">
            <Button>{t('dashboard.createNewListing')}</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApartments.map((apt) => (
            <Card key={apt.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image Section */}
              <div className="relative h-48 bg-gray-200">
                {apt.images && apt.images.length > 0 ? (
                  <img
                    src={apt.images[0].url}
                    alt={getTitle(apt)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Building2 className="h-12 w-12 mb-2" />
                    <span>No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(apt.status)}
                </div>
                {apt.complex && (
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="outline" className="bg-white/90">
                      {getComplexName(apt) || 'Complex'}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Content Section */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 truncate">
                  {getTitle(apt)}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-semibold text-gray-900">${apt.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rooms:</span>
                    <span>{apt.rooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span>{apt.area} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Listed:</span>
                    <span>{new Date(apt.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remont:</span>
                    <span>{formatRenovationStatus(apt.renovationStatus)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between border-t pt-4">
                  <div className="flex gap-2">
                    <Link to={`/apartments/${apt.id}`}>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link to={`/dashboard/seller/apartments/${apt.id}/edit`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500 self-center">
                    Listingni o‘chirish faqat Owner Admin tomonidan amalga oshiriladi.
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
