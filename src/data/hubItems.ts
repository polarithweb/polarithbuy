import { 
  Package, 
  Cpu, 
  BookOpen 
} from 'lucide-react';
import type { HubItem } from '../types';

export const HUB_ITEMS: HubItem[] = [
  {
    id: 'btn-tech-wholesale',
    title: 'Tech Accessories Wholesale',
    description: 'Bulk technology accessories, cables, peripherals, and commercial supply.',
    icon: Package,
  },
  {
    id: 'btn-pc-builds',
    title: 'PC Builds',
    description: 'Custom gaming PCs, workstation setups, and hardware assembly.',
    icon: Cpu,
  },
  {
    id: 'btn-books-hub',
    title: 'Books Hub',
    description: 'Curated collection of academic, technical, and literature books.',
    icon: BookOpen,
  },
];
