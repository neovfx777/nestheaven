import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertCircle, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { useAuthStore } from '../../../stores/authStore';

// Form schema aligned with backend createComplexSchema
const complexSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  latitude: z
    .string()
    .min(1, 'Latitude is required')
    .regex(/^-?\d+(\.\d+)?$/, 'Latitude must be a number'),
  longitude: z
    .string()
    .min(1, 'Longitude is required')
    .regex(/^-?\d+(\.\d+)?$/, 'Longitude must be a number'),
  walkabilityScore: z
    .string()
    .min(1, 'Walkability is required')
    .regex(/^\d+$/, 'Walkability must be 1-10'),
  airQualityScore: z
    .string()
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: 'Air quality must be numeric',
    }),
  airQualityNote: z.string().optional(),
  nearbyInfrastructureText: z
    .string()
    .min(1, 'Nearby infrastructure description is required'),
});

type ComplexFormData = z.infer<typeof complexSchema>;

export function ComplexForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { token } = useAuthStore();

  const [permission1, setPermission1] = useState<File | null>(null);
  const [permission2, setPermission2] = useState<File | null>(null);
  const [permission3, setPermission3] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch complex data for editing
  const { data: complexData } = useQuery({
    queryKey: ['complex', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/complexes/${id}`);
      if (!response.ok) throw new Error('Failed to fetch complex');
      const json = await response.json();
      return json.data;
    },
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplexFormData>({
    resolver: zodResolver(complexSchema),
    defaultValues: {
      title: '',
      description: '',
      address: '',
      city: '',
      latitude: '',
      longitude: '',
      walkabilityScore: '',
      airQualityScore: '',
      airQualityNote: '',
      nearbyInfrastructureText: '',
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
        address,
        city: complexData.city || '',
        latitude: complexData.location?.latitude?.toString() || '',
        longitude: complexData.location?.longitude?.toString() || '',
        walkabilityScore: complexData.walkabilityScore?.toString() || '',
        airQualityScore: complexData.airQualityScore?.toString() || '',
        airQualityNote: complexData.airQualityNote || '',
        nearbyInfrastructureText: complexData.nearbyInfrastructureText || '',
      });
    }
  }, [complexData, reset]);

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

  const mutation = useMutation({
    mutationFn: async (data: ComplexFormData) => {
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!validateFiles()) {
        throw new Error('Missing permission files');
      }

      if (isEdit) {
        // PATCH JSON body
        const payload: any = {
          title: data.title,
          description: data.description,
          address: data.address,
          city: data.city,
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
          walkabilityScore: parseInt(data.walkabilityScore, 10),
          nearbyInfrastructureText: data.nearbyInfrastructureText,
        };
        if (data.airQualityScore) {
          payload.airQualityScore = parseInt(data.airQualityScore, 10);
        }
        if (data.airQualityNote) {
          payload.airQualityNote = data.airQualityNote;
        }

        const response = await fetch(`/api/complexes/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || error.message || 'Failed to update complex');
        }
        return response.json();
      } else {
        // CREATE with FormData + 3 permission files
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('address', data.address);
        formData.append('city', data.city);
        formData.append('latitude', data.latitude);
        formData.append('longitude', data.longitude);
        formData.append('walkabilityScore', data.walkabilityScore);
        if (data.airQualityScore) {
          formData.append('airQualityScore', data.airQualityScore);
        }
        if (data.airQualityNote) {
          formData.append('airQualityNote', data.airQualityNote);
        }
        formData.append('nearbyInfrastructureText', data.nearbyInfrastructureText);

        if (permission1) formData.append('permission_1', permission1);
        if (permission2) formData.append('permission_2', permission2);
        if (permission3) formData.append('permission_3', permission3);

        const response = await fetch('/api/complexes', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || error.message || 'Failed to create complex');
        }
        return response.json();
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
              Address *
            </label>
            <Input
              {...register('address')}
              placeholder="Toshkent, Mirzo Ulug‘bek tumani, ..."
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
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
              <Input {...register('latitude')} placeholder="41.2995" />
              {errors.latitude && (
                <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude *
              </label>
              <Input {...register('longitude')} placeholder="69.2401" />
              {errors.longitude && (
                <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Walkability Score (1–10) *
              </label>
              <Input {...register('walkabilityScore')} placeholder="8" />
              {errors.walkabilityScore && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.walkabilityScore.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Air Quality Score (optional)
              </label>
              <Input {...register('airQualityScore')} placeholder="90" />
              {errors.airQualityScore && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.airQualityScore.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Air Quality Note (optional)
              </label>
              <Input
                {...register('airQualityNote')}
                placeholder="Based on local AQI measurements..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nearby Infrastructure *
            </label>
            <Textarea
              {...register('nearbyInfrastructureText')}
              rows={3}
              placeholder="Shops, markets, metro, schools, parks, etc."
            />
            {errors.nearbyInfrastructureText && (
              <p className="mt-1 text-sm text-red-600">
                {errors.nearbyInfrastructureText.message}
              </p>
            )}
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