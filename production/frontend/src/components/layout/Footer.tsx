import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Building2 className="h-8 w-8 text-primary-400" />
              <span className="text-2xl font-bold">NestHeaven</span>
            </Link>
            <p className="text-gray-400 mb-6">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">f</div>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">𝕏</div>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">IG</div>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">in</div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/apartments" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.browseApartments')}
                </Link>
              </li>
              <li>
                <Link to="/complexes" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.viewComplexes')}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.sellerDashboard')}
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.howItWorks')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.successStories')}
                </a>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.forSellers')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.listProperty')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.sellerResources')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.pricingPlans')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.successGuide')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.sellerSupport')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contactUs')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-400 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">Tashkent, Uzbekistan</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary-400 mr-3 flex-shrink-0" />
                <a href="tel:+998901234567" className="text-gray-400 hover:text-white transition-colors">
                  +998 90 123 45 67
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary-400 mr-3 flex-shrink-0" />
                <a href="mailto:info@nestheaven.com" className="text-gray-400 hover:text-white transition-colors">
                  info@nestheaven.com
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">{t('footer.stayUpdated')}</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder={t('footer.yourEmail')}
                  className="flex-grow px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-r-md transition-colors">
                  {t('footer.subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} NestHeaven. {t('footer.allRightsReserved')}
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              {t('footer.privacyPolicy')}
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              {t('footer.termsOfService')}
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              {t('footer.cookiePolicy')}
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              {t('footer.sitemap')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;