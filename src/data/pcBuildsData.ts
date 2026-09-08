export interface PcBuild {
  id: string;
  title: string;
  category: string; // 'Budget' | 'Gaming' | 'Editing and Efficiency'
  specs?: string;
  price: string;
  rating?: number;
  description: string;
  imageUrl?: string;
  inStock?: boolean;
  createdAt?: string;
}

export const PC_BUILD_CATEGORIES = [
  'Budget',
  'Gaming',
  'Editing and Efficiency',
] as const;

export type PcBuildCategory = typeof PC_BUILD_CATEGORIES[number];
