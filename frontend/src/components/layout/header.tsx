import { Link, useLocation } from 'react-router-dom';
import { Building2, User, LogIn, MapPin, TrendingUp, Calendar } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { defaultComplexData } from '../../data/defaultData';

const Header = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const complexData = defaultComplexData;

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
                Home
              </Link>
              <Link 
                to="/apartments" 
                className={`transition-colors ${
                  location.pathname.startsWith('/apartments') 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Apartments
              </Link>
              <Link 
                to="/complexes" 
                className={`transition-colors ${
                  location.pathname.startsWith('/complexes') 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Complexes
              </Link>
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="hidden sm:inline text-gray-700 text-sm">{user?.fullName || user?.email}</span>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <LogIn className="h-5 w-5" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advertising Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-3 text-sm md:text-base">
            <span className="font-bold animate-pulse">🔥</span>
            <span className="font-semibold">
              Yangi uy-joylar keldi! Premium kvartiralarni ko'rib chiqing va 15% gacha chegirma oling!
            </span>
            <Link
              to="/apartments"
              className="ml-2 px-3 py-1 bg-white text-orange-600 rounded-md font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Ko'rish →
            </Link>
          </div>
        </div>
      </div>

      {/* Complex Info Banner (only on home page) */}
      {isHomePage && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {typeof complexData.name === 'string' ? complexData.name : complexData.name?.en || 'NestHeaven'}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>
                  {typeof complexData.address === 'string' ? complexData.address : complexData.address?.en || 'Tashkent, Uzbekistan'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Completion: {new Date(complexData.completionDate).getFullYear()}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-green-600">{complexData.investmentGrowthPercent}% Investment Growth</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{complexData.totalApartments} Apartments Available</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;