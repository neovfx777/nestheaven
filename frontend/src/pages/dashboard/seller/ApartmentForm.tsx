import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apartmentsApi, type Complex as ApiComplex, type RenovationStatus } from '../../../api/apartments';
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
  AlertCircle,
  Calendar
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuthStore } from '../../../stores/authStore';

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
  constructionStatus?: 'available' | 'built';
  readyByYear?: number | null;
  readyByMonth?: number | null;
  renovationStatus?: RenovationStatus | null;
}

interface ImageType {
  id: string;
  url: string;
  order: number;
}

// Basic validation function
const validateApartment = (
  data: ApartmentFormData,
  tr: (value: { uz: string; ru: string; en: string }) => string
) => {
  const errors: Record<string, string> = {};
  
  if (!data.title?.uz && !data.title?.ru && !data.title?.en) {
    errors.title = tr({
      uz: "Sarlavha kamida bitta tilda kiritilishi kerak",
      ru: 'Nazvanie obyazatelno hotya by na odnom yazyke',
      en: 'Title is required in at least one language',
    });
  }
  
  if (!data.price || data.price <= 0) {
    errors.price = tr({
      uz: 'Narx 0 dan katta bo`lishi kerak',
      ru: 'Cena dolzhna byt bolshe 0',
      en: 'Price must be greater than 0',
    });
  }
  
  if (!data.rooms || data.rooms <= 0) {
    errors.rooms = tr({
      uz: 'Xonalar soni 0 dan katta bo`lishi kerak',
      ru: 'Kolichestvo komnat dolzhno byt bolshe 0',
      en: 'Number of rooms must be greater than 0',
    });
  }
  
  if (!data.area || data.area <= 0) {
    errors.area = tr({
      uz: 'Maydon 0 dan katta bo`lishi kerak',
      ru: 'Ploshad dolzhna byt bolshe 0',
      en: 'Area must be greater than 0',
    });
  }
  
  if (!data.floor || data.floor <= 0) {
    errors.floor = tr({
      uz: 'Qavat 0 dan katta bo`lishi kerak',
      ru: 'Etazh dolzhen byt bolshe 0',
      en: 'Floor must be greater than 0',
    });
  }
  
  if (!data.totalFloors || data.totalFloors <= 0) {
    errors.totalFloors = tr({
      uz: 'Jami qavatlar soni 0 dan katta bo`lishi kerak',
      ru: 'Obshchee chislo etazhey dolzhno byt bolshe 0',
      en: 'Total floors must be greater than 0',
    });
  }
  
  if (data.floor > data.totalFloors) {
    errors.floor = tr({
      uz: 'Qavat jami qavatlar sonidan katta bo`lishi mumkin emas',
      ru: 'Etazh ne mozhet byt bolshe obshchego chisla etazhey',
      en: 'Floor cannot be greater than total floors',
    });
  }

  if (data.constructionStatus === 'built') {
    if (data.readyByYear == null || data.readyByYear < 2000) {
      errors.readyByYear = tr({
        uz: 'Iltimos, tayyor bo`lish yilini tanlang',
        ru: 'Pozhaluysta, vyberite god gotovnosti',
        en: 'Please select the year when construction will be ready',
      });
    }
    if (data.readyByMonth == null || data.readyByMonth < 1 || data.readyByMonth > 12) {
      errors.readyByMonth = tr({
        uz: 'Iltimos, tayyor bo`lish oyini tanlang',
        ru: 'Pozhaluysta, vyberite mesyats gotovnosti',
        en: 'Please select the month when construction will be ready',
      });
    }
  }
  
  if (!data.address?.trim()) {
    errors.address = tr({
      uz: 'Manzil majburiy',
      ru: 'Adres obyazatelen',
      en: 'Address is required',
    });
  }
  
  if (!data.contactPhone?.trim()) {
    errors.contactPhone = tr({
      uz: 'Telefon raqami majburiy',
      ru: 'Nomer telefona obyazatelen',
      en: 'Phone number is required',
    });
  }
  
  if (!data.developer?.trim()) {
    errors.developer = tr({
      uz: 'Developer nomi majburiy',
      ru: 'Nazvanie zastroishchika obyazatelno',
      en: 'Developer name is required',
    });
  }
  
  return errors;
};

