// Sample test data for use in tests

export const sampleCategory = {
  id: 1,
  categoryType: 'food',
  onlineShopLink: [],
  productType: 'Mineral water',
  description: '1.5 liter bottles',
  quantity: 60,
  usualExpiryCheckDays: 180,
  quantityOverride: '',
  defaultUnit: '1.5l bottle',
  functionOfPeople: 'yes',
  functionOfDays: 'yes',
  recommendedQtyDayAdult: 3,
  quantityMultiplier: 2,
}

export const sampleCategoryNotPeopleBased = {
  id: 18,
  categoryType: 'food',
  onlineShopLink: [],
  productType: 'Spices',
  description: 'Salt, pepper, sugar',
  quantity: 1,
  usualExpiryCheckDays: 365,
  defaultUnit: 'packs',
  functionOfPeople: 'no',
  functionOfDays: 'yes',
  recommendedQtyDayAdult: 1,
  quantityMultiplier: 0.033,
}

export const sampleCategoryEquipment = {
  id: 29,
  categoryType: 'equipment',
  onlineShopLink: [],
  productType: 'Flashlight',
  description: '',
  quantity: 1,
  usualExpiryCheckDays: 365,
  defaultUnit: 'pieces',
  functionOfPeople: 'no',
  functionOfDays: 'no',
  recommendedQtyDayAdult: 1,
  quantityMultiplier: 1,
}

export const sampleProductCategories = {
  lastUpdate: '2025-01-01T00:00:00.000Z',
  baseCategories: [
    {
      id: 1,
      categoryType: 'food',
      onlineShopLink: [],
      productType: 'Mineral water',
      description: '1.5 liter bottles',
      quantity: 60,
      usualExpiryCheckDays: 180,
      quantityOverride: '',
      defaultUnit: '1.5l bottle',
    },
    {
      id: 2,
      categoryType: 'food',
      onlineShopLink: [],
      productType: 'Rice',
      description: '500g packs',
      quantity: 10,
      usualExpiryCheckDays: 365,
      quantityOverride: '',
      defaultUnit: '500g packs',
    },
    {
      id: 3,
      categoryType: 'consumable',
      onlineShopLink: [],
      productType: 'Toilet paper',
      description: 'Multi-roll packs',
      quantity: 3,
      usualExpiryCheckDays: 365,
      quantityOverride: '',
      defaultUnit: 'packs',
    },
  ],
}

export const sampleStock = {
  products: [
    {
      typeId: 1,
      description: 'Evian water',
      quantity: 20,
      checkedDate: '2025-01-01',
      nextCheck: '2025-07-01',
    },
    {
      typeId: 1,
      description: 'Volvic water',
      quantity: 15,
      checkedDate: '2025-01-01',
      nextCheck: '2025-07-01',
    },
    {
      typeId: 2,
      description: 'Basmati rice',
      quantity: 5,
      checkedDate: '2025-01-01',
      nextCheck: '2026-01-01',
    },
  ],
}

export const sampleStockWithExpired = {
  products: [
    {
      typeId: 1,
      description: 'Old water',
      quantity: 10,
      checkedDate: '2024-01-01',
      nextCheck: '2024-07-01', // Expired
    },
    {
      typeId: 2,
      description: 'Fresh rice',
      quantity: 5,
      checkedDate: '2025-01-01',
      nextCheck: '2026-01-01', // Not expired
    },
  ],
}

export const sampleUserProfile = {
  language: 'en_US',
  nbPeople: 2,
  nbDays: 30,
}

// Template category for quantity function testing
export const templateCategoryWithMultiplier = {
  id: 1,
  functionOfPeople: 'yes',
  functionOfDays: 'yes',
  quantityMultiplier: 2,
}

export const templateCategoryNoPeople = {
  id: 2,
  functionOfPeople: 'no',
  functionOfDays: 'yes',
  quantityMultiplier: 0.5,
}

export const templateCategoryNoDays = {
  id: 3,
  functionOfPeople: 'yes',
  functionOfDays: 'no',
  quantityMultiplier: 1,
}

export const templateCategoryFixed = {
  id: 4,
  functionOfPeople: 'no',
  functionOfDays: 'no',
  quantityMultiplier: 1,
}

export const templateCategoryZeroMultiplier = {
  id: 5,
  functionOfPeople: 'yes',
  functionOfDays: 'yes',
  quantityMultiplier: 0,
}

export const templateCategoryNoMultiplier = {
  id: 6,
  functionOfPeople: 'yes',
  functionOfDays: 'yes',
  // quantityMultiplier is missing/undefined
}
