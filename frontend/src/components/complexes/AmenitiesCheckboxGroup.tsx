import { useState } from 'react';
import { useLanguageStore } from '../../stores/languageStore';
import { AMENITY_CATEGORIES, Amenity } from '../../constants/amenities';
import { getLocalizedContent } from '../../utils/translations';

interface AmenitiesCheckboxGroupProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
  className?: string;
}

export function AmenitiesCheckboxGroup({
  selectedAmenities,
  onChange,
  className = '',
}: AmenitiesCheckboxGroupProps) {
  const { language } = useLanguageStore();

  const handleToggle = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      onChange(selectedAmenities.filter((id) => id !== amenityId));
    } else {
      onChange([...selectedAmenities, amenityId]);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {AMENITY_CATEGORIES.map((category) => {
        const checkedCount = category.amenities.filter((a) =>
          selectedAmenities.includes(a.id)
        ).length;
        const totalCount = category.amenities.length;

        return (
          <div key={category.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">
                {getLocalizedContent(category.label, language)}
              </h4>
              <span className="text-sm text-gray-500">
                {checkedCount}/{totalCount}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.amenities.map((amenity) => (
                <label
                  key={amenity.id}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity.id)}
                    onChange={() => handleToggle(amenity.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">
                    {getLocalizedContent(amenity.label, language)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
