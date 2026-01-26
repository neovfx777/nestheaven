import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { usersApi } from '../../api/users';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Record<string, any>;
  onSaveSuccess?: () => void;
}

export const SaveSearchModal: React.FC<SaveSearchModalProps> = ({
  isOpen,
  onClose,
  filters,
  onSaveSuccess,
}) => {
  const { isAuthenticated } = useAuthStore();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save searches');
      onClose();
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a name for your search');
      return;
    }

    setIsSaving(true);
    try {
      await usersApi.saveSearch(name.trim(), filters);
      toast.success('Search saved successfully');
      onSaveSuccess?.();
      onClose();
      setName('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save search');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const filterCount = Object.keys(filters).filter(key => 
    filters[key] !== undefined && filters[key] !== '' && filters[key] !== null
  ).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Save Search</h3>
            <p className="text-sm text-gray-500 mt-1">
              Save your current search criteria for quick access later
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Search Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Current Search Criteria:</div>
            <div className="text-sm text-gray-600">
              {filterCount > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {filters.minPrice && <li>Min price: ${filters.minPrice}</li>}
                  {filters.maxPrice && <li>Max price: ${filters.maxPrice}</li>}
                  {filters.minRooms && <li>Min rooms: {filters.minRooms}</li>}
                  {filters.maxRooms && <li>Max rooms: {filters.maxRooms}</li>}
                  {filters.minArea && <li>Min area: {filters.minArea}m²</li>}
                  {filters.maxArea && <li>Max area: {filters.maxArea}m²</li>}
                  {filters.complexId && <li>Complex selected</li>}
                  {filters.developerName && <li>Developer: {filters.developerName}</li>}
                  {filters.search && <li>Search term: "{filters.search}"</li>}
                </ul>
              ) : (
                <p className="text-gray-500">No filters applied (showing all apartments)</p>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 3-bedroom apartments near metro"
              maxLength={100}
            />
            <p className="text-sm text-gray-500 mt-2">
              Give your search a descriptive name so you can find it easily later.
            </p>
          </div>

          {/* Benefits */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">Benefits of Saving Searches:</div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li className="flex items-start">
                <Save className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Get notified when new apartments match your criteria
              </li>
              <li className="flex items-start">
                <Save className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Quickly re-run complex searches with one click
              </li>
              <li className="flex items-start">
                <Save className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                Track your search history and preferences
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || isSaving}
              loading={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Search
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};