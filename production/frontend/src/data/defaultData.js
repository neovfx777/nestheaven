// Default data for complexes and apartments
// This file will be used by backend later, so keep it in a format that can be easily imported

export const defaultComplexData = {
  name: {
    uz: "NestHeaven Premium Complex",
    ru: "NestHeaven Premium Complex",
    en: "NestHeaven Premium Complex"
  },
  address: {
    uz: "Toshkent, O'zbekiston",
    ru: "Ташкент, Узбекистан",
    en: "Tashkent, Uzbekistan"
  },
  city: "Tashkent",
  developerName: "NestHeaven Development",
  totalApartments: 150,
  completionDate: "2025-12-31",
  features: [
    "24/7 Security",
    "Parking Space",
    "Elevator",
    "Modern Infrastructure",
    "Near Schools & Hospitals",
    "Shopping Centers Nearby"
  ],
  coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
  images: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop"
  ],
  location: {
    latitude: 41.2995,
    longitude: 69.2401
  },
  investmentGrowthPercent: 15,
  airQualityIndex: 85,
  airQualitySource: "Local Environmental Agency"
};

export const defaultApartmentsData = [
  {
    id: "apt-001",
    title: {
      uz: "2 xonali zamonaviy kvartira",
      ru: "2-комнатная современная квартира",
      en: "2-room modern apartment"
    },
    description: {
      uz: "Yangi qurilgan, zamonaviy dizayn, barcha qulayliklar bilan jihozlangan.",
      ru: "Новостройка, современный дизайн, со всеми удобствами.",
      en: "Newly built, modern design, fully equipped with all amenities."
    },
    price: 85000,
    rooms: 2,
    area: 65,
    floor: 5,
    totalFloors: 12,
    status: "active",
    complexId: "complex-001",
    sellerId: "seller-001",
    isFeatured: true,
    isRecommended: false,
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        order: 0
      },
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        order: 1
      },
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        order: 2
      }
    ],
    materials: {
      uz: "Zamonaviy materiallar, sifatli qurilish",
      ru: "Современные материалы, качественное строительство",
      en: "Modern materials, quality construction"
    },
    infrastructureNote: {
      uz: "Barcha infratuzilma yaqinida: maktab, kasalxona, supermarket",
      ru: "Вся инфраструктура рядом: школа, больница, супермаркет",
      en: "All infrastructure nearby: school, hospital, supermarket"
    },
    contactPhone: "+998901234567",
    contactTelegram: "@nestheaven",
    contactWhatsapp: "+998901234567",
    contactEmail: "info@nestheaven.uz"
  },
  {
    id: "apt-002",
    title: {
      uz: "3 xonali keng kvartira",
      ru: "3-комнатная просторная квартира",
      en: "3-room spacious apartment"
    },
    description: {
      uz: "Keng xonalar, yorug'lik, shahar ko'rinishi, barcha qulayliklar.",
      ru: "Просторные комнаты, светлые, вид на город, все удобства.",
      en: "Spacious rooms, bright, city view, all amenities."
    },
    price: 120000,
    rooms: 3,
    area: 95,
    floor: 8,
    totalFloors: 12,
    status: "active",
    complexId: "complex-001",
    sellerId: "seller-001",
    isFeatured: true,
    isRecommended: true,
    coverImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        order: 0
      },
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        order: 1
      },
      {
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        order: 2
      }
    ],
    materials: {
      uz: "Premium materiallar, yevropada ishlab chiqarilgan",
      ru: "Премиум материалы, произведенные в Европе",
      en: "Premium materials, European made"
    },
    infrastructureNote: {
      uz: "Markazda, barcha transport turlari yaqinida",
      ru: "В центре, рядом все виды транспорта",
      en: "City center, all transport nearby"
    },
    contactPhone: "+998901234567",
    contactTelegram: "@nestheaven",
    contactWhatsapp: "+998901234567",
    contactEmail: "info@nestheaven.uz"
  },
  {
    id: "apt-003",
    title: {
      uz: "4 xonali premium kvartira",
      ru: "4-комнатная премиум квартира",
      en: "4-room premium apartment"
    },
    description: {
      uz: "Premium dizayn, keng terassa, shahar panoramasi, barcha zamonaviy qulayliklar.",
      ru: "Премиум дизайн, просторная терраса, панорама города, все современные удобства.",
      en: "Premium design, spacious terrace, city panorama, all modern amenities."
    },
    price: 180000,
    rooms: 4,
    area: 140,
    floor: 12,
    totalFloors: 12,
    status: "active",
    complexId: "complex-001",
    sellerId: "seller-001",
    isFeatured: false,
    isRecommended: true,
    coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        order: 0
      },
      {
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        order: 1
      },
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        order: 2
      }
    ],
    materials: {
      uz: "Lyuks materiallar, import qilingan jihozlar",
      ru: "Роскошные материалы, импортная мебель",
      en: "Luxury materials, imported furniture"
    },
    infrastructureNote: {
      uz: "Eng yaxshi hudud, barcha imkoniyatlar mavjud",
      ru: "Лучший район, все возможности доступны",
      en: "Best area, all amenities available"
    },
    contactPhone: "+998901234567",
    contactTelegram: "@nestheaven",
    contactWhatsapp: "+998901234567",
    contactEmail: "info@nestheaven.uz"
  },
  {
    id: "apt-004",
    title: {
      uz: "1 xonali studio kvartira",
      ru: "1-комнатная студия",
      en: "1-room studio apartment"
    },
    description: {
      uz: "Zamonaviy studio dizayn, barcha kerakli narsalar bilan jihozlangan.",
      ru: "Современный дизайн студии, со всем необходимым.",
      en: "Modern studio design, equipped with everything you need."
    },
    price: 55000,
    rooms: 1,
    area: 45,
    floor: 3,
    totalFloors: 12,
    status: "active",
    complexId: "complex-001",
    sellerId: "seller-001",
    isFeatured: true,
    isRecommended: false,
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        order: 0
      },
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        order: 1
      }
    ],
    materials: {
      uz: "Zamonaviy studio materiallari",
      ru: "Современные материалы для студии",
      en: "Modern studio materials"
    },
    infrastructureNote: {
      uz: "Yoshlar uchun qulay hudud",
      ru: "Удобный район для молодежи",
      en: "Convenient area for young people"
    },
    contactPhone: "+998901234567",
    contactTelegram: "@nestheaven",
    contactWhatsapp: "+998901234567",
    contactEmail: "info@nestheaven.uz"
  },
  {
    id: "apt-005",
    title: {
      uz: "3 xonali keng kvartira",
      ru: "3-комнатная просторная квартира",
      en: "3-room spacious apartment"
    },
    description: {
      uz: "Yangi qurilgan, keng xonalar, yorug'lik, barcha qulayliklar.",
      ru: "Новостройка, просторные комнаты, светлые, все удобства.",
      en: "Newly built, spacious rooms, bright, all amenities."
    },
    price: 110000,
    rooms: 3,
    area: 88,
    floor: 6,
    totalFloors: 12,
    status: "active",
    complexId: "complex-001",
    sellerId: "seller-001",
    isFeatured: false,
    isRecommended: true,
    coverImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        order: 0
      },
      {
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        order: 1
      }
    ],
    materials: {
      uz: "Sifatli qurilish materiallari",
      ru: "Качественные строительные материалы",
      en: "Quality construction materials"
    },
    infrastructureNote: {
      uz: "Oila uchun qulay hudud",
      ru: "Удобный район для семьи",
      en: "Family-friendly area"
    },
    contactPhone: "+998901234567",
    contactTelegram: "@nestheaven",
    contactWhatsapp: "+998901234567",
    contactEmail: "info@nestheaven.uz"
  },
  {
    id: "apt-006",
    title: {
      uz: "2 xonali zamonaviy kvartira",
      ru: "2-комнатная современная квартира",
      en: "2-room modern apartment"
    },
    description: {
      uz: "Zamonaviy dizayn, barcha qulayliklar, shahar markazida.",
      ru: "Современный дизайн, все удобства, в центре города.",
      en: "Modern design, all amenities, city center."
    },
    price: 90000,
    rooms: 2,
    area: 70,
    floor: 7,
    totalFloors: 12,
    status: "active",
    complexId: "complex-001",
    sellerId: "seller-001",
    isFeatured: true,
    isRecommended: false,
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    images: [
      {
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        order: 0
      },
      {
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        order: 1
      }
    ],
    materials: {
      uz: "Zamonaviy materiallar",
      ru: "Современные материалы",
      en: "Modern materials"
    },
    infrastructureNote: {
      uz: "Markazga yaqin, qulay transport",
      ru: "Близко к центру, удобный транспорт",
      en: "Close to center, convenient transport"
    },
    contactPhone: "+998901234567",
    contactTelegram: "@nestheaven",
    contactWhatsapp: "+998901234567",
    contactEmail: "info@nestheaven.uz"
  }
];

// Export as default for easier backend import later
export default {
  complex: defaultComplexData,
  apartments: defaultApartmentsData
};
