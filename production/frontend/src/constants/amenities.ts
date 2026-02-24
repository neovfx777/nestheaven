export interface Amenity {
  id: string;
  label: {
    uz: string;
    ru: string;
    en: string;
  };
  category: string;
  icon?: string;
}

export interface AmenityCategory {
  id: string;
  label: {
    uz: string;
    ru: string;
    en: string;
  };
  amenities: Amenity[];
}

export const AMENITY_CATEGORIES: AmenityCategory[] = [
  {
    id: 'swimming',
    label: { uz: 'Suzish va suv', ru: 'Плавание и вода', en: 'Swimming & Water' },
    amenities: [
      { id: 'pool', label: { uz: 'Basseyn', ru: 'Бассейн', en: 'Swimming Pool' }, category: 'swimming' },
      { id: 'kidsPool', label: { uz: 'Bolalar basseyni', ru: 'Детский бассейн', en: 'Kids Pool' }, category: 'swimming' },
      { id: 'jacuzzi', label: { uz: 'Jakuzzi', ru: 'Джакузи', en: 'Jacuzzi' }, category: 'swimming' },
    ],
  },
  {
    id: 'fitness',
    label: { uz: 'Fitnes va sport', ru: 'Фитнес и спорт', en: 'Fitness & Sports' },
    amenities: [
      { id: 'gym', label: { uz: 'Fitnes zal', ru: 'Фитнес зал', en: 'Gym' }, category: 'fitness' },
      { id: 'fitnessRoom', label: { uz: 'Fitnes xonasi', ru: 'Фитнес комната', en: 'Fitness Room' }, category: 'fitness' },
      { id: 'tennisCourt', label: { uz: 'Tennis korti', ru: 'Теннисный корт', en: 'Tennis Court' }, category: 'fitness' },
      { id: 'basketballCourt', label: { uz: 'Basketbol maydoni', ru: 'Баскетбольная площадка', en: 'Basketball Court' }, category: 'fitness' },
      { id: 'footballField', label: { uz: 'Futbol maydoni', ru: 'Футбольное поле', en: 'Football Field' }, category: 'fitness' },
      { id: 'runningTrack', label: { uz: 'Yugurish yo\'li', ru: 'Беговая дорожка', en: 'Running Track' }, category: 'fitness' },
    ],
  },
  {
    id: 'outdoor',
    label: { uz: 'Ochiq havo', ru: 'На открытом воздухе', en: 'Outdoor' },
    amenities: [
      { id: 'park', label: { uz: 'Park', ru: 'Парк', en: 'Park' }, category: 'outdoor' },
      { id: 'playground', label: { uz: 'Bolalar maydonchasi', ru: 'Детская площадка', en: 'Playground' }, category: 'outdoor' },
      { id: 'bbqArea', label: { uz: 'Mangal maydoni', ru: 'Зона барбекю', en: 'BBQ Area' }, category: 'outdoor' },
      { id: 'picnicArea', label: { uz: 'Piknik maydoni', ru: 'Зона для пикника', en: 'Picnic Area' }, category: 'outdoor' },
      { id: 'roofTerrace', label: { uz: 'Tom terrasa', ru: 'Крытая терраса', en: 'Roof Terrace' }, category: 'outdoor' },
      { id: 'communityGarden', label: { uz: 'Jamoat bog\'i', ru: 'Общественный сад', en: 'Community Garden' }, category: 'outdoor' },
    ],
  },
  {
    id: 'parking',
    label: { uz: 'Avtoturargoh', ru: 'Парковка', en: 'Parking' },
    amenities: [
      { id: 'parking', label: { uz: 'Avtoturargoh', ru: 'Парковка', en: 'Parking' }, category: 'parking' },
      { id: 'undergroundParking', label: { uz: 'Er osti avtoturargoh', ru: 'Подземная парковка', en: 'Underground Parking' }, category: 'parking' },
      { id: 'evCharging', label: { uz: 'Elektromobil zaryadlash', ru: 'Зарядка электромобилей', en: 'EV Charging' }, category: 'parking' },
      { id: 'bikeStorage', label: { uz: 'Velosiped saqlash', ru: 'Хранение велосипедов', en: 'Bike Storage' }, category: 'parking' },
    ],
  },
  {
    id: 'wellness',
    label: { uz: 'Salomatlik', ru: 'Здоровье', en: 'Wellness' },
    amenities: [
      { id: 'spa', label: { uz: 'SPA', ru: 'СПА', en: 'SPA' }, category: 'wellness' },
      { id: 'sauna', label: { uz: 'Sauna', ru: 'Сауна', en: 'Sauna' }, category: 'wellness' },
      { id: 'steamRoom', label: { uz: 'Bug\' xonasi', ru: 'Парная', en: 'Steam Room' }, category: 'wellness' },
      { id: 'massageRoom', label: { uz: 'Massaj xonasi', ru: 'Массажный кабинет', en: 'Massage Room' }, category: 'wellness' },
    ],
  },
  {
    id: 'services',
    label: { uz: 'Xizmatlar', ru: 'Услуги', en: 'Services' },
    amenities: [
      { id: 'supermarket', label: { uz: 'Supermarket', ru: 'Супермаркет', en: 'Supermarket' }, category: 'services' },
      { id: 'pharmacy', label: { uz: 'Apteka', ru: 'Аптека', en: 'Pharmacy' }, category: 'services' },
      { id: 'cafe', label: { uz: 'Kafe', ru: 'Кафе', en: 'Cafe' }, category: 'services' },
      { id: 'restaurant', label: { uz: 'Restoran', ru: 'Ресторан', en: 'Restaurant' }, category: 'services' },
      { id: 'bakery', label: { uz: 'Nonvoyxona', ru: 'Пекарня', en: 'Bakery' }, category: 'services' },
      { id: 'bank', label: { uz: 'Bank', ru: 'Банк', en: 'Bank' }, category: 'services' },
      { id: 'atm', label: { uz: 'Bankomat', ru: 'Банкомат', en: 'ATM' }, category: 'services' },
    ],
  },
  {
    id: 'education',
    label: { uz: 'Ta\'lim', ru: 'Образование', en: 'Education' },
    amenities: [
      { id: 'school', label: { uz: 'Maktab', ru: 'Школа', en: 'School' }, category: 'education' },
      { id: 'kindergarten', label: { uz: 'Bolalar bog\'i', ru: 'Детский сад', en: 'Kindergarten' }, category: 'education' },
      { id: 'library', label: { uz: 'Kutubxona', ru: 'Библиотека', en: 'Library' }, category: 'education' },
      { id: 'tutoring', label: { uz: 'Repetitorlik', ru: 'Репетиторство', en: 'Tutoring' }, category: 'education' },
    ],
  },
  {
    id: 'security',
    label: { uz: 'Xavfsizlik', ru: 'Безопасность', en: 'Security' },
    amenities: [
      { id: 'security', label: { uz: 'Xavfsizlik', ru: 'Охрана', en: 'Security' }, category: 'security' },
      { id: 'cctv', label: { uz: 'Video kuzatuv', ru: 'Видеонаблюдение', en: 'CCTV' }, category: 'security' },
      { id: 'intercom', label: { uz: 'Domofon', ru: 'Домофон', en: 'Intercom' }, category: 'security' },
      { id: 'gated', label: { uz: 'Yopiq hudud', ru: 'Закрытая территория', en: 'Gated' }, category: 'security' },
      { id: 'concierge', label: { uz: 'Konsyerj', ru: 'Консьерж', en: 'Concierge' }, category: 'security' },
    ],
  },
  {
    id: 'accessibility',
    label: { uz: 'Qulaylik', ru: 'Доступность', en: 'Accessibility' },
    amenities: [
      { id: 'wheelchair', label: { uz: 'G\'ildirakli stul', ru: 'Инвалидная коляска', en: 'Wheelchair Access' }, category: 'accessibility' },
      { id: 'elevator', label: { uz: 'Lift', ru: 'Лифт', en: 'Elevator' }, category: 'accessibility' },
      { id: 'ramp', label: { uz: 'Rampa', ru: 'Пандус', en: 'Ramp' }, category: 'accessibility' },
    ],
  },
  {
    id: 'building',
    label: { uz: 'Bino', ru: 'Здание', en: 'Building' },
    amenities: [
      { id: 'generator', label: { uz: 'Generator', ru: 'Генератор', en: 'Generator' }, category: 'building' },
      { id: 'wasteDisposal', label: { uz: 'Chiqqindilar', ru: 'Утилизация отходов', en: 'Waste Disposal' }, category: 'building' },
      { id: 'laundry', label: { uz: 'Prachka', ru: 'Прачечная', en: 'Laundry' }, category: 'building' },
      { id: 'storage', label: { uz: 'Omborxona', ru: 'Склад', en: 'Storage' }, category: 'building' },
    ],
  },
  {
    id: 'technology',
    label: { uz: 'Texnologiya', ru: 'Технологии', en: 'Technology' },
    amenities: [
      { id: 'wifi', label: { uz: 'Wi-Fi', ru: 'Wi-Fi', en: 'Wi-Fi' }, category: 'technology' },
      { id: 'fiberInternet', label: { uz: 'Fiber internet', ru: 'Оптоволоконный интернет', en: 'Fiber Internet' }, category: 'technology' },
      { id: 'smartHome', label: { uz: 'Aqlli uy', ru: 'Умный дом', en: 'Smart Home' }, category: 'technology' },
    ],
  },
  {
    id: 'pet',
    label: { uz: 'Hayvonlar', ru: 'Домашние животные', en: 'Pet' },
    amenities: [
      { id: 'petFriendly', label: { uz: 'Hayvonlarga do\'st', ru: 'Дружелюбно к животным', en: 'Pet Friendly' }, category: 'pet' },
      { id: 'dogPark', label: { uz: 'Itlar maydoni', ru: 'Площадка для собак', en: 'Dog Park' }, category: 'pet' },
    ],
  },
  {
    id: 'entertainment',
    label: { uz: 'Ko\'ngil ochar', ru: 'Развлечения', en: 'Entertainment' },
    amenities: [
      { id: 'cinema', label: { uz: 'Kinoteatr', ru: 'Кинотеатр', en: 'Cinema' }, category: 'entertainment' },
      { id: 'gameRoom', label: { uz: 'O\'yin xonasi', ru: 'Игровая комната', en: 'Game Room' }, category: 'entertainment' },
      { id: 'partyHall', label: { uz: 'Bayram zali', ru: 'Праздничный зал', en: 'Party Hall' }, category: 'entertainment' },
      { id: 'lounge', label: { uz: 'Lounge', ru: 'Лаунж', en: 'Lounge' }, category: 'entertainment' },
    ],
  },
  {
    id: 'medical',
    label: { uz: 'Tibbiy', ru: 'Медицинский', en: 'Medical' },
    amenities: [
      { id: 'medicalCenter', label: { uz: 'Tibbiy markaz', ru: 'Медицинский центр', en: 'Medical Center' }, category: 'medical' },
      { id: 'dentist', label: { uz: 'Stomatolog', ru: 'Стоматолог', en: 'Dentist' }, category: 'medical' },
    ],
  },
  {
    id: 'shopping',
    label: { uz: 'Sotuv', ru: 'Покупки', en: 'Shopping' },
    amenities: [
      { id: 'mall', label: { uz: 'Savdo markazi', ru: 'Торговый центр', en: 'Mall' }, category: 'shopping' },
      { id: 'shops', label: { uz: 'Do\'konlar', ru: 'Магазины', en: 'Shops' }, category: 'shopping' },
    ],
  },
  {
    id: 'business',
    label: { uz: 'Biznes', ru: 'Бизнес', en: 'Business' },
    amenities: [
      { id: 'businessCenter', label: { uz: 'Biznes markaz', ru: 'Бизнес центр', en: 'Business Center' }, category: 'business' },
      { id: 'coworking', label: { uz: 'Coworking', ru: 'Коворкинг', en: 'Coworking' }, category: 'business' },
      { id: 'conferenceRoom', label: { uz: 'Konferentsiya zali', ru: 'Конференц-зал', en: 'Conference Room' }, category: 'business' },
    ],
  },
];

