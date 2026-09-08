import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer id="hub-footer" className="w-full pt-10 pb-8 mt-auto border-t border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span className="font-medium text-slate-700">
            Made and managed by Priyam Kesh
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <span>Polarith Business Hub</span>
        </div>
      </div>
    </footer>
  );
}
