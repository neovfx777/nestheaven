import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apartmentApi } from '../../../api/apartments';
import { complexApi } from '../../../api/complexes';
import { apartmentSchema } from '../../../utils/apartmentValidation';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { MultiLanguageInput } from '../../../components/ui/MultiLanguageInput';
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
  latitude: number;
  longitude: number;
  developer: string;
  materials: { uz: string; ru: string; en: string };
  airQualityIndex: number;
  infrastructure: { 
    hasParking: boolean;
    hasGym: boolean;
    hasPool: boolean;
    hasConcierge: boolean;
    note: { uz: string; ru: string; en: string };
  };
  investmentGrowthPercent: number;
  contactPhone: string;
  contactTelegram: string;
  contactEmail: string;
  installmentOptions: Array<{
    bankName: string;
    years: number;
    interest: number;
    downPayment: number;
  }>;
}

export const ApartmentForm: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);

  const { data: complexes } = useQuery({
    queryKey: ['complexes'],
    queryFn: () => complexApi.getAll()
  });

  const { data: apartment, isLoading } = useQuery({
    queryKey: ['apartment', id],
    queryFn: () => apartmentApi.getById(id!),
    enabled: mode === 'edit' && !!id
  });

  const form = useForm<ApartmentFormData>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: {
      title: { uz: '', ru: '', en: '' },
      description: { uz: '', ru: '', en: '' },
      price: 0,
      rooms: 1,
      area: 0,
      floor: 1,
      complexId: '',
      address: '',
      latitude: 0,
      longitude: 0,
      developer: '',
      materials: { uz: '', ru: '', en: '' },
      airQualityIndex: 0,
      infrastructure: {
        hasParking: false,
        hasGym: false,
        hasPool: false,
        hasConcierge: false,
        note: { uz: '', ru: '', en: '' }
      },
      investmentGrowthPercent: 0,
      contactPhone: '',
      contactTelegram: '',
      contactEmail: '',
      installmentOptions: []
    }
  });

  useEffect(() => {
    if (apartment && mode === 'edit') {
      form.reset({
        title: apartment.title || { uz: '', ru: '', en: '' },
        description: apartment.description || { uz: '', ru: '', en: '' },
        price: apartment.price,
        rooms: apartment.rooms,
        area: apartment.area,
        floor: apartment.floor,
        complexId: apartment.complexId || '',
        address: apartment.address || '',
        latitude: apartment.latitude || 0,
        longitude: apartment.longitude || 0,
        developer: apartment.developer || '',
        materials: apartment.materials || { uz: '', ru: '', en: '' },
        airQualityIndex: apartment.airQualityIndex || 0,
        infrastructure: apartment.infrastructure as any,
        investmentGrowthPercent: apartment.investmentGrowthPercent || 0,
        contactPhone: apartment.contactPhone || '',
        contactTelegram: apartment.contactTelegram || '',
        contactEmail: apartment.contactEmail || '',
        installmentOptions: apartment.installmentOptions || []
      });
      setExistingImages(apartment.images || []);
    }
  }, [apartment, form, mode]);

  const createMutation = useMutation({
    mutationFn: (data: any) => apartmentApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seller-apartments'] });
      
      // Upload images if any
      if (images.length > 0) {
        uploadImages(data.id);
      } else {
        navigate('/dashboard/seller/apartments');
        toast.success('Apartment created successfully');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create apartment');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apartmentApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['apartment', id] });
      queryClient.invalidateQueries({ queryKey: ['seller-apartments'] });
      
      // Upload new images if any
      if (images.length > 0) {
        uploadImages(data.id);
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
      await apartmentApi.uploadImages(apartmentId, images);
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId] });
      navigate('/dashboard/seller/apartments');
      toast.success('Apartment saved with images successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload images');
    }
  };

  const onSubmit = (data: ApartmentFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else if (mode === 'edit' && id) {
      updateMutation.mutate({ id, data });
    }
  };

  if (mode === 'edit' && isLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {mode === 'create' ? 'Create New Apartment' : 'Edit Apartment'}
      </h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <MultiLanguageInput
            label="Title"
            languages={['uz', 'ru', 'en']}
            value={form.watch('title')}
            onChange={(value) => form.setValue('title', value)}
            error={form.formState.errors.title?.message}
          />

          <MultiLanguageInput
            label="Description"
            languages={['uz', 'ru', 'en']}
            value={form.watch('description')}
            onChange={(value) => form.setValue('description', value)}
            textarea
            error={form.formState.errors.description?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Price ($)"
              type="number"
              {...form.register('price', { valueAsNumber: true })}
              error={form.formState.errors.price?.message}
            />

            <Input
              label="Rooms"
              type="number"
              {...form.register('rooms', { valueAsNumber: true })}
              error={form.formState.errors.rooms?.message}
            />

            <Input
              label="Area (m²)"
              type="number"
              {...form.register('area', { valueAsNumber: true })}
              error={form.formState.errors.area?.message}
            />

            <Input
              label="Floor"
              type="number"
              {...form.register('floor', { valueAsNumber: true })}
              error={form.formState.errors.floor?.message}
            />
          </div>

          <Controller
            name="complexId"
            control={form.control}
            render={({ field }) => (
              <Select
                label="Complex"
                options={[
                  { value: '', label: 'None' },
                  ...(complexes?.map(c => ({ value: c.id, label: c.name })) || [])
                ]}
                value={field.value}
                onChange={field.onChange}
                error={form.formState.errors.complexId?.message}
              />
            )}
          />

          <Input
            label="Developer"
            {...form.register('developer')}
            error={form.formState.errors.developer?.message}
          />
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location</h3>
          
          <Input
            label="Address"
            {...form.register('address')}
            error={form.formState.errors.address?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              {...form.register('latitude', { valueAsNumber: true })}
              error={form.formState.errors.latitude?.message}
            />

            <Input
              label="Longitude"
              type="number"
              step="any"
              {...form.register('longitude', { valueAsNumber: true })}
              error={form.formState.errors.longitude?.message}
            />
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Images</h3>
          <ImageUpload
            existingImages={existingImages}
            newImages={images}
            onNewImagesChange={setImages}
            onImageDelete={(imageId) => {
              apartmentApi.deleteImage(id!, imageId);
              setExistingImages(prev => prev.filter(img => img.id !== imageId));
            }}
            onReorder={(imageIds) => {
              apartmentApi.reorderImages(id!, imageIds);
            }}
          />
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              {...form.register('contactPhone')}
              error={form.formState.errors.contactPhone?.message}
            />

            <Input
              label="Telegram"
              {...form.register('contactTelegram')}
              error={form.formState.errors.contactTelegram?.message}
            />

            <Input
              label="Email"
              type="email"
              {...form.register('contactEmail')}
              error={form.formState.errors.contactEmail?.message}
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/seller/apartments')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 
             mode === 'create' ? 'Create Apartment' : 'Update Apartment'}
          </Button>
        </div>
      </form>
    </Card>
  );
};