export const NEARBY_PLACE_TYPES = [
  { id: 'metro', label: { uz: 'Metro', ru: 'Метро', en: 'Metro' } },
  { id: 'school', label: { uz: 'Maktab', ru: 'Школа', en: 'School' } },
  { id: 'kindergarten', label: { uz: 'Bolalar bog\'i', ru: 'Детский сад', en: 'Kindergarten' } },
  { id: 'hospital', label: { uz: 'Kasallxona', ru: 'Больница', en: 'Hospital' } },
  { id: 'supermarket', label: { uz: 'Supermarket', ru: 'Супермаркет', en: 'Supermarket' } },
  { id: 'mall', label: { uz: 'Savdo markazi', ru: 'Торговый центр', en: 'Mall' } },
  { id: 'park', label: { uz: 'Park', ru: 'Парк', en: 'Park' } },
  { id: 'cafe', label: { uz: 'Kafe', ru: 'Кафе', en: 'Cafe' } },
  { id: 'bank', label: { uz: 'Bank', ru: 'Банк', en: 'Bank' } },
  { id: 'busStop', label: { uz: 'Avtobus bekat', ru: 'Автобусная остановка', en: 'Bus Stop' } },
];

export function getAllAmenities(): Amenity[] {
  return AMENITY_CATEGORIES.flatMap((category) => category.amenities);
}

export function getAmenityById(id: string): Amenity | undefined {
  return getAllAmenities().find((amenity) => amenity.id === id);
}
