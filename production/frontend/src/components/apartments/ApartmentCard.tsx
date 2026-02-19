import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bed, Square, Layers, MapPin, Building2 } from 'lucide-react';
import { Apartment } from '../../api/apartments';
import { FavoriteButton } from './FavoriteButton';
import { usersApi } from '../../api/users';
import { useAuthStore } from '../../stores/authStore';

interface ApartmentCardProps {
  apartment: Apartment;
}

const ApartmentCard = ({ apartment }: ApartmentCardProps) => {
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);

  // Check favorite status on mount
  useEffect(() => {
    if (isAuthenticated && apartment.id) {
      checkFavoriteStatus();
    }
  }, [apartment.id, isAuthenticated]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await usersApi.checkFavoriteStatus(apartment.id);
      if (response && typeof response === 'object' && 'isFavorite' in response) {
        setIsFavorite(response.isFavorite);
      } else {
        setIsFavorite(false);
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      setIsFavorite(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-red-100 text-red-800';
      case 'hidden':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Faol';
      case 'sold':
        return 'Sotilgan';
      case 'hidden':
        return 'Yashirilgan';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleFavoriteToggle = (newIsFavorite: boolean) => {
    setIsFavorite(newIsFavorite);
  };

  const pickLocalized = (value: any) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      // Try to parse JSONified translations if present
      if (value.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(value);
          return parsed.uz || parsed.ru || parsed.en || parsed.default || value;
        } catch {
          return value;
        }
      }
      return value;
    }
    if (typeof value === 'object') {
      return value.uz || value.ru || value.en;
    }
    return undefined;
  };

  return (
    <div className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {apartment.coverImage ? (
          <img
            src={apartment.coverImage}
            alt={apartment.title?.en || apartment.titleEn || apartment.titleUz || 'Apartment'}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-full p-4 mb-3">
                <Layers className="h-8 w-8 text-blue-600 mx-auto" />
              </div>
              <p className="text-sm text-gray-600 font-medium">No Image</p>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(apartment.status)}`}>
          {formatStatus(apartment.status)}
        </div>
        
        {/* Price Badge */}
        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-gray-900 to-black text-white px-4 py-2.5 rounded-xl backdrop-blur-sm shadow-lg">
          <div className="text-lg font-bold">{formatPrice(apartment.price)}</div>
        </div>
        
        {/* Favorite Button */}
        <div className="absolute top-4 right-4">
          <FavoriteButton
            apartmentId={apartment.id}
            size="sm"
            initialIsFavorite={isFavorite}
            onToggle={handleFavoriteToggle}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
          <Link to={`/apartments/${apartment.id}`} className="hover:underline">
            {pickLocalized(apartment.title) || apartment.titleUz || apartment.titleEn || 'Uy'}
          </Link>
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-sm mb-4">
          <MapPin className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
          <span className="line-clamp-1 font-medium">
            {pickLocalized(apartment.complex?.address) || apartment.address || 'Manzil koʼrsatilmagan'}
          </span>
        </div>

        {/* Complex Badge */}
        {apartment.complex && (
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-semibold mb-4 border border-blue-100">
            <Building2 className="h-3 w-3 mr-1.5" />
            {pickLocalized(apartment.complex.name) || 'Kompleks'}
          </div>
        )}

        {/* Specifications Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div className="text-center bg-gray-50 rounded-lg py-3">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <Bed className="h-4 w-4 mr-1" />
              <span className="font-bold text-lg">{apartment.rooms}</span>
            </div>
            <div className="text-xs text-gray-600 font-medium">Xona</div>
          </div>

          <div className="text-center bg-gray-50 rounded-lg py-3">
            <div className="flex items-center justify-center text-green-600 mb-1">
              <Square className="h-4 w-4 mr-1" />
              <span className="font-bold text-lg">{apartment.area}</span>
            </div>
            <div className="text-xs text-gray-600 font-medium">m²</div>
          </div>

          <div className="text-center bg-gray-50 rounded-lg py-3">
            <div className="flex items-center justify-center text-purple-600 mb-1">
              <Layers className="h-4 w-4 mr-1" />
              <span className="font-bold text-lg">{apartment.floor}</span>
            </div>
            <div className="text-xs text-gray-600 font-medium">Qavat</div>
          </div>
        </div>

        {/* Developer Info */}
        {apartment.developerName && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>by <span className="font-medium text-gray-700">{apartment.developerName}</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApartmentCard;
