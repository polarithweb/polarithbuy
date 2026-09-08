import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  AlertTriangle, 
  Truck, 
  CreditCard,
  Package
} from 'lucide-react';
import type { CartItem } from '../types';
import { formatIndianCurrency } from '../utils/price';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}: CartDrawerProps) {
  // Calculate totals
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.numericPrice * item.quantity, 0);

  // Check accessories wholesale minimum (₹4,000)
  const accessoriesItems = items.filter((item) => item.department === 'accessories');
  const accessoriesSubtotal = accessoriesItems.reduce((sum, item) => sum + item.numericPrice * item.quantity, 0);
  const hasAccessories = accessoriesItems.length > 0;
  const meetsAccessoriesMinimum = !hasAccessories || accessoriesSubtotal >= 4000;

  // Check payment eligibility
  const hasPrepaidOnlyItem = items.some((item) => item.cashOnDeliveryEligible === false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
          />

          {/* Drawer content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Your Cart</h2>
                  <p className="text-xs text-slate-500">
                    {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-xs text-slate-400 hover:text-rose-600 transition-colors px-2 py-1 cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 divide-y divide-slate-100">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-400 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Explore our Books Hub, Custom PC Builds, or Tech Accessories and add products to your cart.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="pt-3.5 first:pt-0 flex items-center gap-3.5">
                    {/* Thumbnail */}
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 flex-shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {item.departmentName}
                        </span>
                        {item.cashOnDeliveryEligible === false && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                            Prepaid
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {item.title}
                      </h4>

                      <p className="text-xs font-semibold text-sky-700 mt-0.5">
                        {formatIndianCurrency(item.numericPrice)}
                      </p>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-l-lg transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-r-lg transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Total for item */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {formatIndianCurrency(item.numericPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout Button */}
            {items.length > 0 && (
              <div className="p-5 border-t border-slate-200 bg-slate-50/80 space-y-3">
                {/* Wholesale accessories warning if < ₹4,000 */}
                {hasAccessories && !meetsAccessoriesMinimum && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Wholesale Accessories Policy:</span>
                      <p className="mt-0.5 text-[11px] text-amber-700">
                        Tech accessories require a minimum order value of ₹4,000. Current accessories total: {formatIndianCurrency(accessoriesSubtotal)} (needs {formatIndianCurrency(4000 - accessoriesSubtotal)} more).
                      </p>
                    </div>
                  </div>
                )}

                {/* Delivery & Payment Badges */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 py-1">
                  <div className="flex items-center gap-1.5">
                    {hasPrepaidOnlyItem ? (
                      <>
                        <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-medium text-amber-700">Prepaid Checkout Required</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-medium text-emerald-700">Cash on Delivery Available</span>
                      </>
                    )}
                  </div>
                  <span className="text-slate-400">Standard Shipping</span>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-sm text-slate-600 font-medium">Subtotal</span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {formatIndianCurrency(subtotal)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  disabled={!meetsAccessoriesMinimum}
                  onClick={() => {
                    onClose();
                    onProceedToCheckout();
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    meetsAccessoriesMinimum
                      ? 'bg-slate-900 hover:bg-slate-800 text-white active:scale-[0.99]'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
