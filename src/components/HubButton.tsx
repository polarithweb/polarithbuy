import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import type { HubItem } from '../types';

interface HubButtonProps {
  item: HubItem;
  onClick?: (item: HubItem) => void;
}

export function HubButton({ item, onClick }: HubButtonProps) {
  const Icon = item.icon;

  return (
    <motion.button
      id={item.id}
      type="button"
      onClick={() => onClick?.(item)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group relative text-left w-full h-full flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#EAF4FF] hover:bg-[#DDECFC] border border-[#BFDBFE] hover:border-[#93C5FD] transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-sky-100/80 cursor-pointer overflow-hidden"
    >
      {/* Top row: Arrow SVG */}
      <div className="flex items-center justify-end mb-4 w-full">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/90 border border-sky-200/80 text-sky-600 group-hover:text-sky-700 group-hover:bg-white transition-all shadow-xs">
          <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>

      {/* Icon, Title, and Description */}
      <div className="flex flex-col gap-3.5 flex-1">
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-sky-200/70 text-sky-600 group-hover:scale-105 group-hover:text-sky-700 transition-all duration-200 shadow-xs">
          <Icon className="w-6 h-6 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-sky-950 transition-colors">
            {item.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            {item.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
