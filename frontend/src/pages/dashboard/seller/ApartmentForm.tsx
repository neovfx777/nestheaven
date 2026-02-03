import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apartmentsApi } from '../../../api/apartments'; // FIXED: apartmentsApi (with 's')
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { ImageUpload } from '../../../components/ui/ImageUpload';
import { toast } from 'react-hot-toast';

interface ApartmentFormData {
  title: { uz: string; ru: string; en: string };
  description: { uz: string; ru: string; en: string };
  price: number;
  rooms: number;
  area: number;
  floor: number;
  complexId: string;
  address: string;
  developer: string;
  contactPhone: string;
  contactTelegram: string;
  contactEmail: string;
  status?: string;
}

interface Complex {
  id: string;
  name: string;
}

interface ImageType {
  id: string;
  url: string;
  order?: number;
}

// Basic validation function
const validateApartment = (data: ApartmentFormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.title?.uz && !data.title?.ru && !data.title?.en) {
    errors.title = 'Title is required in at least one language';
  }
  
  if (!data.price || data.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }
  
  if (!data.rooms || data.rooms <= 0) {
    errors.rooms = 'Number of rooms must be greater than 0';
  }
  
  if (!data.area || data.area <= 0) {
    errors.area = 'Area must be greater than 0';
  }
  
  if (!data.floor || data.floor <= 0) {
    errors.floor = 'Floor must be greater than 0';
  }
  
  if (!data.address?.trim()) {
    errors.address = 'Address is required';
  }
  
  if (!data.contactPhone?.trim()) {
    errors.contactPhone = 'Phone number is required';
  }
  
  if (!data.developer?.trim()) {
    errors.developer = 'Developer name is required';
  }
  
  return errors;
};

