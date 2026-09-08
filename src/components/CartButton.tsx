import { ShoppingBag } from 'lucide-react';
import type { CartItem } from '../types';
import { formatIndianCurrency } from '../utils/price';

interface CartButtonProps {
  items: CartItem[];
  onClick: () => void;
}

export function CartButton({ items, onClick }: CartButtonProps) {
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.numericPrice * item.quantity, 0);

  if (totalCount === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer active:scale-95 border border-slate-700"
      aria-label="View Cart"
    >
      <div className="relative">
        <ShoppingBag className="w-5 h-5 text-sky-400" />
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-extrabold text-[11px] flex items-center justify-center shadow-xs">
          {totalCount}
        </span>
      </div>

      <div className="text-left hidden sm:block">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
          Cart ({totalCount})
        </span>
        <span className="text-xs font-bold text-white">
          {formatIndianCurrency(totalAmount)}
        </span>
      </div>
    </button>
  );
}
