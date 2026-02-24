import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ApartmentCard from './ApartmentCard';
import { Apartment } from '../../api/apartments';

interface ApartmentCarouselProps {
  title: string;
  subtitle?: string;
  apartments: Apartment[];
  showBadge?: boolean;
  badgeText?: string;
  badgeColor?: 'green' | 'blue' | 'purple' | 'orange';
}

export const ApartmentCarousel = ({
  title,
  subtitle,
  apartments,
  showBadge = false,
  badgeText,
  badgeColor = 'blue',
}: ApartmentCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerView(1);
      } else if (width < 1024) {
        setItemsPerView(2);
      } else if (width < 1280) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, apartments.length - itemsPerView);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const badgeColors = {
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  if (apartments.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
                {showBadge && badgeText && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${badgeColors[badgeColor]}`}>
                    {badgeText}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-gray-600 mt-2">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          {apartments.length > itemsPerView && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={goToPrev}
                disabled={!canGoPrev}
                className={`p-2 rounded-full border transition-colors ${
                  canGoPrev
                    ? 'border-gray-300 hover:bg-gray-100 text-gray-700'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToNext}
                disabled={!canGoNext}
                className={`p-2 rounded-full border transition-colors ${
                  canGoNext
                    ? 'border-gray-300 hover:bg-gray-100 text-gray-700'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {apartments.map((apartment) => (
                <div
                  key={apartment.id}
                  className="flex-shrink-0"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <div className="px-2">
                    <ApartmentCard apartment={apartment} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Navigation */}
          {apartments.length > itemsPerView && (
            <div className="md:hidden flex items-center justify-center gap-4 mt-6">
              <button
                onClick={goToPrev}
                disabled={!canGoPrev}
                className={`p-2 rounded-full border transition-colors ${
                  canGoPrev
                    ? 'border-gray-300 hover:bg-gray-100 text-gray-700'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {/* Dots Indicator */}
              <div className="flex gap-2">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-blue-600'
                        : 'w-2 bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                disabled={!canGoNext}
                className={`p-2 rounded-full border transition-colors ${
                  canGoNext
                    ? 'border-gray-300 hover:bg-gray-100 text-gray-700'
                    : 'border-gray-200 text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link
            to="/apartments"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View All Apartments
            <ChevronRight className="h-5 w-5 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};
