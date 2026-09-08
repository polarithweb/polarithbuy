import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  Bookmark, 
  Check, 
  Library,
  SlidersHorizontal,
  X,
  Sparkles,
  Banknote,
  CreditCard,
  Truck,
  ShoppingBag
} from 'lucide-react';
import type { Book } from '../data/booksData';
import { formatRupeePrice } from '../utils/price';

interface BooksHubViewProps {
  books: Book[];
  onBack: () => void;
  onOpenAdmin: (editBook?: Book) => void;
  onAddToCart?: (book: Book) => void;
  onOpenCart?: () => void;
  cartCount?: number;
}

export function BooksHubView({ 
  books, 
  onBack, 
  onOpenAdmin,
  onAddToCart,
  onOpenCart,
  cartCount = 0
}: BooksHubViewProps) {
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [codFilter, setCodFilter] = useState<'all' | 'cod' | 'prepaid'>('all');
  const [savedBooks, setSavedBooks] = useState<string[]>([]);
  const [activeModalBook, setActiveModalBook] = useState<Book | null>(null);

  const toggleSaveBook = (bookId: string) => {
    setSavedBooks((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const categories = useMemo(() => {
    const typesSet = new Set<string>();
    books.forEach((b) => {
      if (b.type) typesSet.add(b.type);
    });
    return ['All', ...Array.from(typesSet)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesCategory =
        selectedType === 'All' || book.type === selectedType;
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isCod = book.cashOnDeliveryEligible !== false;
      const matchesCod = 
        codFilter === 'all' ||
        (codFilter === 'cod' && isCod) ||
        (codFilter === 'prepaid' && !isCod);

      return matchesCategory && matchesSearch && matchesCod;
    });
  }, [books, selectedType, searchQuery, codFilter]);

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
              Books Hub
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-500">
              Browse publications with flexible payment options including Cash on Delivery.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title or author..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 text-slate-900 transition-all"
            />
          </div>
        </div>

        {/* Filters Bar: Category Chips and Cash on Delivery Menu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Type / Category Filters */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedType(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    selectedType === cat
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Cash on Delivery Selection Menu */}
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 w-fit shrink-0">
            <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-700">
              <Truck className="w-3.5 h-3.5 text-sky-600" />
              <label htmlFor="cod-menu-select" className="text-[11px] uppercase tracking-wider text-slate-500">
                COD Menu:
              </label>
            </div>
            <select
              id="cod-menu-select"
              value={codFilter}
              onChange={(e) => setCodFilter(e.target.value as 'all' | 'cod' | 'prepaid')}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 text-slate-800 cursor-pointer shadow-2xs"
            >
              <option value="all">All (COD & Prepaid)</option>
              <option value="cod">Cash on Delivery Eligible Only</option>
              <option value="prepaid">Prepaid Only (No COD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Cards Grid: Product Images on RIGHT side, PORTRAIT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 pb-12">
        {filteredBooks.map((book: Book) => {
          const isSaved = savedBooks.includes(book.id);
          const isCodEligible = book.cashOnDeliveryEligible !== false;

          return (
            <div
              key={book.id}
              className="flex flex-row items-stretch justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#EAF4FF] border border-[#BFDBFE] hover:border-[#93C5FD] transition-all duration-200 shadow-xs hover:shadow-md hover:shadow-sky-100/80"
            >
              {/* Left Side: Details & Actions */}
              <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white text-sky-800 border border-sky-200 shadow-2xs">
                      {book.type}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatRupeePrice(book.price, 499)}
                    </span>
                    {/* Cash on Delivery status badge */}
                    {isCodEligible ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                        <Banknote className="w-3 h-3 text-emerald-600" />
                        <span>COD Eligible</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                        <CreditCard className="w-3 h-3 text-amber-600" />
                        <span>Prepaid Only</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {book.title}
                  </h3>

                  <p className="text-xs font-medium text-slate-500 mt-1">
                    by {book.author || 'Polarith Editorial'}
                  </p>

                  {book.description && (
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                      {book.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-sky-200/60 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveModalBook(book)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer bg-slate-900 hover:bg-slate-800 text-white shadow-2xs"
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddToCart && onAddToCart(book)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 shadow-2xs"
                    title="Add to shopping cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleSaveBook(book.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-sky-600 text-white'
                        : 'bg-white text-slate-500 hover:text-sky-700 hover:bg-sky-50 border border-sky-200'
                    }`}
                    aria-label="Bookmark this product"
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Right Side: Portrait Product Image */}
              <div className="w-28 sm:w-32 md:w-36 aspect-[2/3] rounded-xl overflow-hidden bg-white border border-sky-200/80 flex-shrink-0 flex items-center justify-center self-center shadow-xs">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 text-center text-sky-400">
                    <BookOpen className="w-8 h-8 stroke-[1.5]" />
                    <span className="text-[10px] font-medium text-slate-400 mt-1">No Cover</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State when no books exist in Firestore or filter */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200/60 max-w-md mx-auto my-6 p-8">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {books.length === 0 ? 'No Products in Database' : 'No Matching Books Found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed">
            {books.length === 0 
              ? 'All hardcoded demo products have been removed. Open the Admin Portal to upload your real books and products.'
              : 'Try changing your payment mode filter (COD / Prepaid) or search term to see more results.'}
          </p>
          {books.length === 0 ? (
            <button
              type="button"
              onClick={() => onOpenAdmin()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-sky-400" />
              <span>Open Admin Portal to Add Products</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCodFilter('all');
                setSelectedType('All');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-500 transition-colors shadow-xs"
            >
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      )}

      {/* Product Detail Modal */}
      <AnimatePresence>
        {activeModalBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setActiveModalBook(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-row items-stretch gap-5">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                        {activeModalBook.type}
                      </span>
                      {activeModalBook.cashOnDeliveryEligible !== false ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Banknote className="w-3 h-3 text-emerald-700" />
                          <span>COD Eligible</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          <CreditCard className="w-3 h-3 text-amber-700" />
                          <span>Prepaid Only</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 leading-snug">
                      {activeModalBook.title}
                    </h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      by {activeModalBook.author || 'Polarith Editorial'}
                    </p>
                    {activeModalBook.description && (
                      <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                        {activeModalBook.description}
                      </p>
                    )}

                    {/* Delivery & Payment Note */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-sky-600" />
                        <span>Payment & Delivery Mode:</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {activeModalBook.cashOnDeliveryEligible !== false 
                          ? 'This publication is eligible for Cash on Delivery (COD) as well as prepaid online checkout.'
                          : 'This publication is Prepaid Only. Cash on Delivery is not available for this item.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-slate-900">
                      {formatRupeePrice(activeModalBook.price, 499)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (onAddToCart) onAddToCart(activeModalBook);
                        setActiveModalBook(null);
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
                  {activeModalBook.imageUrl ? (
                    <img
                      src={activeModalBook.imageUrl}
                      alt={activeModalBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-10 h-10 text-slate-300" />
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
