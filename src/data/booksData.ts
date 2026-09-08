export interface Book {
  id: string;
  title: string;
  type: string;
  author: string;
  price: string;
  rating?: number;
  description: string;
  imageUrl?: string;
  inStock?: boolean;
  cashOnDeliveryEligible?: boolean;
  createdAt?: string;
}

export const BOOK_TYPES = [
  'Technology',
  'Business',
  'Academic',
  'Literature',
  'Science',
  'Design & Architecture',
  'Philosophy & Psychology',
  'General',
] as const;
