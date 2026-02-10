import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import axios from 'axios';
import { AlertCircle, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import apiClient from '../../../api/client';
import { LocationPicker, MapLocation } from '../../../components/maps/LocationPicker';

// Form schema aligned with backend createComplexSchema
const ratingSchema = z
  .string()
  .min(1, 'Rating is required')
  .regex(/^\d+$/, 'Rating must be 0-10')
  .refine((val) => {
    const num = Number(val);
    return num >= 0 && num <= 10;
  }, 'Rating must be between 0 and 10');

const latitudeSchema = z
  .string()
  .min(1, 'Latitude is required')
  .regex(/^-?\d+(\.\d+)?$/, 'Latitude must be a number')
  .refine((val) => {
    const num = Number(val);
    return num >= -90 && num <= 90;
  }, 'Latitude must be between -90 and 90');

const longitudeSchema = z
  .string()
  .min(1, 'Longitude is required')
  .regex(/^-?\d+(\.\d+)?$/, 'Longitude must be a number')
  .refine((val) => {
    const num = Number(val);
    return num >= -180 && num <= 180;
  }, 'Longitude must be between -180 and 180');

const complexSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  locationText: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  locationLat: latitudeSchema,
  locationLng: longitudeSchema,
  walkabilityRating: ratingSchema,
  airQualityRating: ratingSchema,
  nearbyNote: z.string().optional(),
});

type ComplexFormData = z.infer<typeof complexSchema>;

