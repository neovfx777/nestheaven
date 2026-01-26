import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Upload, AlertCircle, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';

const complexSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional()
});

type ComplexFormData = z.infer<typeof complexSchema>;

export function ComplexForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadError, setUploadError] = useState('');

  // Fetch complex data for editing
  const { data: complexData } = useQuery({
    queryKey: ['complex', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/complexes/${id}`);
      if (!response.ok) throw new Error('Failed to fetch complex');
      return response.json();
    },
    enabled: isEdit
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ComplexFormData>({
    resolver: zodResolver(complexSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  // Set form data when complexData is loaded
  useEffect(() => {
    if (complexData?.data) {
      reset({
        name: complexData.data.name,
        description: complexData.data.description || ''
      });
      if (complexData.data.image) {
        setImagePreview(`/uploads/${complexData.data.image}`);
      }
    }
  }, [complexData, reset]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setUploadError('');
    setImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: ComplexFormData) => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.description) {
        formData.append('description', data.description);
      }
      if (image) {
        formData.append('image', image);
      }

      const url = isEdit ? `/api/complexes/${id}` : '/api/complexes';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save complex');
      }

      return response.json();
    },
    onSuccess: () => {
      navigate('/dashboard/admin/complexes');
    }
  });

  const onSubmit = async (data: ComplexFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Complex' : 'Create New Complex'}
        </h1>
        <p className="text-gray-600">
          {isEdit 
            ? 'Update the complex information' 
            : 'Add a new residential complex to group apartments'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-lg border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Complex Image
          </label>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm text-gray-600">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Drag & drop or click to upload
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          JPEG, PNG, WebP up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
              {uploadError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {uploadError}
                </p>
              )}
            </div>
            <div className="flex-1">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Image Guidelines
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use high-quality building or complex photos</li>
                  <li>• Recommended size: 1200×800 pixels</li>
                  <li>• Show the full building or complex</li>
                  <li>• Avoid text or logos on images</li>
                  <li>• Use landscape orientation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Complex Name *
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Skyline Tower, Riverside Residences"
              className="w-full"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of the complex..."
              rows={4}
              className="w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              {errors.description ? (
                <span className="text-red-600">{errors.description.message}</span>
              ) : (
                'Optional description for internal reference'
              )}
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/admin/complexes')}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : (isEdit ? 'Update Complex' : 'Create Complex')}
          </Button>
        </div>

        {/* Error Message */}
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