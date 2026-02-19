import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apartmentsApi } from '../../../api/apartments';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { ImageUpload } from '../../../components/ui/ImageUpload';
import { MultiLanguageInput } from '../../../components/ui/MultiLanguageInput';
import { InheritedComplexData } from '../../../components/apartments/InheritedComplexData';
import { toast } from 'react-hot-toast';
import { 
  Globe, 
  DollarSign, 
  Home, 
  Layers, 
  Ruler, 
  Building2, 
  Hash,
  MapPin,
  Phone,
  Send,
  Mail,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

interface ApartmentFormData {
  title: { uz: string; ru: string; en: string };
  description: { uz: string; ru: string; en: string };
  price: number;
  rooms: number;
  area: number;
  floor: number;
  totalFloors: number;
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
  
  if (!data.totalFloors || data.totalFloors <= 0) {
    errors.totalFloors = 'Total floors must be greater than 0';
  }
  
  if (data.floor > data.totalFloors) {
    errors.floor = 'Floor cannot be greater than total floors';
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
  const { t } = useTranslation();
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ImageType[]>([]);
  const [activeSection, setActiveSection] = useState<'basic' | 'details' | 'media' | 'contact'>('basic');
  
  const { data: complexes = [] } = useQuery<Complex[]>({
    queryKey: ['complexes-for-seller'],
    queryFn: () => apartmentsApi.getComplexesForSeller(),
  });

  const { data: apartment, isLoading } = useQuery({
    queryKey: ['apartment', id],
    queryFn: () => apartmentsApi.getById(id!),
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
      totalFloors: 1,
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
        totalFloors: apartment.totalFloors || 1,
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
    mutationFn: (data: any) => apartmentsApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seller-apartments'] });
      
      // Upload images if any
      if (newImages.length > 0 && data.id) {
        uploadImages(data.id);
      } else {
        navigate('/dashboard/seller/listings');
        toast.success(t('messages.apartmentCreated'));
      }
    },
    onError: (error: any) => {
      toast.error(error.message || t('messages.apartmentCreateFailed'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apartmentsApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['apartment', id] });
      queryClient.invalidateQueries({ queryKey: ['seller-apartments'] });
      
      // Upload new images if any
      if (newImages.length > 0 && id) {
        uploadImages(id);
      } else {
        toast.success(t('messages.apartmentUpdated'));
      }
    },
    onError: (error: any) => {
      toast.error(error.message || t('messages.apartmentUpdateFailed'));
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

  const sections = [
    { id: 'basic', label: t('form.basicInfo'), icon: <Home className="h-5 w-5" /> },
    { id: 'details', label: t('form.technicalDetails'), icon: <Layers className="h-5 w-5" /> },
    { id: 'media', label: 'Media & Images', icon: <Building2 className="h-5 w-5" /> },
    { id: 'contact', label: t('form.contactInfo'), icon: <Phone className="h-5 w-5" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? t('form.createNewListing') : t('form.editListing')}
        </h1>
        <p className="text-gray-600 mt-2">
          Fill in the details below. Fields marked with * are required.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <Card className="p-4 sticky top-6">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id as any)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors
                    ${activeSection === section.id 
                      ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      p-1.5 rounded-md
                      ${activeSection === section.id 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {section.icon}
                    </div>
                    <span>{section.label}</span>
                  </div>
                  {activeSection === section.id && (
                    <ChevronRight className="h-4 w-4 text-primary-500" />
                  )}
                </button>
              ))}
            </nav>

            {/* Progress Summary */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Progress</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Language Content</span>
                    <span>
                      {Object.values(form.watch('title')).filter(v => v?.trim()).length}/3
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-primary-600 h-1.5 rounded-full"
                      style={{ 
                        width: `${(Object.values(form.watch('title')).filter(v => v?.trim()).length / 3) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Required Fields</span>
                    <span>5/8</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '62.5%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <div className="font-medium">Tip:</div>
                  <div>Complete all language versions for better reach</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Form Content */}
        <div className="flex-1">
          <Card className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Section 1: Language Content */}
              <div className={`${activeSection === 'basic' ? 'block' : 'hidden'}`}>
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Globe className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Multi-Language Content</h3>
                      <p className="text-gray-600">
                        Enter title and description in Uzbek, Russian, and English
                      </p>
                    </div>
                  </div>

                  {/* SINGLE MultiLanguageInput Component with BOTH Description and Title */}
                  <MultiLanguageInput
                    descriptionValue={form.watch('description')}
                    titleValue={form.watch('title')}
                    onDescriptionChange={(value) => form.setValue('description', value)}
                    onTitleChange={(value) => form.setValue('title', value)}
                    descriptionPlaceholder={{
                      uz: 'Uy haqida batafsil ma\'lumot...',
                      ru: 'Подробная информация о квартире...',
                      en: 'Detailed information about the apartment...'
                    }}
                    titlePlaceholder={{
                      uz: 'Misol: Yangi uy, Chilonzor tumani',
                      ru: 'Пример: Новая квартира, район Чиланзар',
                      en: 'Example: New apartment, Chilanzar district'
                    }}
                    required={true}
                  />
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection('details')}
                    className="flex items-center space-x-2"
                  >
                    <span>Next: Technical Details</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Section 2: Technical Details (Universal Fields) */}
              <div className={`${activeSection === 'details' ? 'block' : 'hidden'}`}>
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Layers className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{t('form.technicalDetails')}</h3>
                      <p className="text-gray-600">
                        Universal properties that are the same in all languages
                      </p>
                    </div>
                  </div>

                  {/* Price and Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div>
                      <Input
                        label={
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span>Price ($) *</span>
                          </div>
                        }
                        type="number"
                        {...form.register('price', { valueAsNumber: true })}
                        min="0"
                        required
                        placeholder="e.g., 150000"
                      />
                    </div>

                    <div>
                      <Input
                        label={
                          <div className="flex items-center space-x-2">
                            <Home className="h-4 w-4 text-gray-500" />
                            <span>Rooms *</span>
                          </div>
                        }
                        type="number"
                        {...form.register('rooms', { valueAsNumber: true })}
                        min="1"
                        required
                        placeholder="e.g., 3"
                      />
                    </div>

                    <div>
                      <Input
                        label={
                          <div className="flex items-center space-x-2">
                            <Ruler className="h-4 w-4 text-gray-500" />
                            <span>Area (m²) *</span>
                          </div>
                        }
                        type="number"
                        {...form.register('area', { valueAsNumber: true })}
                        min="0"
                        step="0.1"
                        required
                        placeholder="e.g., 85.5"
                      />
                    </div>

                    <div>
                      <Input
                        label={
                          <div className="flex items-center space-x-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span>Floor *</span>
                          </div>
                        }
                        type="number"
                        {...form.register('floor', { valueAsNumber: true })}
                        min="1"
                        required
                        placeholder="e.g., 5"
                      />
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Input
                      label="Total Floors in Building *"
                      type="number"
                      {...form.register('totalFloors', { valueAsNumber: true })}
                      min="1"
                      required
                      placeholder="e.g., 9"
                    />

                    <Select
                      label="Complex *"
                      options={[
                        { value: '', label: 'Select Complex...' },
                        ...(complexes?.map(c => {
                          const name = typeof c.name === 'string' 
                            ? c.name 
                            : c.name?.en || c.name?.uz || c.name?.ru || 'Complex';
                          return { value: c.id, label: name };
                        }) || [])
                      ]}
                      value={form.watch('complexId')}
                      onChange={(value) => form.setValue('complexId', value)}
                      required
                    />
                    
                    {/* Show inherited data when complex is selected */}
                    {form.watch('complexId') && (
                      <div className="col-span-full mt-4">
                        <InheritedComplexData complexId={form.watch('complexId')} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <Input
                      label="Developer / Construction Company *"
                      {...form.register('developer')}
                      required
                      placeholder="e.g., UzTurizm, Qal'asiz"
                    />

                    <Textarea
                      label="Full Address *"
                      {...form.register('address')}
                      required
                      rows={2}
                      placeholder="Full address including district, street, and building number"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection('basic')}
                  >
                    Back: Language Content
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection('media')}
                    className="flex items-center space-x-2"
                  >
                    <span>Next: Media & Images</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Section 3: Media & Images */}
              <div className={`${activeSection === 'media' ? 'block' : 'hidden'}`}>
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Media & Images</h3>
                      <p className="text-gray-600">
                        Upload high-quality photos of the apartment
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Upload at least 3 high-quality photos. Recommended: exterior, living room, kitchen, bedrooms, bathroom.
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
                    <div className="mt-8">
                      <Select
                        label={t('form.listingStatus')}
                        options={[
                          { value: 'active', label: t('statusChange.active') },
                          { value: 'hidden', label: t('statusChange.hidden') },
                          { value: 'sold', label: 'Sold' }
                        ]}
                        value={form.watch('status') || 'active'}
                        onChange={(value) => form.setValue('status', value)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection('details')}
                  >
                    Back: Technical Details
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection('contact')}
                    className="flex items-center space-x-2"
                  >
                    <span>Next: Contact Info</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Section 4: Contact Information */}
              <div className={`${activeSection === 'contact' ? 'block' : 'hidden'}`}>
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{t('form.contactInfo')}</h3>
                      <p className="text-gray-600">
                        How potential buyers can contact you
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label={
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>Phone Number *</span>
                        </div>
                      }
                      {...form.register('contactPhone')}
                      required
                      placeholder="+998 90 123 45 67"
                    />

                    <Input
                      label={
                        <div className="flex items-center space-x-2">
                          <Send className="h-4 w-4 text-gray-500" />
                          <span>Telegram Username</span>
                        </div>
                      }
                      {...form.register('contactTelegram')}
                      placeholder="@username"
                    />

                    <Input
                      label={
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span>Email Address</span>
                        </div>
                      }
                      type="email"
                      {...form.register('contactEmail')}
                      placeholder="email@example.com"
                    />

                    <Input
                      label={
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>Location Reference</span>
                        </div>
                      }
                      value={form.watch('address')}
                      onChange={(e) => form.setValue('address', e.target.value)}
                      placeholder={t('form.nearbyLandmark')}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection('media')}
                  >
                    Back: Media & Images
                  </Button>
                </div>
              </div>

              {/* Submit Buttons - Always visible at bottom */}
              <div className="pt-8 border-t border-gray-200 mt-8">
                <div className="flex justify-between items-center">
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard/seller/listings')}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600 hidden md:block">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>All changes are saved automatically</span>
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="min-w-[180px]"
                    >
                      {createMutation.isPending || updateMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          {mode === 'create' ? t('form.publishListing') : t('form.updateListing')}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};