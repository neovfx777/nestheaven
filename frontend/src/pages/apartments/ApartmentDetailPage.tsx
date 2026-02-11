import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bed,
  Square,
  Layers,
  MapPin,
  Building2,
  Phone,
  Mail,
  Share2,
  User,
  Calendar,
  Shield,
  TrendingUp,
  Wind,
  ArrowLeft,
} from 'lucide-react';
import ApartmentGallery from '../../components/apartments/ApartmentGallery';
import { apartmentsApi } from '../../api/apartments';
import { ApartmentDetail as ApartmentDetailType } from '../../api/apartments';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FavoriteButton } from '../../components/apartments/FavoriteButton';
import { ComplexLocationMap } from '../../components/maps/ComplexLocationMap';
import { toast } from 'react-hot-toast';

const ApartmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  // Fetch apartment details
  const {
    data: apartment,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['apartment', id],
    queryFn: () => apartmentsApi.getApartmentById(id!),
    enabled: !!id,
    retry: 1,
  });

  // Debug uchun
  useEffect(() => {
    if (error) {
      console.error('Apartment fetch error:', error);
    }
    if (apartment) {
      console.log('Apartment data:', apartment);
    }
  }, [error, apartment]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading apartment details...</p>
        </div>
      </div>
    );
  }

  if (isError || !apartment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Apartment Not Found</h2>
          <p className="text-gray-600 mb-6">
            The apartment you're looking for doesn't exist or has been removed.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/apartments')}
              className="w-full"
            >
              Browse All Apartments
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      const title = getTitle(apartment);
      const text = `Uy: ${title}`;

      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      } else {
        // Fallback: simple prompt
        window.prompt('Copy this link:', url);
      }
    } catch (error: any) {
      console.error('Share failed:', error);
      toast.error('Could not share this listing');
    }
  };

  // Helper function to get title text
  const getTitle = (apartment: ApartmentDetailType) => {
    if (apartment.title && typeof apartment.title === 'object') {
      return (apartment.title as any).en || (apartment.title as any).uz || (apartment.title as any).ru || 'Apartment';
    }
    return apartment.title as string || 'Apartment';
  };

  // Helper function to get description text
  const getDescription = (apartment: ApartmentDetailType, lang: 'en' | 'uz' | 'ru' = 'en') => {
    if (apartment.description && typeof apartment.description === 'object') {
      return (apartment.description as any)[lang] || '';
    }
    return apartment.description as string || '';
  };

  // Helper function to get location
  const getLocation = (apartment: ApartmentDetailType) => {
    if (apartment.complex?.address && typeof apartment.complex.address === 'object') {
      return (apartment.complex.address as any).en || (apartment.complex.address as any).uz ||
        (apartment.complex.address as any).ru || 'Location not specified';
    }
    return apartment.complex?.address as string || 'Location not specified';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Apartments
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Favorite Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <div className="bg-white rounded-full shadow-lg p-3 border border-gray-200">
          <FavoriteButton
            apartmentId={apartment.id}
            size="lg"
            showText={false}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <Card className="overflow-hidden">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{getTitle(apartment)}</h1>
                <div className="flex items-center text-gray-600 mb-6">
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{getLocation(apartment)}</span>
                </div>

                {/* Images */}
                {apartment.images && apartment.images.length > 0 ? (
                  <ApartmentGallery images={apartment.images} title={getTitle(apartment)} />
                ) : (
                  <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Building2 className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                      <p className="text-gray-600">No images available</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Complex Locations Card */}
            {apartment.complex && (
              <Card>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <MapPin className="h-6 w-6 text-primary-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Complex Location</h3>
                  </div>
                  
                  {/* Location Text */}
                  {apartment.complex.locationText && (
                    <div className="mb-4">
                      <p className="text-gray-700 font-medium text-base">{apartment.complex.locationText}</p>
                    </div>
                  )}

                  {/* Map */}
                  {(apartment.complex.locationLat && apartment.complex.locationLng) && (
                    <div className="mb-4">
                      <ComplexLocationMap
                        latitude={apartment.complex.locationLat}
                        longitude={apartment.complex.locationLng}
                        locationText={apartment.complex.locationText || undefined}
                        complexName={
                          apartment.complex.name && typeof apartment.complex.name === 'object'
                            ? (apartment.complex.name as any).en || (apartment.complex.name as any).uz || (apartment.complex.name as any).ru
                            : apartment.complex.name
                        }
                        heightClassName="h-64 sm:h-80"
                        zoom={15}
                      />
                    </div>
                  )}

                  {/* Coordinates */}
                  {(apartment.complex.locationLat && apartment.complex.locationLng) && (
                    <div className="mb-4 text-sm text-gray-600">
                      <span className="font-medium">Coordinates: </span>
                      <span className="font-mono">{apartment.complex.locationLat.toFixed(6)}, {apartment.complex.locationLng.toFixed(6)}</span>
                    </div>
                  )}

                  {/* Nearby Places */}
                  {apartment.complex.nearbyPlaces && apartment.complex.nearbyPlaces.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Nearby Places:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {apartment.complex.nearbyPlaces.map((place, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center flex-1 min-w-0">
                              <MapPin className="h-4 w-4 text-primary-600 mr-2 flex-shrink-0" />
                              <div className="min-w-0">
                                <span className="font-medium text-gray-900 block truncate">{place.name}</span>
                                {place.note && (
                                  <span className="text-xs text-gray-500 block">{place.note}</span>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-600 ml-2 flex-shrink-0">
                              {place.distanceMeters < 1000 
                                ? `${place.distanceMeters}m` 
                                : `${(place.distanceMeters / 1000).toFixed(1)}km`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nearby Note */}
                  {apartment.complex.nearbyNote && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 italic">{apartment.complex.nearbyNote}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Price and Quick Stats */}
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-3xl font-bold text-primary-600">{formatPrice(apartment.price)}</div>
                    <div className="text-gray-500">Total Price</div>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${apartment.status === 'active' || apartment.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : apartment.status === 'sold' || apartment.status === 'SOLD'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                    {apartment.status.toUpperCase()}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 py-6 border-y border-gray-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-gray-700 mb-1">
                      <Bed className="h-6 w-6 mr-2" />
                      <span className="text-xl font-bold">{apartment.rooms}</span>
                    </div>
                    <div className="text-sm text-gray-500">Rooms</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-gray-700 mb-1">
                      <Square className="h-6 w-6 mr-2" />
                      <span className="text-xl font-bold">{apartment.area}</span>
                    </div>
                    <div className="text-sm text-gray-500">Area (m²)</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-gray-700 mb-1">
                      <Layers className="h-6 w-6 mr-2" />
                      <span className="text-xl font-bold">{apartment.floor}</span>
                    </div>
                    <div className="text-sm text-gray-500">Floor</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-gray-700 mb-1">
                      <Calendar className="h-6 w-6 mr-2" />
                      <span className="text-xl font-bold">
                        {apartment.totalFloors || 'N/A'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">Total Floors</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  {/* Favorite Button - Always visible, especially on mobile */}
                  <div className="flex-1 sm:flex-initial w-full sm:w-auto">
                    <div className="w-full sm:w-auto">
                      <FavoriteButton
                        apartmentId={apartment.id}
                        size="md"
                        showText={true}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="flex-1 w-full sm:w-auto"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                  <Button className="flex-1 w-full sm:w-auto">
                    <Phone className="h-5 w-5 mr-2" />
                    <span className="hidden sm:inline">Contact Seller</span>
                    <span className="sm:hidden">Contact</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Card>
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {['details', 'description', 'contact'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Specifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500">Price per m²</div>
                          <div className="font-semibold">
                            {formatPrice(apartment.price / apartment.area)}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500">Year Built</div>
                          <div className="font-semibold">2023</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm text-gray-500">Condition</div>
                          <div className="font-semibold">New</div>
                        </div>
                      </div>
                    </div>

                    {/* Complex Info */}
                    {apartment.complex && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Complex Information</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <Building2 className="h-8 w-8 text-primary-600 mr-3" />
                            <div>
                              <div className="font-medium">
                                {apartment.complex.name && typeof apartment.complex.name === 'object'
                                  ? (apartment.complex.name as any).en || JSON.stringify(apartment.complex.name)
                                  : apartment.complex.name}
                              </div>
                              <div className="text-sm text-gray-600">{apartment.complex.city}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'description' && (
                  <div className="space-y-6">
                    {/* Description in different languages */}
                    {['en', 'uz', 'ru'].map((lang) => {
                      const desc = getDescription(apartment, lang as 'en' | 'uz' | 'ru');
                      if (!desc) return null;

                      return (
                        <div key={lang} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center text-sm font-bold mr-2">
                              {lang.toUpperCase()}
                            </div>
                            <h4 className="font-medium">
                              {lang === 'en' ? 'English' : lang === 'uz' ? 'Uzbek' : 'Russian'} Description
                            </h4>
                          </div>
                          <p className="text-gray-700">{desc}</p>
                        </div>
                      );
                    })}

                    {/* Complex Locations */}
                    {apartment.complex && (
                      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                        <div className="flex items-center mb-4">
                          <MapPin className="h-6 w-6 text-primary-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900">Complex Location</h3>
                        </div>
                        
                        {/* Location Text */}
                        {apartment.complex.locationText && (
                          <div className="mb-4">
                            <p className="text-gray-700 font-medium">{apartment.complex.locationText}</p>
                          </div>
                        )}

                        {/* Coordinates */}
                        {(apartment.complex.locationLat && apartment.complex.locationLng) && (
                          <div className="mb-4 text-sm text-gray-600">
                            <span className="font-medium">Coordinates: </span>
                            <span>{apartment.complex.locationLat.toFixed(6)}, {apartment.complex.locationLng.toFixed(6)}</span>
                          </div>
                        )}

                        {/* Nearby Places */}
                        {apartment.complex.nearbyPlaces && apartment.complex.nearbyPlaces.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Nearby Places:</h4>
                            <div className="space-y-2">
                              {apartment.complex.nearbyPlaces.map((place, index) => (
                                <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 text-primary-600 mr-2" />
                                    <span className="font-medium text-gray-900">{place.name}</span>
                                    {place.note && (
                                      <span className="ml-2 text-sm text-gray-500">({place.note})</span>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {place.distanceMeters < 1000 
                                      ? `${place.distanceMeters}m` 
                                      : `${(place.distanceMeters / 1000).toFixed(1)}km`}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Nearby Note */}
                        {apartment.complex.nearbyNote && (
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <p className="text-sm text-gray-600 italic">{apartment.complex.nearbyNote}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'contact' && apartment.seller && (
                  <div className="space-y-6">
                    {/* Seller Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium">{apartment.seller.fullName}</div>
                            <div className="text-sm text-gray-500">{apartment.seller.email}</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Button className="w-full">
                            <Phone className="h-5 w-5 mr-2" />
                            Call Seller
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Mail className="h-5 w-5 mr-2" />
                            Send Email
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Seller Card */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Seller</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium">{apartment.seller.fullName}</div>
                      <div className="text-sm text-gray-500">Verified Seller</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full">
                      <Phone className="h-5 w-5 mr-2" />
                      Call Now
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-5 w-5 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Mortgage Calculator */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mortgage Calculator</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Loan Amount (70%)</label>
                    <div className="text-2xl font-bold text-primary-600">
                      {formatPrice(apartment.price * 0.7)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Estimated Monthly Payment</label>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(apartment.price * 0.004)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Based on 30-year term at 4.5% interest
                    </p>
                  </div>
                </div>
              </div>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetailPage;