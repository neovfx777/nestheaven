import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, User, LogIn } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { broadcastsApi } from '../../api/broadcasts';
import { LanguageSelector } from '../ui/LanguageSelector';
import { useTranslation } from '../../hooks/useTranslation';

const Header = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const { t } = useTranslation();

  const { data: broadcasts } = useQuery({
    queryKey: ['broadcasts', 'latest'],
    queryFn: () => broadcastsApi.getBroadcasts(1),
    staleTime: 60 * 1000,
    retry: 1,
  });

  const latestBroadcast = broadcasts?.[0];
  const bannerTitle = latestBroadcast?.title || t('header.defaultBannerTitle');
  const bannerMessage =
    latestBroadcast?.message || t('header.defaultBannerMessage');

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Main Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">NestHeaven</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className={`transition-colors ${
                  location.pathname === '/' 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {t('navigation.home')}
              </Link>
              <Link 
                to="/apartments" 
                className={`transition-colors ${
                  location.pathname.startsWith('/apartments') 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {t('navigation.apartments')}
              </Link>
              <Link 
                to="/complexes" 
                className={`transition-colors ${
                  location.pathname.startsWith('/complexes') 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {t('navigation.complexes')}
              </Link>
            </nav>

            {/* Language Selector & Auth Section */}
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="hidden sm:inline text-gray-700 text-sm">{user?.fullName || user?.email}</span>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">{t('navigation.dashboard')}</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <LogIn className="h-5 w-5" />
                    <span className="hidden sm:inline">{t('navigation.login')}</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('navigation.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advertising/Broadcast Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-3 text-sm md:text-base">
            <span className="font-bold animate-pulse">🔥</span>
            <span className="font-semibold">
              {bannerTitle} {bannerMessage}
            </span>
            <Link
              to="/apartments"
              className="ml-2 px-3 py-1 bg-white text-orange-600 rounded-md font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              {t('navigation.view')} →
            </Link>
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
