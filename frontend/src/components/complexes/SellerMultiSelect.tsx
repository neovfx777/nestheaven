import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import apiClient from '../../api/client'; // IMPORT apiClient

interface SellerMultiSelectProps {
  selectedSellerIds: string[];
  onChange: (sellerIds: string[]) => void;
  className?: string;
}

interface Seller {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
}

export function SellerMultiSelect({
  selectedSellerIds,
  onChange,
  className = '',
}: SellerMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuthStore();
  const { t } = useTranslation();

  // Fetch all sellers using apiClient
  const { data: sellers = [], isLoading, error } = useQuery<Seller[]>({
    queryKey: ['sellers'],
    queryFn: async () => {
      // Use apiClient instead of fetch
      const response = await apiClient.get('/users/sellers');
      return response.data?.data || response.data || [];
    },
    enabled: !!token, // Only fetch if token exists
  });

  const filteredSellers = (sellers || []).filter((seller: Seller) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const fullName = `${seller.firstName || ''} ${seller.lastName || ''}`.toLowerCase();
    const email = (seller.email || '').toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const handleToggle = (sellerId: string) => {
    if (selectedSellerIds.includes(sellerId)) {
      onChange(selectedSellerIds.filter((id) => id !== sellerId));
    } else {
      onChange([...selectedSellerIds, sellerId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSellerIds.length === filteredSellers.length) {
      onChange([]);
    } else {
      onChange(filteredSellers.map((s: Seller) => s.id));
    }
  };

  if (error) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          Error loading sellers: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {t('complex.allowedSellers')} ({selectedSellerIds.length} {t('common.selected') || 'selected'})
        </label>
        {filteredSellers.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedSellerIds.length === filteredSellers.length ? (t('common.deselectAll') || 'Deselect All') : (t('common.selectAll') || 'Select All')}
          </Button>
        )}
      </div>

      <Input
        type="text"
        placeholder={t('common.searchSellers') || 'Search sellers by name or email...'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />

      {isLoading ? (
        <div className="text-sm text-gray-500 py-4 text-center">{t('common.loading')}</div>
      ) : filteredSellers.length === 0 ? (
        <div className="text-sm text-gray-500 py-4 text-center border border-gray-200 rounded-lg">
          {t('common.noSellersFound') || 'No sellers found'}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {filteredSellers.map((seller: Seller) => {
            const isSelected = selectedSellerIds.includes(seller.id);
            const fullName = `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'No name';

            return (
              <div
                key={seller.id}
                className={`flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                  isSelected ? 'bg-primary-50' : ''
                }`}
                onClick={() => handleToggle(seller.id)}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{fullName}</div>
                  <div className="text-sm text-gray-500">{seller.email}</div>
                </div>
                <div className={`ml-3 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`}>
                  {isSelected ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedSellerIds.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedSellerIds.map((sellerId) => {
            const seller = (sellers || []).find((s: Seller) => s.id === sellerId);
            if (!seller) return null;
            const fullName = `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'No name';

            return (
              <div
                key={sellerId}
                className="inline-flex items-center space-x-1 bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm"
              >
                <span>{fullName}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(sellerId);
                  }}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}