export const ApartmentForm: React.FC<{ mode: 'create' | 'edit' }> = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, language } = useTranslation();
  const { user } = useAuthStore();
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ImageType[]>([]);
  const [activeSection, setActiveSection] = useState<'basic' | 'details' | 'media' | 'contact'>('basic');
  const envDefaultContactPhone = (import.meta.env.VITE_DEFAULT_CONTACT_PHONE || '').trim();
  const envDefaultContactTelegram = (import.meta.env.VITE_DEFAULT_CONTACT_TELEGRAM || '').trim();
  const envDefaultContactEmail = (import.meta.env.VITE_DEFAULT_CONTACT_EMAIL || '').trim();
  const userPhone = typeof (user as any)?.phone === 'string' ? (user as any).phone.trim() : '';
  const userEmail = typeof user?.email === 'string' ? user.email.trim() : '';
  const returnPath =
    user?.role === 'SELLER' || user?.role === 'OWNER_ADMIN'
      ? '/dashboard/seller/listings'
      : '/dashboard/admin';
  
  const { data: complexes = [] } = useQuery<ApiComplex[]>({
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
      status: 'active',
      constructionStatus: 'available',
      readyByYear: null,
      readyByMonth: null,
      renovationStatus: 'qora_suvoq',
    }
  });

  useEffect(() => {
    if (mode !== 'create') return;

    const currentValues = form.getValues();
    if (!currentValues.contactPhone) {
      form.setValue('contactPhone', userPhone || envDefaultContactPhone);
    }
    if (!currentValues.contactTelegram && envDefaultContactTelegram) {
      form.setValue('contactTelegram', envDefaultContactTelegram);
    }
    if (!currentValues.contactEmail) {
      form.setValue('contactEmail', userEmail || envDefaultContactEmail);
    }
  }, [
    mode,
    form,
    userPhone,
    userEmail,
    envDefaultContactPhone,
    envDefaultContactTelegram,
    envDefaultContactEmail,
  ]);

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
        status: apartment.status || 'active',
        constructionStatus: apartment.constructionStatus === 'built' ? 'built' : 'available',
        readyByYear: apartment.readyByYear ?? null,
        readyByMonth: apartment.readyByMonth ?? null,
        renovationStatus: apartment.renovationStatus || 'qora_suvoq',
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
        navigate(returnPath);
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
      await apartmentsApi.uploadImages(apartmentId, newImages);
      setNewImages([]);
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId] });
      queryClient.invalidateQueries({ queryKey: ['seller-apartments'] });
      toast.success(mode === 'create' ? t('messages.apartmentCreated') : t('messages.apartmentUpdated'));

      if (mode === 'create') {
        navigate(returnPath);
      }
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
    const errors = validateApartment(data, tr);
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

  const tr = (value: { uz: string; ru: string; en: string }) => value[language] || value.en;

  const uiText = {
    mediaImages: { uz: 'Media va rasmlar', ru: 'Media i foto', en: 'Media & Images' },
    fillDetails: {
      uz: "Quyidagi maydonlarni to'ldiring. * belgili maydonlar majburiy.",
      ru: 'Zapolnite polya nizhe. Polya so znakom * obyazatelny.',
      en: 'Fill in the details below. Fields marked with * are required.',
    },
    progress: { uz: 'Progress', ru: 'Progress', en: 'Progress' },
    languageContent: { uz: 'Til kontenti', ru: 'Yazykovoy kontent', en: 'Language Content' },
    requiredFields: { uz: 'Majburiy maydonlar', ru: 'Obyazatelnye polya', en: 'Required Fields' },
    tip: { uz: 'Maslahat:', ru: 'Sovet:', en: 'Tip:' },
    completeAllLanguages: {
      uz: "Ko'proq qamrov uchun barcha til versiyalarini to'ldiring",
      ru: 'Zapolnite vse yazyki dlya bolshego ohvata',
      en: 'Complete all language versions for better reach',
    },
    multiLanguageTitle: { uz: "Ko'p tilli kontent", ru: 'Mnogoyazychnyy kontent', en: 'Multi-Language Content' },
    multiLanguageDescription: {
      uz: "Sarlavha va tavsifni o'zbek, rus va ingliz tillarida kiriting",
      ru: 'Vvedite nazvanie i opisanie na uzbekskom, russkom i angliyskom',
      en: 'Enter title and description in Uzbek, Russian, and English',
    },
    nextTechnical: { uz: 'Keyingi: Texnik tafsilotlar', ru: 'Dalee: Tehnicheskie dannye', en: 'Next: Technical Details' },
    backLanguageContent: { uz: 'Orqaga: Til kontenti', ru: 'Nazad: Yazykovoy kontent', en: 'Back: Language Content' },
    nextMedia: { uz: 'Keyingi: Media va rasmlar', ru: 'Dalee: Media i foto', en: 'Next: Media & Images' },
    backTechnical: { uz: 'Orqaga: Texnik tafsilotlar', ru: 'Nazad: Tehnicheskie dannye', en: 'Back: Technical Details' },
    nextContact: { uz: "Keyingi: Aloqa ma'lumotlari", ru: 'Dalee: Kontaktnaya informatsiya', en: 'Next: Contact Info' },
    backMedia: { uz: 'Orqaga: Media va rasmlar', ru: 'Nazad: Media i foto', en: 'Back: Media & Images' },
    universalDetails: {
      uz: 'Barcha tillarda bir xil bo`ladigan umumiy xususiyatlar',
      ru: 'Universalnye svoystva, odinakovie vo vseh yazykah',
      en: 'Universal properties that are the same in all languages',
    },
    priceLabel: { uz: 'Narx ($) *', ru: 'Cena ($) *', en: 'Price ($) *' },
    roomsLabel: { uz: 'Xonalar *', ru: 'Komnaty *', en: 'Rooms *' },
    areaLabel: { uz: 'Maydon (m2) *', ru: 'Ploshad (m2) *', en: 'Area (m2) *' },
    floorLabel: { uz: 'Qavat *', ru: 'Etazh *', en: 'Floor *' },
    totalFloorsLabel: { uz: 'Binodagi jami qavatlar *', ru: 'Vsego etazhey v zdanii *', en: 'Total Floors in Building *' },
    complexLabel: { uz: 'Kompleks *', ru: 'Kompleks *', en: 'Complex *' },
    selectComplex: { uz: 'Kompleksni tanlang', ru: 'Vyberite kompleks', en: 'Select Complex' },
    constructionStatus: { uz: 'Qurilish holati', ru: 'Status stroitelstva', en: 'Construction status' },
    renovationStatus: { uz: 'Remont holati', ru: 'Sostoyaniye remonta', en: 'Renovation status' },
    availableNow: { uz: 'Hozir mavjud', ru: 'Dostupno seychas', en: 'Available now' },
    builtReadyByDate: { uz: 'Topshirish sanasi bilan', ru: 'S datoy gotovnosti', en: 'Built - ready by date' },
    renovationBlack: { uz: 'Qora suvoq', ru: 'Chyornaya shtukaturka', en: 'Black plaster' },
    renovationWhite: { uz: 'Oq suvoq', ru: 'Belaya shtukaturka', en: 'White plaster' },
    renovationFull: { uz: "To'liq remont qilingan", ru: 'Polnostyu s remontom', en: 'Fully renovated' },
    readyBy: { uz: 'Tayyor bo`lish sanasi (yil va oy)', ru: 'Data gotovnosti (god i mesyats)', en: 'Ready by (year and month)' },
    year: { uz: 'Yil', ru: 'God', en: 'Year' },
    month: { uz: 'Oy', ru: 'Mesyats', en: 'Month' },
    developerLabel: { uz: 'Developer / Quruvchi kompaniya *', ru: 'Developer / Zastroishik *', en: 'Developer / Construction Company *' },
    developerPlaceholder: { uz: 'masalan: UzTurizm, Qalasiz', ru: 'naprimer: UzTurizm, Qalasiz', en: 'e.g., UzTurizm, Qalasiz' },
    fullAddressLabel: { uz: "To'liq manzil *", ru: 'Polnyy adres *', en: 'Full Address *' },
    fullAddressPlaceholder: {
      uz: "Tuman, ko`cha va uy raqami bilan to'liq manzil",
      ru: 'Polnyy adres: rayon, ulitsa i nomer doma',
      en: 'Full address including district, street, and building number',
    },
    mediaUploadDescription: {
      uz: 'Kvartiraning sifatli rasmlarini yuklang',
      ru: 'Zagruzite kachestvennye fotografii kvartiry',
      en: 'Upload high-quality photos of the apartment',
    },
    mediaUploadTip: {
      uz: "Kamida 3 ta sifatli rasm yuklang. Tavsiya: tashqi ko`rinish, mehmonxona, oshxona, yotoqxona, hammom.",
      ru: 'Zagruzite minimum 3 kachestvennye foto. Rekomenduetsya: fasad, gostinaya, kuhnya, spalni, vannaya.',
      en: 'Upload at least 3 high-quality photos. Recommended: exterior, living room, kitchen, bedrooms, bathroom.',
    },
    contactDescription: {
      uz: "Xaridorlar siz bilan qanday bog'lanishi mumkin",
      ru: 'Kak potencialnye pokupateli mogut s vami svyazatsya',
      en: 'How potential buyers can contact you',
    },
    phoneNumberLabel: { uz: 'Telefon raqami *', ru: 'Nomer telefona *', en: 'Phone Number *' },
    telegramLabel: { uz: 'Telegram username', ru: 'Telegram username', en: 'Telegram Username' },
    emailLabel: { uz: 'Email manzil', ru: 'Email adres', en: 'Email Address' },
    locationReferenceLabel: { uz: 'Joylashuv orientiri', ru: 'Orientir lokatsii', en: 'Location Reference' },
    autosaveNote: {
      uz: "Barcha o'zgarishlar avtomatik saqlanadi",
      ru: 'Vse izmeneniya sohranyayutsya avtomaticheski',
      en: 'All changes are saved automatically',
    },
    saving: { uz: 'Saqlanmoqda...', ru: 'Sohranenie...', en: 'Saving...' },
  } as const;

  const monthOptionsByLanguage: Record<'uz' | 'ru' | 'en', Array<{ value: string; label: string }>> = {
    uz: [
      { value: '1', label: 'Yanvar' }, { value: '2', label: 'Fevral' },
      { value: '3', label: 'Mart' }, { value: '4', label: 'Aprel' },
      { value: '5', label: 'May' }, { value: '6', label: 'Iyun' },
      { value: '7', label: 'Iyul' }, { value: '8', label: 'Avgust' },
      { value: '9', label: 'Sentabr' }, { value: '10', label: 'Oktabr' },
      { value: '11', label: 'Noyabr' }, { value: '12', label: 'Dekabr' },
    ],
    ru: [
      { value: '1', label: 'Yanvar' }, { value: '2', label: 'Fevral' },
      { value: '3', label: 'Mart' }, { value: '4', label: 'Aprel' },
      { value: '5', label: 'May' }, { value: '6', label: 'Iyun' },
      { value: '7', label: 'Iyul' }, { value: '8', label: 'Avgust' },
      { value: '9', label: 'Sentyabr' }, { value: '10', label: 'Oktyabr' },
      { value: '11', label: 'Noyabr' }, { value: '12', label: 'Dekabr' },
    ],
    en: [
      { value: '1', label: 'January' }, { value: '2', label: 'February' },
      { value: '3', label: 'March' }, { value: '4', label: 'April' },
      { value: '5', label: 'May' }, { value: '6', label: 'June' },
      { value: '7', label: 'July' }, { value: '8', label: 'August' },
      { value: '9', label: 'September' }, { value: '10', label: 'October' },
      { value: '11', label: 'November' }, { value: '12', label: 'December' },
    ],
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
    { id: 'media', label: tr(uiText.mediaImages), icon: <Building2 className="h-5 w-5" /> },
    { id: 'contact', label: t('form.contactInfo'), icon: <Phone className="h-5 w-5" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? t('form.createNewListing') : t('form.editListing')}
        </h1>
        <p className="text-gray-600 mt-2">
          {tr(uiText.fillDetails)}
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
              <h4 className="text-sm font-medium text-gray-900 mb-3">{tr(uiText.progress)}</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{tr(uiText.languageContent)}</span>
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
                    <span>{tr(uiText.requiredFields)}</span>
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
                  <div className="font-medium">{tr(uiText.tip)}</div>
                  <div>{tr(uiText.completeAllLanguages)}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Form Content */}
        <div className="flex-1">
          <Card className="p-6">
            <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Section 1: Language Content */}
              <div className={`${activeSection === 'basic' ? 'block' : 'hidden'}`}>
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Globe className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{tr(uiText.multiLanguageTitle)}</h3>
                      <p className="text-gray-600">
                        {tr(uiText.multiLanguageDescription)}
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
                      ru: 'Kvartira haqida batafsil ma\'lumot...',
                      en: 'Detailed information about the apartment...'
                    }}
                    titlePlaceholder={{
                      uz: 'Misol: Yangi uy, Chilonzor tumani',
                      ru: 'Primer: Novaya kvartira, Chilanzarskiy rayon',
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
                    <span>{tr(uiText.nextTechnical)}</span>
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
                        {tr(uiText.universalDetails)}
                      </p>
                    </div>
                  </div>

                  {/* Price and Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div>
                      <Input
                        label={tr(uiText.priceLabel)}
                        type="number"
                        {...form.register('price', { valueAsNumber: true })}
                        min="0"
                        required
                        placeholder="e.g., 150000"
                      />
                    </div>

                    <div>
                      <Input
                        label={tr(uiText.roomsLabel)}
                        type="number"
                        {...form.register('rooms', { valueAsNumber: true })}
                        min="1"
                        required
                        placeholder="e.g., 3"
                      />
                    </div>

                    <div>
                      <Input
                        label={tr(uiText.areaLabel)}
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
                        label={tr(uiText.floorLabel)}
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
                      label={tr(uiText.totalFloorsLabel)}
                      type="number"
                      {...form.register('totalFloors', { valueAsNumber: true })}
                      min="1"
                      required
                      placeholder="e.g., 9"
                    />

                    <Select
                      label={tr(uiText.complexLabel)}
                      name="complexId"
                      options={[
                        { value: '', label: `${tr(uiText.selectComplex)}...` },
                        ...(complexes?.map(c => {
                          const name = typeof c.name === 'string' 
                            ? c.name 
                            : c.name?.[language] || c.name?.en || c.name?.uz || c.name?.ru || 'Complex';
                          return { value: c.id, label: name };
                        }) || [])
                      ]}
                      value={form.watch('complexId')}
                      onChange={(value) => form.setValue('complexId', value)}
                      required
                    />

                    <Select
                      label={tr(uiText.constructionStatus)}
                      options={[
                        { value: 'available', label: tr(uiText.availableNow) },
                        { value: 'built', label: tr(uiText.builtReadyByDate) },
                      ]}
                      value={form.watch('constructionStatus') || 'available'}
                      onChange={(value) => {
                        form.setValue('constructionStatus', value as 'available' | 'built');
                        if (value !== 'built') {
                          form.setValue('readyByYear', null);
                          form.setValue('readyByMonth', null);
                        }
                      }}
                    />

                    <Select
                      label={tr(uiText.renovationStatus)}
                      options={[
                        { value: 'qora_suvoq', label: tr(uiText.renovationBlack) },
                        { value: 'oq_suvoq', label: tr(uiText.renovationWhite) },
                        { value: 'toliq_remont_qilingan', label: tr(uiText.renovationFull) },
                      ]}
                      value={form.watch('renovationStatus') || 'qora_suvoq'}
                      onChange={(value) => form.setValue('renovationStatus', value as RenovationStatus)}
                    />

                    {form.watch('constructionStatus') === 'built' && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-sm font-medium text-gray-700 mb-2 col-span-2">
                          {tr(uiText.readyBy)}
                        </div>
                        <Select
                          label={tr(uiText.year)}
                          options={(() => {
                            const currentYear = new Date().getFullYear();
                            return Array.from({ length: 8 }, (_, i) => currentYear + i).map((y) => ({
                              value: String(y),
                              label: String(y),
                            }));
                          })()}
                          value={form.watch('readyByYear') != null ? String(form.watch('readyByYear')) : ''}
                          onChange={(value) => form.setValue('readyByYear', value ? parseInt(value, 10) : null)}
                        />
                        <Select
                          label={tr(uiText.month)}
                          options={monthOptionsByLanguage[language]}
                          value={form.watch('readyByMonth') != null ? String(form.watch('readyByMonth')) : ''}
                          onChange={(value) => form.setValue('readyByMonth', value ? parseInt(value, 10) : null)}
                        />
                      </div>
                    )}
                    
                    {/* Show inherited data when complex is selected */}
                    {form.watch('complexId') && (
                      <div className="col-span-full mt-4">
                        <InheritedComplexData complexId={form.watch('complexId')} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <Input
                      label={tr(uiText.developerLabel)}
                      {...form.register('developer')}
                      required
                      placeholder={tr(uiText.developerPlaceholder)}
                    />

                    <Textarea
                      label={tr(uiText.fullAddressLabel)}
                      {...form.register('address')}
                      required
                      rows={2}
                      placeholder={tr(uiText.fullAddressPlaceholder)}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection('basic')}
                  >
                    {tr(uiText.backLanguageContent)}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection('media')}
                    className="flex items-center space-x-2"
                  >
                    <span>{tr(uiText.nextMedia)}</span>
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
                      <h3 className="text-xl font-semibold text-gray-900">{tr(uiText.mediaImages)}</h3>
                      <p className="text-gray-600">
                        {tr(uiText.mediaUploadDescription)}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-4">
                      {tr(uiText.mediaUploadTip)}
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
                    {tr(uiText.backTechnical)}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection('contact')}
                    className="flex items-center space-x-2"
                  >
                    <span>{tr(uiText.nextContact)}</span>
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
                        {tr(uiText.contactDescription)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label={tr(uiText.phoneNumberLabel)}
                      {...form.register('contactPhone')}
                      required
                      placeholder="+998 90 123 45 67"
                    />

                    <Input
                      label={tr(uiText.telegramLabel)}
                      {...form.register('contactTelegram')}
                      placeholder="@username"
                    />

                    <Input
                      label={tr(uiText.emailLabel)}
                      type="email"
                      {...form.register('contactEmail')}
                      placeholder="email@example.com"
                    />

                    <Input
                      label={tr(uiText.locationReferenceLabel)}
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
                    {tr(uiText.backMedia)}
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
                      onClick={() => navigate(returnPath)}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600 hidden md:block">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{tr(uiText.autosaveNote)}</span>
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
                          {tr(uiText.saving)}
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
