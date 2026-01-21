import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Bed,
  Square,
  Layers,
  MapPin,
  Building2,
  Phone,
  Mail,
  Share2,
  Heart,
  DollarSign,
  User,
  Calendar,
  Shield,
  TrendingUp,
  Wind,
} from 'lucide-react';
import ApartmentGallery from '../../components/apartments/ApartmentGallery';
import { apartmentsApi } from '../../api/apartments';

const ApartmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch apartment details
  const {
    data: apartment,
    isLoading,
    isError,
  } = useQuery(['apartment', id], () => apartmentsApi.getApartmentById(id!), {
    enabled: !!id,
  });

  // Fetch other apartments in same complex
  const { data: otherApartments } = useQuery(
    ['otherApartments', id],
    () => apartmentsApi.getOtherApartments(id!, 4),
    { enabled: !!apartment?.complex }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError || !apartment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Apartment Not Found</h2>
          <p className="text-gray-600 mb-6">The apartment you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/apartments"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse All Apartments
          </Link>
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link to="/" className="hover:text-primary-600">Home</Link>
          </li>
          <li>›</li>
          <li>
            <Link to="/apartments" className="hover:text-primary-600">Apartments</Link>
          </li>
          <li>›</li>
          <li className="font-medium text-gray-900 truncate">{apartment.titleEn}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ApartmentGallery images={apartment.images} title={apartment.titleEn} />
          </div>

          {/* Title and Price */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{apartment.titleEn}</h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{apartment.address}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">{formatPrice(apartment.price)}</div>
                <div className="text-sm text-gray-500">Total Price</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 py-6 border-y border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center text-gray-700 mb-1">
                  <Bed className="h-6 w-6 mr-2" />
                  <span className="text-xl font-bold">{apartment.rooms}</span>
                </div>
                <div className="text-sm text-gray-500">Bedrooms</div>
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
                  <Building2 className="h-6 w-6 mr-2" />
                  <span className="text-xl font-bold">{apartment.developerName}</span>
                </div>
                <div className="text-sm text-gray-500">Developer</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg border ${
                  isSaved
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                } transition-colors`}
              >
                <Heart className={`h-5 w-5 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <button className="flex-1 flex items-center justify-center px-6 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </button>
              {apartment.contactInfo && (
                <a
                  href={`tel:${apartment.contactInfo.phone}`}
                  className="flex-1 flex items-center justify-center px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Contact
                </a>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Headers */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {['details', 'description', 'infrastructure', 'installment'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Developer Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Developer Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Building2 className="h-8 w-8 text-primary-600 mr-3" />
                        <div>
                          <div className="font-medium">{apartment.developerName}</div>
                          {apartment.complex && (
                            <div className="text-sm text-gray-600">Complex: {apartment.complex.name}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-500">Status</div>
                        <div className={`font-semibold ${
                          apartment.status === 'ACTIVE' ? 'text-green-600' :
                          apartment.status === 'SOLD' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {apartment.status}
                        </div>
                      </div>
                      {apartment.airQualityIndex && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Wind className="h-4 w-4 mr-1" />
                            Air Quality
                          </div>
                          <div className="font-semibold">{apartment.airQualityIndex}/100</div>
                        </div>
                      )}
                      {apartment.investmentGrowthPercent && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Growth Potential
                          </div>
                          <div className="font-semibold text-green-600">
                            +{apartment.investmentGrowthPercent}%
                          </div>
                        </div>
                      )}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Listed
                        </div>
                        <div className="font-semibold">{formatDate(apartment.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  {apartment.latitude && apartment.longitude && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Location</h3>
                      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <MapPin className="h-12 w-12 mx-auto mb-2" />
                          <p>Map would be displayed here</p>
                          <p className="text-sm">Coordinates: {apartment.latitude}, {apartment.longitude}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'description' && (
                <div className="space-y-6">
                  {/* Multi-language Descriptions */}
                  {['en', 'ru', 'uz'].map((lang) => (
                    <div key={lang} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center text-sm font-bold mr-2">
                          {lang.toUpperCase()}
                        </div>
                        <h4 className="font-medium">{lang === 'en' ? 'English' : lang === 'ru' ? 'Russian' : 'Uzbek'}</h4>
                      </div>
                      <div className="text-gray-700">
                        <p className="mb-2">
                          <span className="font-semibold">Title:</span>{' '}
                          {apartment.multiLanguageContent[lang as keyof typeof apartment.multiLanguageContent].title}
                        </p>
                        {apartment.multiLanguageContent[lang as keyof typeof apartment.multiLanguageContent].description && (
                          <p>
                            <span className="font-semibold">Description:</span>{' '}
                            {apartment.multiLanguageContent[lang as keyof typeof apartment.multiLanguageContent].description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'infrastructure' && apartment.infrastructure && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(apartment.infrastructure).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="font-semibold">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'installment' && apartment.installmentOptions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Installment Options</h3>
                  <div className="space-y-4">
                    {Array.isArray(apartment.installmentOptions) &&
                      apartment.installmentOptions.map((option: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">{option.bankName}</div>
                            <div className="text-primary-600 font-bold">
                              {option.interestRate}% interest
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">Duration</div>
                              <div className="font-medium">{option.years} years</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Down Payment</div>
                              <div className="font-medium">{formatPrice(option.downPayment)}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Monthly Payment</div>
                              <div className="font-medium">{formatPrice(option.monthlyPayment)}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Total Amount</div>
                              <div className="font-medium">{formatPrice(option.totalAmount)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Other Apartments in Same Complex */}
          {otherApartments && otherApartments.otherApartments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Other Apartments in {otherApartments.complex.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherApartments.otherApartments.slice(0, 2).map((apt: any) => (
                  <Link
                    key={apt.id}
                    to={`/apartments/${apt.id}`}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      {apt.coverImage ? (
                        <img
                          src={apt.coverImage}
                          alt={apt.titleEn}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{apt.titleEn}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Bed className="h-4 w-4 mr-1" />
                        <span className="mr-4">{apt.rooms} rooms</span>
                        <Square className="h-4 w-4 mr-1" />
                        <span>{apt.area}m²</span>
                      </div>
                      <div className="font-bold text-primary-600">{formatPrice(apt.price)}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link
                  to={`/complexes/${otherApartments.complex.id}/apartments`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all {otherApartments.totalInComplex} apartments in this complex →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Seller Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <div className="font-medium">{apartment.seller.fullName}</div>
                <div className="text-sm text-gray-500">Verified Seller</div>
              </div>
            </div>
            
            {apartment.contactInfo && (
              <div className="space-y-3">
                <a
                  href={`tel:${apartment.contactInfo.phone}`}
                  className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <Phone className="h-5 w-5 mr-3 text-gray-400" />
                  {apartment.contactInfo.phone}
                </a>
                {apartment.contactInfo.telegram && (
                  <a
                    href={`https://t.me/${apartment.contactInfo.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">✈️</div>
                    @{apartment.contactInfo.telegram}
                  </a>
                )}
                {apartment.contactInfo.whatsapp && (
                  <a
                    href={`https://wa.me/${apartment.contactInfo.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <div className="w-5 h-5 mr-3 flex items-center justify-center">💬</div>
                    WhatsApp
                  </a>
                )}
                {apartment.contactInfo.email && (
                  <a
                    href={`mailto:${apartment.contactInfo.email}`}
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <Mail className="h-5 w-5 mr-3 text-gray-400" />
                    {apartment.contactInfo.email}
                  </a>
                )}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100">
              <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Schedule a Viewing
              </button>
            </div>
          </div>

          {/* Price Calculator */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Calculator</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Loan Amount</label>
                <input
                  type="range"
                  min="0"
                  max={apartment.price}
                  value={apartment.price * 0.7}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>$0</span>
                  <span className="font-medium">{formatPrice(apartment.price * 0.7)}</span>
                  <span>{formatPrice(apartment.price)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Loan Term</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>15 years</option>
                  <option>20 years</option>
                  <option>25 years</option>
                  <option>30 years</option>
                </select>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Estimated Monthly Payment</span>
                  <span className="font-bold text-primary-600">{formatPrice(apartment.price * 0.004)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Based on 70% loan amount and 4.5% interest rate
                </div>
              </div>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center mb-3">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <h4 className="font-semibold text-blue-900">Safety Tips</h4>
            </div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Meet in public places for initial meetings</li>
              <li>• Never wire money without verifying the property</li>
              <li>• Verify seller identity through official channels</li>
              <li>• Use secure payment methods</li>
              <li>• Report suspicious activity to platform admins</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentDetailPage;