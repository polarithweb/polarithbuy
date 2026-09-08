import type { LucideIcon } from 'lucide-react';

export interface HubItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface CartItem {
  id: string; // unique cart item id (e.g. `${department}-${productId}`)
  productId: string;
  title: string;
  department: 'books' | 'pc_builds' | 'accessories';
  departmentName: string;
  price: string;
  numericPrice: number;
  quantity: number;
  imageUrl?: string;
  cashOnDeliveryEligible?: boolean;
  details?: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  department: 'books' | 'pc_builds' | 'accessories';
  departmentName: string;
  price: string;
  numericPrice: number;
  quantity: number;
  imageUrl?: string;
  details?: string;
}

export interface CustomerOrder {
  id?: string;
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  pinCode: string;
  items: OrderItem[];
  itemCount: number;
  totalAmount: number;
  formattedTotal: string;
  paymentMode: 'Cash on Delivery' | 'Prepaid (UPI / Online)';
  status: 'New' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  notes?: string;
}
