import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Image {
  id: string;
  url: string;
  orderIndex: number;
  captionUz: string | null;
  captionRu: string | null;
  captionEn: string | null;
}

interface ApartmentGalleryProps {
  images: Image[];
  title: string;
}

const ApartmentGallery = ({ images, title }: ApartmentGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <div className="text-4xl mb-2">🏢</div>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  const mainImage = images[selectedIndex];
  const thumbnailImages = images.slice(0, 5);

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative rounded-xl overflow-hidden bg-gray-100">
          <img
            src={mainImage.url}
            alt={`${title} - Image ${selectedIndex + 1}`}
            className="w-full h-96 object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
            onClick={() => setIsModalOpen(true)}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {thumbnailImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {images.length > 5 && (
              <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                +{images.length - 5} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Fullscreen View */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="h-8 w-8" />
          </button>
          
          <div className="relative w-full max-w-6xl">
            <img
              src={mainImage.url}
              alt={`${title} - Fullscreen`}
              className="w-full max-h-[80vh] object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
              <span className="text-sm">
                {mainImage.captionEn || `${title} - Image ${selectedIndex + 1}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApartmentGallery;