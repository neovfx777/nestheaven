import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '../ui/Button';
import { usersApi } from '../../api/users';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

interface FavoriteButtonProps {
  apartmentId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onToggle?: (isFavorite: boolean) => void;
  initialIsFavorite?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  apartmentId,
  size = 'md',
  showText = false,
  onToggle,
  initialIsFavorite = false,
}) => {
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  // Check initial favorite status
  useEffect(() => {
    if (isAuthenticated && apartmentId) {
      checkFavoriteStatus();
    }
  }, [apartmentId, isAuthenticated]);

  const checkFavoriteStatus = async () => {
    try {
      const { isFavorite: favoriteStatus } = await usersApi.checkFavoriteStatus(apartmentId);
      setIsFavorite(favoriteStatus);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await usersApi.removeFavorite(apartmentId);
        setIsFavorite(false);
        toast.success('Removed from favorites');
        onToggle?.(false);
      } else {
        await usersApi.addFavorite(apartmentId);
        setIsFavorite(true);
        toast.success('Added to favorites');
        onToggle?.(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2.5',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`${sizeClasses[size]} ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
    >
      <Heart
        className={`${iconSizes[size]} ${isFavorite ? 'fill-current' : ''} ${isLoading ? 'animate-pulse' : ''}`}
      />
      {showText && (
        <span className="ml-2">
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </span>
      )}
    </Button>
  );
};