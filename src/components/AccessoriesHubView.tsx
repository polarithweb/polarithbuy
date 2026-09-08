import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Package, 
  Bookmark, 
  Check, 
  SlidersHorizontal,
  X,
  Sparkles,
  CreditCard,
  AlertCircle,
  Info,
  ShoppingBag
} from 'lucide-react';
import { ACCESSORY_CATEGORIES } from '../data/accessoriesData';
import type { Accessory } from '../data/accessoriesData';
import { formatRupeePrice } from '../utils/price';

interface AccessoriesHubViewProps {
  accessories: Accessory[];
  onBack: () => void;
  onOpenAdmin: (editAccessory?: Accessory) => void;
  onAddToCart?: (accessory: Accessory) => void;
  onOpenCart?: () => void;
  cartCount?: number;
}

export function AccessoriesHubView({ 
  accessories, 
  onBack, 
  onOpenAdmin,
  onAddToCart,
  onOpenCart,
  cartCount = 0
}: AccessoriesHubViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [activeModalItem, setActiveModalItem] = useState<Accessory | null>(null);

  const toggleSaveItem = (itemId: string) => {
    setSavedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const categories = ['All', ...ACCESSORY_CATEGORIES];

  const filteredAccessories = useMemo(() => {
    return accessories.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [accessories, selectedCategory, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10"
    >
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hub</span>
        </button>

        <div className="flex items-center gap-2.5">
          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition-all cursor-pointer shadow-2xs"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenAdmin()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#EAF4FF] hover:bg-[#DDECFC] text-sky-800 border border-[#BFDBFE] hover:border-[#93C5FD] transition-all cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>

      {/* Main Title & Search */}
      <div className="pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Tech Accessories Wholesale
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">
              Bulk wholesale inventory for earbuds, neckbands, powerbanks, and smartwatches.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accessories or specs..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 text-slate-900 transition-all"
            />
          </div>
        </div>

        {/* 4 Categories Filter Tabs: earbuds, neckbands, powerbanks, smartwatch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Minimum Order & Prepaid Requirement Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900 w-fit shrink-0">
            <CreditCard className="w-3.5 h-3.5 text-amber-700" />
            <span>Prepaid Only • Min. Order ₹4,000</span>
          </div>
        </div>
      </div>

      {/* Accessories Grid: Product Images on RIGHT side, PORTRAIT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 pb-12">
        {filteredAccessories.map((item: Accessory) => {
          const isSaved = savedItems.includes(item.id);

          return (
            <div
              key={item.id}
              className="flex flex-row items-stretch justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#EAF4FF] border border-[#BFDBFE] hover:border-[#93C5FD] transition-all duration-200 shadow-xs hover:shadow-md hover:shadow-sky-100/80"
            >
              {/* Left Side: Details & Actions */}
              <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white text-sky-800 border border-sky-200 shadow-2xs">
                      {item.category}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatRupeePrice(item.price, 1499)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                      <CreditCard className="w-3 h-3 text-amber-600" />
                      <span>Prepaid • Min ₹4,000</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  {item.brand && (
                    <p className="text-xs font-semibold text-sky-800 mt-1 line-clamp-2">
                      {item.brand}
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-sky-200/60 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveModalItem(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer bg-slate-900 hover:bg-slate-800 text-white shadow-2xs"
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddToCart && onAddToCart(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 shadow-2xs"
                    title="Add to shopping cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSaveItem(item.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-sky-600 text-white'
                        : 'bg-white text-slate-500 hover:text-sky-700 hover:bg-sky-50 border border-sky-200'
                    }`}
                    aria-label="Bookmark this accessory"
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Right Side: Portrait Product Image */}
              <div className="w-28 sm:w-32 md:w-36 aspect-[2/3] rounded-xl overflow-hidden bg-white border border-sky-200/80 flex-shrink-0 flex items-center justify-center self-center shadow-xs">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-center text-sky-400">
                    <Package className="w-8 h-8 stroke-[1.5]" />
                    <span className="text-[10px] font-medium text-slate-400 mt-1">No Image</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State when no accessories exist in Firestore */}
      {filteredAccessories.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200/60 max-w-md mx-auto my-6 p-8">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Accessories in Database</h3>
          <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed">
            All hardcoded demo items have been removed. Open the Admin Portal to upload products in Earbuds, Neckbands, Powerbanks, or Smartwatch categories.
          </p>
          <button
            type="button"
            onClick={() => onOpenAdmin()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-sky-400" />
            <span>Open Admin Portal to Add Accessories</span>
          </button>
        </div>
      )}

      {/* Accessory Detail Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-row items-stretch gap-5">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200 mb-2">
                      {activeModalItem.category}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 leading-snug">
                      {activeModalItem.title}
                    </h2>
                    {activeModalItem.brand && (
                      <p className="text-xs font-bold text-sky-700 mt-1">
                        {activeModalItem.brand}
                      </p>
                    )}
                    {activeModalItem.description && (
                      <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                        {activeModalItem.description}
                      </p>
                    )}

                    {/* Order & Payment Terms Notice */}
                    <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80">
                      <p className="text-[11px] font-semibold text-amber-950 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                        <span>Order Policy: 100% Prepaid • Minimum Order ₹4,000</span>
                      </p>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        Accessories orders require a minimum basket total of ₹4,000. All orders are strictly prepaid online. Cash on Delivery is not available for accessories.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-slate-900">
                      {formatRupeePrice(activeModalItem.price, 1499)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (onAddToCart) onAddToCart(activeModalItem);
                        setActiveModalItem(null);
                        if (onOpenCart) onOpenCart();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>

                {/* Portrait modal image on right */}
                <div className="w-36 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 flex items-center justify-center self-center shadow-xs">
                  {activeModalItem.imageUrl ? (
                    <img
                      src={activeModalItem.imageUrl}
                      alt={activeModalItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-10 h-10 text-slate-300" />
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
