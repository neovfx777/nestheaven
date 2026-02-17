import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { complexSchema, ComplexFormData } from '../../../utils/validation/complexSchema';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Card } from '../../../components/ui/Card';
import { MultiLanguageInput } from '../../../components/ui/MultiLanguageInput';
import { AmenitiesCheckboxGroup } from '../../../components/complexes/AmenitiesCheckboxGroup';
import { NearbyPlacesManager, NearbyPlace } from '../../../components/complexes/NearbyPlacesManager';
import { LocationPicker, MapLocation } from '../../../components/maps/LocationPicker';
import { SellerMultiSelect } from '../../../components/complexes/SellerMultiSelect';
import { toast } from 'react-hot-toast';
import apiClient from '../../../api/client';
import {
  Building2,
  MapPin,
  Upload,
  Save,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export function ComplexFormNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { t } = useTranslation();

  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [permission1, setPermission1] = useState<File | null>(null);
  const [permission2, setPermission2] = useState<File | null>(null);
  const [permission3, setPermission3] = useState<File | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [location, setLocation] = useState<MapLocation>({ lat: 41.3111, lng: 69.2797 });
  const [allowedSellers, setAllowedSellers] = useState<string[]>([]);

  // Fetch complex for editing
  const { data: complexData, isLoading } = useQuery({
    queryKey: ['complex', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get(`/complexes/${id}`);
      return response.data?.data ?? response.data;
    },
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComplexFormData>({
    resolver: zodResolver(complexSchema),
    defaultValues: {
      title: { uz: '', ru: '', en: '' },
      description: { uz: '', ru: '', en: '' },
      developer: '',
      city: '',
      blockCount: 1,
      location: {
        lat: 41.3111,
        lng: 69.2797,
        address: { uz: '', ru: '', en: '' },
      },
    },
  });

  // Populate form on edit
  useEffect(() => {
    if (complexData && isEdit) {
      const title = typeof complexData.title === 'string'
        ? JSON.parse(complexData.title)
        : complexData.title || { uz: '', ru: '', en: '' };
      
      const description = typeof complexData.description === 'string'
        ? JSON.parse(complexData.description)
        : complexData.description || { uz: '', ru: '', en: '' };

      const locationData = typeof complexData.location === 'string'
        ? JSON.parse(complexData.location)
        : complexData.location || {
            lat: complexData.locationLat || 41.3111,
            lng: complexData.locationLng || 69.2797,
            address: typeof complexData.address === 'string'
              ? JSON.parse(complexData.address)
              : complexData.address || { uz: '', ru: '', en: '' },
          };

      const nearby = typeof complexData.nearby === 'string'
        ? JSON.parse(complexData.nearby)
        : complexData.nearby || [];

      const amenitiesData = typeof complexData.amenities === 'string'
        ? JSON.parse(complexData.amenities)
        : complexData.amenities || [];

      const allowedSellersData = typeof complexData.allowedSellers === 'string'
        ? JSON.parse(complexData.allowedSellers)
        : complexData.allowedSellers || [];

      reset({
        title,
        description,
        developer: complexData.developer || '',
        city: complexData.city || '',
        blockCount: complexData.blockCount || 1,
        location: locationData,
      });

      setLocation({ lat: locationData.lat, lng: locationData.lng });
      setNearbyPlaces(nearby);
      setAmenities(amenitiesData);
      setAllowedSellers(allowedSellersData);
    }
  }, [complexData, isEdit, reset]);

  const createMutation = useMutation({
    mutationFn: async (data: ComplexFormData) => {
      const formData = new FormData();

      // Append JSON fields
      formData.append('title', JSON.stringify(data.title));
      formData.append('description', JSON.stringify(data.description));
      formData.append('developer', data.developer);
      formData.append('city', data.city);
      formData.append('blockCount', data.blockCount.toString());
      formData.append('location', JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        address: data.location.address,
      }));

      if (amenities.length > 0) {
        formData.append('amenities', JSON.stringify(amenities));
      }

      if (nearbyPlaces.length > 0) {
        formData.append('nearby', JSON.stringify(nearbyPlaces));
      }

      if (data.walkability !== undefined) {
        formData.append('walkability', data.walkability.toString());
      }

      if (data.airQuality !== undefined) {
        formData.append('airQuality', data.airQuality.toString());
      }

      if (allowedSellers.length > 0) {
        formData.append('allowedSellers', JSON.stringify(allowedSellers));
      }

      // Append files
      if (bannerImage) formData.append('banner', bannerImage);
      if (permission1) formData.append('permission1', permission1);
      if (permission2) formData.append('permission2', permission2);
      if (permission3) formData.append('permission3', permission3);

      const url = isEdit ? `/complexes/${id}` : '/complexes';
      const method = isEdit ? 'patch' : 'post';
      
      const response = await apiClient[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Complex updated successfully' : 'Complex created successfully');
      navigate('/dashboard/admin/complexes');
    },
    onError: (error: any) => {
      console.error('Complex save error:', error);
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.details?.[0]?.message
        || error.message 
        || 'Failed to save complex';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: ComplexFormData) => {
    // Validate required files for create
    if (!isEdit) {
      if (!permission1 || !permission2 || !permission3) {
        toast.error(t('complex.allPermissionsRequired') || 'All three permission files are required');
        return;
      }
    }

    createMutation.mutate(data);
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? t('complex.edit') : t('complex.create')}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Multi-language Title and Description */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Building2 className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold">{t('complex.titleLabel')}</h2>
            </div>
            <MultiLanguageInput
              titleValue={watch('title')}
              descriptionValue={watch('description')}
              onTitleChange={(value) => setValue('title', value)}
              onDescriptionChange={(value) => setValue('description', value)}
              required={true}
            />
          </div>
        </Card>

        {/* Basic Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('common.basicInfo') || 'Basic Information'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('complex.developer')}
                {...register('developer')}
                error={errors.developer?.message}
                required
              />
              <Input
                label={t('complex.city')}
                {...register('city')}
                error={errors.city?.message}
                required
              />
              <Input
                label={t('complex.blockCount')}
                type="number"
                {...register('blockCount', { valueAsNumber: true })}
                error={errors.blockCount?.message}
                required
                min={1}
              />
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold">{t('complex.location')}</h2>
            </div>
            <div className="mb-4">
              <LocationPicker
                value={location}
                onChange={(loc) => {
                  setLocation(loc);
                  setValue('location.lat', loc.lat);
                  setValue('location.lng', loc.lng);
                }}
                heightClassName="h-64"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={`${t('complex.location')} (Uzbek)`}
                {...register('location.address.uz')}
                error={errors.location?.address?.uz?.message}
                required
              />
              <Input
                label={`${t('complex.location')} (Russian)`}
                {...register('location.address.ru')}
                error={errors.location?.address?.ru?.message}
                required
              />
              <Input
                label={`${t('complex.location')} (English)`}
                {...register('location.address.en')}
                error={errors.location?.address?.en?.message}
                required
              />
            </div>
          </div>
        </Card>

        {/* Amenities */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('complex.amenities')}</h2>
            <AmenitiesCheckboxGroup
              selectedAmenities={amenities}
              onChange={setAmenities}
            />
          </div>
        </Card>

        {/* Nearby Places */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('complex.nearbyPlaces')}</h2>
            <NearbyPlacesManager
              places={nearbyPlaces}
              onChange={setNearbyPlaces}
            />
          </div>
        </Card>

        {/* Ratings */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('common.ratings') || 'Ratings'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={`${t('complex.walkability')} (0-10)`}
                type="number"
                {...register('walkability', { valueAsNumber: true })}
                error={errors.walkability?.message}
                min={0}
                max={10}
              />
              <Input
                label={`${t('complex.airQuality')} (0-10)`}
                type="number"
                {...register('airQuality', { valueAsNumber: true })}
                error={errors.airQuality?.message}
                min={0}
                max={10}
              />
            </div>
          </div>
        </Card>

        {/* Banner Image */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('complex.bannerImage')}</h2>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {bannerImage && (
                <span className="text-sm text-gray-600">
                  Selected: {bannerImage.name}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Permissions */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('complex.permissions')}</h2>
            {!isEdit && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  {t('complex.allPermissionsRequired') || 'All three permission files are required for new complexes.'}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('complex.permission1')} {!isEdit && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setPermission1(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('complex.permission2')} {!isEdit && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setPermission2(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('complex.permission3')} {!isEdit && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setPermission3(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Allowed Sellers */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('complex.allowedSellers')}</h2>
            <SellerMultiSelect
              selectedSellerIds={allowedSellers}
              onChange={setAllowedSellers}
            />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{createMutation.isPending ? t('common.loading') : isEdit ? t('common.update') : t('common.create')}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}