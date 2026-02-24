// Uzbekistan regions and districts data
export interface District {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
}

export interface Region {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  districts: District[];
}

export const regions: Region[] = [
  {
    id: 'toshkent-viloyati',
    nameUz: 'Toshkent viloyati',
    nameRu: 'Ташкентская область',
    nameEn: 'Tashkent Region',
    districts: [
      { id: 'bekobod', nameUz: "Bekobod tumani", nameRu: "Бекабадский район", nameEn: "Bekobod District" },
      { id: 'boka', nameUz: "Bo'ka tumani", nameRu: "Букинский район", nameEn: "Bo'ka District" },
      { id: 'bostonliq', nameUz: "Bo'stonliq tumani", nameRu: "Бостанлыкский район", nameEn: "Bo'stonliq District" },
      { id: 'chinoz', nameUz: 'Chinoz tumani', nameRu: 'Чиназский район', nameEn: 'Chinoz District' },
      { id: 'qibray', nameUz: 'Qibray tumani', nameRu: 'Кибрайский район', nameEn: 'Qibray District' },
      { id: 'ohangaron', nameUz: 'Ohangaron tumani', nameRu: 'Ахангаранский район', nameEn: 'Ohangaron District' },
      { id: 'oqkorgon', nameUz: "Oqqo'rg'on tumani", nameRu: 'Аккурганский район', nameEn: "Oqqo'rg'on District" },
      { id: 'parkent', nameUz: 'Parkent tumani', nameRu: 'Паркентский район', nameEn: 'Parkent District' },
      { id: 'piskent', nameUz: 'Piskent tumani', nameRu: 'Пискентский район', nameEn: 'Piskent District' },
      { id: 'quyi-chirchiq', nameUz: 'Quyi Chirchiq tumani', nameRu: 'Нижнечирчикский район', nameEn: 'Quyi Chirchiq District' },
      { id: 'yangiyol', nameUz: 'Yangiyo\'l tumani', nameRu: 'Янгиюльский район', nameEn: 'Yangiyo\'l District' },
      { id: 'yuqori-chirchiq', nameUz: 'Yuqori Chirchiq tumani', nameRu: 'Верхнечирчикский район', nameEn: 'Yuqori Chirchiq District' },
      { id: 'zangiota', nameUz: 'Zangiota tumani', nameRu: 'Зангиатинский район', nameEn: 'Zangiota District' },
    ],
  },
  {
    id: 'toshkent-shaxri',
    nameUz: 'Toshkent shaxri',
    nameRu: 'Город Ташкент',
    nameEn: 'Tashkent City',
    districts: [
      { id: 'bektemir', nameUz: 'Bektemir', nameRu: 'Бектемир', nameEn: 'Bektemir' },
      { id: 'chilonzor', nameUz: 'Chilonzor', nameRu: 'Чиланзар', nameEn: 'Chilonzor' },
      { id: 'mirobod', nameUz: 'Mirobod', nameRu: 'Мирабад', nameEn: 'Mirobod' },
      { id: 'mirzo-ulugbek', nameUz: 'Mirzo Ulug\'bek', nameRu: 'Мирзо-Улугбек', nameEn: 'Mirzo Ulug\'bek' },
      { id: 'olmazor', nameUz: 'Olmazor', nameRu: 'Алмазар', nameEn: 'Olmazor' },
      { id: 'sergeli', nameUz: 'Sergeli', nameRu: 'Сергели', nameEn: 'Sergeli' },
      { id: 'shayxontohur', nameUz: 'Shayxontohur', nameRu: 'Шайхантахур', nameEn: 'Shayxontohur' },
      { id: 'uchtepa', nameUz: 'Uchtepa', nameRu: 'Учтепа', nameEn: 'Uchtepa' },
      { id: 'yakkasaroy', nameUz: 'Yakkasaroy', nameRu: 'Яккасарай', nameEn: 'Yakkasaroy' },
      { id: 'yashnobod', nameUz: 'Yashnobod', nameRu: 'Яшнабад', nameEn: 'Yashnobod' },
      { id: 'yunusobod', nameUz: 'Yunusobod', nameRu: 'Юнусабад', nameEn: 'Yunusobod' },
      { id: 'yangihayot', nameUz: 'Yangihayot', nameRu: 'Янгихаёт', nameEn: 'Yangihayot' },
    ],
  },
];

// Helper function to get districts by region ID
export function getDistrictsByRegionId(regionId: string): District[] {
  const region = regions.find(r => r.id === regionId);
  return region ? region.districts : [];
}

// Helper function to get region by ID
export function getRegionById(regionId: string): Region | undefined {
  return regions.find(r => r.id === regionId);
}

// Helper function to get district by ID
export function getDistrictById(regionId: string, districtId: string): District | undefined {
  const region = getRegionById(regionId);
  return region?.districts.find(d => d.id === districtId);
}
