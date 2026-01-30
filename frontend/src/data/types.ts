// Type definitions for default data
export interface DefaultComplexData {
  name: {
    uz: string;
    ru: string;
    en: string;
  };
  address?: {
    uz: string;
    ru: string;
    en: string;
  };
  description?: {
    uz: string;
    ru: string;
    en: string;
  };
  city: string;
  developerName?: string;
  totalApartments: number;
  completionDate: string;
  features: string[];
  coverImage: string;
  images: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  investmentGrowthPercent: number;
  airQualityIndex: number;
  airQualitySource: string;
}

export interface DefaultApartmentData {
  id: string;
  title: {
    uz: string;
    ru: string;
    en: string;
  };
  description: {
    uz: string;
    ru: string;
    en: string;
  };
  price: number;
  rooms: number;
  area: number;
  floor: number;
  totalFloors?: number;
  status: 'active' | 'hidden' | 'sold';
  complexId: string;
  sellerId: string;
  isFeatured?: boolean;
  isRecommended?: boolean;
  coverImage: string;
  images: Array<{
    url: string;
    order: number;
  }>;
  materials?: {
    uz: string;
    ru: string;
    en: string;
  };
  infrastructureNote?: {
    uz: string;
    ru: string;
    en: string;
  };
  contactPhone?: string;
  contactTelegram?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  address?: string;
  developerName?: string;
  complex?: any;
}
