export interface Accessory {
  id: string;
  title: string;
  category: string; // 'Earbuds' | 'Neckbands' | 'Powerbanks' | 'Smartwatch'
  brand?: string;
  price: string;
  rating?: number;
  description: string;
  imageUrl?: string;
  inStock?: boolean;
  createdAt?: string;
}

export const ACCESSORY_CATEGORIES = [
  'Earbuds',
  'Neckbands',
  'Powerbanks',
  'Smartwatch',
] as const;

export type AccessoryCategory = typeof ACCESSORY_CATEGORIES[number];