export const ApartmentForm: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ImageType[]>([]);
  
  const { data: complexes = [] } = useQuery<Complex[]>({
    queryKey: ['complexes'],
    queryFn: async () => {
      try {
        // Try to fetch complexes from your API
        // If you don't have a complexes API yet, return empty array
        return [];
      } catch (error) {
        console.error('Error fetching complexes:', error);
        return [];
      }
    }
  });

  const { data: apartment, isLoading } = useQuery({
    queryKey: ['apartment', id],
    queryFn: () => apartmentsApi.getById(id!), // FIXED: apartmentsApi
    enabled: mode === 'edit' && !!id
  });

  const form = useForm<ApartmentFormData>({
    defaultValues: {
      title: { uz: '', ru: '', en: '' },
      description: { uz: '', ru: '', en: '' },
      price: 0,
      rooms: 1,
      area: 0,
      floor: 1,
      complexId: '',
      address: '',
      developer: '',
      contactPhone: '',
      contactTelegram: '',
      contactEmail: '',
      status: 'active'
    }
  });

  useEffect(() => {
    if (apartment && mode === 'edit') {
      form.reset({
        title: apartment.title || { uz: '', ru: '', en: '' },
        description: apartment.description || { uz: '', ru: '', en: '' },
        price: apartment.price || 0,
        rooms: apartment.rooms || 1,
        area: apartment.area || 0,
        floor: apartment.floor || 1,
        complexId: apartment.complexId || '',
        address: apartment.address || '',
        developer: apartment.developer || '',
        contactPhone: apartment.contactPhone || '',
        contactTelegram: apartment.contactTelegram || '',
        contactEmail: apartment.contactEmail || '',
        status: apartment.status || 'active'
      });
      
      // Set existing images if available
      if (apartment.images && Array.isArray(apartment.images)) {
        const imagesWithIds = apartment.images.map((img: any, index: number) => ({
          id: img.id || `img-${index}`,
          url: img.url || img,
          order: index
        }));
        setExistingImages(imagesWithIds);
      }
    }
  }, [apartment, form, mode]);

  const createMutation = useMutation({
    mutationFn: (data: any) => apartmentsApi.create(data), // FIXED: apartmentsApi
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seller-apartments'] });
      
      // Upload images if any
      if (newImages.length > 0 && data.id) {
        uploadImages(data.id);
      } else {
        navigate('/dashboard/seller/listings');
        toast.success('Apartment created successfully');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create apartment');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apartmentsApi.update(id, data), // FIXED: apartmentsApi
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['apartment', id] });
      queryClient.invalidateQueries({ queryKey: ['seller-apartments'] });
      
      // Upload new images if any
      if (newImages.length > 0 && id) {
        uploadImages(id);
      } else {
        toast.success('Apartment updated successfully');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update apartment');
    }
  });

  const uploadImages = async (apartmentId: string) => {
    try {
      // Note: You need to implement uploadImages method in your apartmentsApi
      // For now, we'll just show success message
      toast.success('Apartment saved successfully (images would be uploaded here)');
      navigate('/dashboard/seller/listings');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images');
    }
  };

  const handleDeleteImage = (imageId: string) => {
    if (mode === 'edit' && id) {
      // In edit mode, we should call API to delete image
      toast.success('Image would be deleted here');
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  const handleReorderImages = (imageIds: string[]) => {
    // Reorder existing images based on new order
    const reordered = imageIds
      .map(id => existingImages.find(img => img.id === id))
      .filter((img): img is ImageType => img !== undefined);
    
    setExistingImages(reordered);
    
    if (mode === 'edit' && id) {
      // Call API to update image order
      toast.success('Image order would be updated here');
    }
  };

  const onSubmit = (data: ApartmentFormData) => {
    // Basic validation
    const errors = validateApartment(data);
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) => {
        toast.error(`${field}: ${message}`);
      });
      return;
    }

    if (mode === 'create') {
      createMutation.mutate(data);
    } else if (mode === 'edit' && id) {
      updateMutation.mutate({ id, data });
    }
  };

  if (mode === 'edit' && isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">
          {mode === 'create' ? 'Create New Apartment' : 'Edit Apartment'}
        </h2>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information *</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (Uzbek)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={form.watch('title.uz')}
                  onChange={(e) => form.setValue('title.uz', e.target.value)}
                  placeholder="Uzbek title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title (Russian)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={form.watch('title.ru')}
                  onChange={(e) => form.setValue('title.ru', e.target.value)}
                  placeholder="Russian title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title (English)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={form.watch('title.en')}
                  onChange={(e) => form.setValue('title.en', e.target.value)}
                  placeholder="English title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Description</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Uzbek</label>
                  <Textarea
                    value={form.watch('description.uz')}
                    onChange={(e) => form.setValue('description.uz', e.target.value)}
                    placeholder="Uzbek description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Russian</label>
                  <Textarea
                    value={form.watch('description.ru')}
                    onChange={(e) => form.setValue('description.ru', e.target.value)}
                    placeholder="Russian description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">English</label>
                  <Textarea
                    value={form.watch('description.en')}
                    onChange={(e) => form.setValue('description.en', e.target.value)}
                    placeholder="English description"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Price ($) *"
                type="number"
                {...form.register('price', { valueAsNumber: true })}
                min="0"
                required
              />

              <Input
                label="Rooms *"
                type="number"
                {...form.register('rooms', { valueAsNumber: true })}
                min="1"
                required
              />

              <Input
                label="Area (m²) *"
                type="number"
                {...form.register('area', { valueAsNumber: true })}
                min="0"
                step="0.1"
                required
              />

              <Input
                label="Floor *"
                type="number"
                {...form.register('floor', { valueAsNumber: true })}
                min="1"
                required
              />
            </div>

            <Select
              label="Complex (Optional)"
              options={[
                { value: '', label: 'None - Standalone Apartment' },
                ...(complexes?.map(c => ({ value: c.id, label: c.name })) || [])
              ]}
              value={form.watch('complexId')}
              onChange={(value) => form.setValue('complexId', value)}
            />

            <Input
              label="Developer *"
              {...form.register('developer')}
              required
              placeholder="e.g., UzTurizm, Qal'asiz"
            />
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location *</h3>
            
            <Input
              label="Address *"
              {...form.register('address')}
              required
              placeholder="Full address including city, district, street"
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information *</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone *"
                {...form.register('contactPhone')}
                required
                placeholder="+998901234567"
              />

              <Input
                label="Telegram (Optional)"
                {...form.register('contactTelegram')}
                placeholder="@username"
              />

              <Input
                label="Email (Optional)"
                type="email"
                {...form.register('contactEmail')}
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Images</h3>
            <p className="text-sm text-gray-600 mb-2">
              Upload high-quality photos of the apartment (minimum 3 recommended)
            </p>
            <ImageUpload
              existingImages={existingImages}
              newImages={newImages}
              onNewImagesChange={setNewImages}
              onImageDelete={handleDeleteImage}
              onReorder={handleReorderImages}
              maxFiles={20}
            />
          </div>

          {/* Status (for edit mode) */}
          {mode === 'edit' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status</h3>
              <Select
                label="Status"
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'hidden', label: 'Hidden' },
                  { value: 'sold', label: 'Sold' }
                ]}
                value={form.watch('status') || 'active'}
                onChange={(value) => form.setValue('status', value)}
              />
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/seller/listings')}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="min-w-[150px]"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                mode === 'create' ? 'Create Apartment' : 'Update Apartment'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};