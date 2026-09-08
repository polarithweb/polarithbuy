import { motion } from 'motion/react';
import { ArrowLeft, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ComingSoonViewProps {
  title: string;
  icon: LucideIcon;
  onBack: () => void;
}

export function ComingSoonView({ title, icon: Icon, onBack }: ComingSoonViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto w-full px-4 text-center my-auto py-12"
    >
      <div className="mb-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hub</span>
        </button>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl bg-[#EAF4FF] border border-[#BFDBFE] shadow-sm flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-sky-200 text-sky-600 flex items-center justify-center mb-5 shadow-xs">
          <Icon className="w-8 h-8 stroke-[2]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-white text-sky-700 border border-sky-200 mb-4 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          Coming Soon
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-3">
          {title}
        </h2>

        <p className="text-slate-600 max-w-md text-base leading-relaxed mb-8">
          This division is currently under preparation and will be available soon. Check back for upcoming inventory and updates.
        </p>

        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all duration-200 cursor-pointer shadow-xs"
        >
          Return to Polarith Hub
        </button>
      </div>
    </motion.div>
  );
}
