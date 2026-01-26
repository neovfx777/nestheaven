import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bed, Square, Layers, MapPin, Heart } from 'lucide-react';
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
  const [isChecking, setIsChecking] = useState(false);

  // Check favorite status on mount
  useEffect(() => {
    if (isAuthenticated && apartment.id) {
      checkFavoriteStatus();
    }
  }, [apartment.id, isAuthenticated]);

  const checkFavoriteStatus = async () => {
    try {
      setIsChecking(true);
      const { isFavorite: favoriteStatus } = await usersApi.checkFavoriteStatus(apartment.id);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-red-100 text-red-800';
      case 'HIDDEN':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
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

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {apartment.coverImage ? (
          <img
            src={apartment.coverImage}
            alt={apartment.titleEn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-gray-400">
              <Layers className="h-12 w-12 mx-auto" />
              <p className="text-sm mt-2">No Image</p>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apartment.status)}`}>
          {apartment.status}
        </div>
        
        {/* Price Badge */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
          <div className="text-lg font-bold">{formatPrice(apartment.price)}</div>
        </div>
        
        {/* Favorite Button */}
        <div className="absolute top-3 right-3">
          <FavoriteButton
            apartmentId={apartment.id}
            size="sm"
            initialIsFavorite={isFavorite}
            onToggle={handleFavoriteToggle}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          <Link to={`/apartments/${apartment.id}`}>
            {apartment.titleEn}
          </Link>
        </h3>

        {/* Address */}
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{apartment.address}</span>
        </div>

        {/* Developer */}
        {apartment.developerName && (
          <div className="text-sm text-gray-500 mb-4">
            by {apartment.developerName}
          </div>
        )}

        {/* Complex */}
        {apartment.complex && (
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-4">
            {apartment.complex.name}
          </div>
        )}

        {/* Specifications */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-1">
              <Bed className="h-5 w-5 mr-1" />
              <span className="font-semibold">{apartment.rooms}</span>
            </div>
            <div className="text-xs text-gray-500">Rooms</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-1">
              <Square className="h-5 w-5 mr-1" />
              <span className="font-semibold">{apartment.area}m²</span>
            </div>
            <div className="text-xs text-gray-500">Area</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600 mb-1">
              <Layers className="h-5 w-5 mr-1" />
              <span className="font-semibold">{apartment.floor}</span>
            </div>
            <div className="text-xs text-gray-500">Floor</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentCard;