import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useLanguageStore } from '../../stores/languageStore';
import { NEARBY_PLACE_TYPES } from '../../constants/amenities';
import { getLocalizedContent } from '../../utils/translations';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export interface NearbyPlace {
  type: string;
  name: string;
  distanceMeters: number;
  note?: string;
}

interface NearbyPlacesManagerProps {
  places: NearbyPlace[];
  onChange: (places: NearbyPlace[]) => void;
  className?: string;
}

export function NearbyPlacesManager({
  places,
  onChange,
  className = '',
}: NearbyPlacesManagerProps) {
  const { language } = useLanguageStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<NearbyPlace>({
    type: '',
    name: '',
    distanceMeters: 0,
    note: '',
  });

  const handleAdd = () => {
    if (formData.type && formData.name && formData.distanceMeters > 0) {
      onChange([...places, { ...formData }]);
      setFormData({ type: '', name: '', distanceMeters: 0, note: '' });
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData(places[index]);
  };

  const handleUpdate = () => {
    if (editingIndex !== null && formData.type && formData.name && formData.distanceMeters > 0) {
      const updated = [...places];
      updated[editingIndex] = { ...formData };
      onChange(updated);
      setEditingIndex(null);
      setFormData({ type: '', name: '', distanceMeters: 0, note: '' });
    }
  };

  const handleDelete = (index: number) => {
    onChange(places.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setFormData({ type: '', name: '', distanceMeters: 0, note: '' });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Add/Edit Form */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="Place Type"
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value })}
            options={[
              { label: 'Select type...', value: '' },
              ...NEARBY_PLACE_TYPES.map((type) => ({
                label: getLocalizedContent(type.label, language),
                value: type.id,
              })),
            ]}
          />
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Metro Station"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Distance (meters)"
            type="number"
            value={formData.distanceMeters.toString()}
            onChange={(e) =>
              setFormData({ ...formData, distanceMeters: parseInt(e.target.value) || 0 })
            }
            placeholder="500"
          />
          <Input
            label="Note (optional)"
            value={formData.note || ''}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="e.g., Blue line"
          />
        </div>
        <div className="flex space-x-2">
          {editingIndex !== null ? (
            <>
              <Button onClick={handleUpdate} size="sm">
                Update
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleAdd} size="sm" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Place</span>
            </Button>
          )}
        </div>
      </div>

      {/* Places List */}
      {places.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Added Places:</h4>
          {places.map((place, index) => {
            const placeType = NEARBY_PLACE_TYPES.find((t) => t.id === place.type);
            const distanceText =
              place.distanceMeters < 1000
                ? `${place.distanceMeters}m`
                : `${(place.distanceMeters / 1000).toFixed(1)}km`;

            return (
              <div
                key={index}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{place.name}</span>
                    {placeType && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {getLocalizedContent(placeType.label, language)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span>{distanceText}</span>
                    {place.note && <span className="italic">{place.note}</span>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