export function ComplexForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [permission1, setPermission1] = useState<File | null>(null);
  const [permission2, setPermission2] = useState<File | null>(null);
  const [permission3, setPermission3] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [locationRequestError, setLocationRequestError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Fetch complex data for editing
  const { data: complexData } = useQuery({
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
      title: '',
      description: '',
      locationText: '',
      city: '',
      locationLat: '',
      locationLng: '',
      walkabilityRating: '',
      airQualityRating: '',
      nearbyNote: '',
    },
  });

  // Populate form on edit
  useEffect(() => {
    if (complexData) {
      const title =
        typeof complexData.title === 'string'
          ? complexData.title
          : complexData.title?.en || complexData.title?.uz || complexData.title?.ru || '';
      const address =
        typeof complexData.address === 'string'
          ? complexData.address
          : complexData.address?.en || complexData.address?.uz || complexData.address?.ru || '';

      reset({
        title,
        description: complexData.description || '',
        locationText: complexData.locationText || address,
        city: complexData.city || '',
        locationLat:
          complexData.locationLat?.toString() ||
          complexData.latitude?.toString() ||
          complexData.location?.latitude?.toString() ||
          '',
        locationLng:
          complexData.locationLng?.toString() ||
          complexData.longitude?.toString() ||
          complexData.location?.longitude?.toString() ||
          '',
        walkabilityRating:
          complexData.walkabilityRating?.toString() ||
          complexData.walkabilityScore?.toString() ||
          '',
        airQualityRating:
          complexData.airQualityRating?.toString() ||
          complexData.airQualityScore?.toString() ||
          '',
        nearbyNote: complexData.nearbyNote || complexData.nearbyInfrastructure || '',
      });
    }
  }, [complexData, reset]);

  const locationLat = watch('locationLat');
  const locationLng = watch('locationLng');

  const parseCoordinate = (value: string | undefined, fallback: number) => {
    if (value === undefined || value === null) return fallback;
    const trimmed = String(value).trim();
    if (!trimmed) return fallback;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : fallback;
  };

  const storedLocation = useMemo<MapLocation | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem('complexForm:lastLocation');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Number.isFinite(parsed?.lat) || !Number.isFinite(parsed?.lng)) return null;
      return { lat: Number(parsed.lat), lng: Number(parsed.lng) };
    } catch {
      return null;
    }
  }, []);

  const fallbackLocation = storedLocation ?? { lat: 41.3111, lng: 69.2797 };

  const mapLocation: MapLocation = {
    lat: parseCoordinate(locationLat, fallbackLocation.lat),
    lng: parseCoordinate(locationLng, fallbackLocation.lng),
  };

  const handleMapChange = (value: MapLocation) => {
    setValue('locationLat', value.lat.toFixed(6), { shouldValidate: true });
    setValue('locationLng', value.lng.toFixed(6), { shouldValidate: true });
    setLocationRequestError(null);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('complexForm:lastLocation', JSON.stringify(value));
    }
  };

  useEffect(() => {
    if (isEdit) return;
    const latVal = String(locationLat || '').trim();
    const lngVal = String(locationLng || '').trim();
    if (latVal || lngVal) return;

    const initial = storedLocation ?? fallbackLocation;
    setValue('locationLat', initial.lat.toFixed(6), { shouldValidate: true });
    setValue('locationLng', initial.lng.toFixed(6), { shouldValidate: true });
  }, [isEdit, locationLat, locationLng, setValue, storedLocation, fallbackLocation]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationRequestError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationRequestError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        handleMapChange({ lat: latitude, lng: longitude });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err?.code === err.PERMISSION_DENIED) {
          setLocationRequestError('Location permission denied.');
        } else if (err?.code === err.TIMEOUT) {
          setLocationRequestError('Location request timed out. Try again.');
        } else {
          setLocationRequestError('Unable to fetch location. Try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const validateFiles = () => {
    if (isEdit) {
      // For now we don't change permissions on edit
      return true;
    }
    if (!permission1 || !permission2 || !permission3) {
      setUploadError('Please upload all 3 permission files (permission_1, permission_2, permission_3).');
      return false;
    }
    setUploadError(null);
    return true;
  };

  const handleFileChange =
    (setter: React.Dispatch<React.SetStateAction<File | null>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setter(file);
    };

  const extractApiError = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as any;
      const detailMessage = Array.isArray(data?.details)
        ? data.details.map((d: any) => d.message).filter(Boolean).join(', ')
        : null;
      return (
        detailMessage ||
        data?.error ||
        data?.message ||
        error.message ||
        fallback
      );
    }
    if (error instanceof Error) return error.message;
    return fallback;
  };

  const mutation = useMutation({
    mutationFn: async (data: ComplexFormData) => {
      if (!validateFiles()) {
        throw new Error('Missing permission files');
      }

      try {
        if (isEdit) {
          // PATCH JSON body
          const legacyNearby = data.nearbyNote || data.locationText;
          const payload: any = {
            title: data.title,
            description: data.description,
            locationText: data.locationText,
            city: data.city,
            locationLat: parseFloat(data.locationLat),
            locationLng: parseFloat(data.locationLng),
            walkabilityRating: parseInt(data.walkabilityRating, 10),
            airQualityRating: parseInt(data.airQualityRating, 10),
            nearbyNote: data.nearbyNote || undefined,
            // legacy fields for older backend versions
            address: data.locationText,
            latitude: parseFloat(data.locationLat),
            longitude: parseFloat(data.locationLng),
            walkabilityScore: parseInt(data.walkabilityRating, 10),
            airQualityScore: parseInt(data.airQualityRating, 10),
            nearbyInfrastructureText: legacyNearby,
          };

          const response = await apiClient.patch(`/complexes/${id}`, payload);
          return response.data;
        }

        // CREATE with FormData + 3 permission files
        const formData = new FormData();
        const legacyNearby = data.nearbyNote || data.locationText;

        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('locationText', data.locationText);
        formData.append('city', data.city);
        formData.append('locationLat', data.locationLat);
        formData.append('locationLng', data.locationLng);
        formData.append('walkabilityRating', data.walkabilityRating);
        formData.append('airQualityRating', data.airQualityRating);
        if (data.nearbyNote) {
          formData.append('nearbyNote', data.nearbyNote);
        }
        // legacy fields for older backend versions
        formData.append('address', data.locationText);
        formData.append('latitude', data.locationLat);
        formData.append('longitude', data.locationLng);
        formData.append('walkabilityScore', data.walkabilityRating);
        formData.append('airQualityScore', data.airQualityRating);
        formData.append('nearbyInfrastructureText', legacyNearby);

        if (permission1) {
          formData.append('permission_1', permission1);
          formData.append('permission1', permission1);
        }
        if (permission2) {
          formData.append('permission_2', permission2);
          formData.append('permission2', permission2);
        }
        if (permission3) {
          formData.append('permission_3', permission3);
          formData.append('permission3', permission3);
        }

        const response = await apiClient.post('/complexes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      } catch (error) {
        throw new Error(
          extractApiError(
            error,
            isEdit ? 'Failed to update complex' : 'Failed to create complex'
          )
        );
      }
    },
    onSuccess: () => {
      navigate('/dashboard/admin/complexes');
    },
  });

  const onSubmit = (data: ComplexFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Complex' : 'Create New Complex'}
        </h1>
        <p className="text-gray-600">
          {isEdit
            ? 'Update the complex project information'
            : 'Add a new construction project (complex) to group apartments'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Permission Files */}
        {!isEdit && (
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-sm font-medium text-gray-900 mb-2">
              Official Permissions / Certificates (3 files required)
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Upload three official documents (permission_1, permission_2, permission_3). These
              will be stored and later used for trust and verification.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Permission 1
                </label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange(setPermission1)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Permission 2
                </label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange(setPermission2)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Permission 3
                </label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange(setPermission3)} />
              </div>
            </div>
            {uploadError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {uploadError}
              </p>
            )}
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex gap-2">
              <Check className="w-4 h-4 mt-0.5" />
              <span>
                Files are stored securely and linked to the complex. Backend expects exactly three
                files named <code>permission_1</code>, <code>permission_2</code>,{' '}
                <code>permission_3</code>.
              </span>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complex Title *
            </label>
            <Input
              {...register('title')}
              placeholder='e.g., "Sevgi Shaxr"'
              className="w-full"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <Textarea
              {...register('description')}
              rows={4}
              placeholder="Describe the project, developer vision, or general info..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address / Location Text *
            </label>
            <Input
              {...register('locationText')}
              placeholder="Toshkent, Mirzo Ulug?bek tumani, ..."
            />
            {errors.locationText && (
              <p className="mt-1 text-sm text-red-600">{errors.locationText.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pick Location on Map *
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Click on the map to set coordinates or drag the marker.
            </p>
            <div className="flex items-center gap-3 mb-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleUseMyLocation}
                disabled={isLocating}
              >
                {isLocating ? 'Locating...' : 'Use My Location'}
              </Button>
              <span className="text-xs text-gray-500">
                This uses your browser location permission.
              </span>
            </div>
            {locationRequestError && (
              <p className="mb-3 text-sm text-red-600">{locationRequestError}</p>
            )}
            <LocationPicker value={mapLocation} onChange={handleMapChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <Input {...register('city')} placeholder="Tashkent" />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude *
              </label>
              <Input {...register('locationLat')} placeholder="41.2995" type="number" step="0.000001" />
              {errors.locationLat && (
                <p className="mt-1 text-sm text-red-600">{errors.locationLat.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude *
              </label>
              <Input {...register('locationLng')} placeholder="69.2401" type="number" step="0.000001" />
              {errors.locationLng && (
                <p className="mt-1 text-sm text-red-600">{errors.locationLng.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Walkability Rating (0?10) *
              </label>
              <Input {...register('walkabilityRating')} placeholder="8" type="number" min={0} max={10} step={1} />
              {errors.walkabilityRating && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.walkabilityRating.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Air Quality Rating (0?10) *
              </label>
              <Input {...register('airQualityRating')} placeholder="7" type="number" min={0} max={10} step={1} />
              {errors.airQualityRating && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.airQualityRating.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nearby Places Note (optional)
            </label>
            <Textarea
              {...register('nearbyNote')}
              rows={3}
              placeholder="Shops, markets, metro, schools, parks, etc."
            />
          </div>
        </div>

        {/* Actions & Errors */}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/admin/complexes')}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? 'Saving...'
              : isEdit
              ? 'Update Complex'
              : 'Create Complex'}
          </Button>
        </div>

        {mutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error:</span>
              <span>{(mutation.error as Error).message}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
