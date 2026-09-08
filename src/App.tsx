import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HubButton } from './components/HubButton';
import { Footer } from './components/Footer';
import { BooksHubView } from './components/BooksHubView';
import { PcBuildsHubView } from './components/PcBuildsHubView';
import { AccessoriesHubView } from './components/AccessoriesHubView';
import { UnifiedAdminPortal } from './components/UnifiedAdminPortal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CartButton } from './components/CartButton';
import { HUB_ITEMS } from './data/hubItems';
import { subscribeBooks } from './services/booksService';
import { subscribePcBuilds } from './services/pcBuildsService';
import { subscribeAccessories } from './services/accessoriesService';
import { parseNumericPrice, formatRupeePrice } from './utils/price';
import { Lock } from 'lucide-react';
import type { HubItem, CartItem } from './types';
import type { Book } from './data/booksData';
import type { PcBuild } from './data/pcBuildsData';
import type { Accessory } from './data/accessoriesData';

export default function App() {
  const [activeView, setActiveView] = useState<string>('hub');
  
  // Real-time Firestore State for each department
  const [books, setBooks] = useState<Book[]>([]);
  const [pcBuilds, setPcBuilds] = useState<PcBuild[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  // Cart & Checkout State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('polarith_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Synchronize cart with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('polarith_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to sync cart with localStorage:', e);
    }
  }, [cart]);

  // Real-time synchronization with Firebase Firestore
  useEffect(() => {
    const unsubBooks = subscribeBooks((updatedBooks) => {
      setBooks(updatedBooks);
    });

    const unsubPcBuilds = subscribePcBuilds((updatedBuilds) => {
      setPcBuilds(updatedBuilds);
    });

    const unsubAccessories = subscribeAccessories((updatedAccessories) => {
      setAccessories(updatedAccessories);
    });

    return () => {
      unsubBooks();
      unsubPcBuilds();
      unsubAccessories();
    };
  }, []);

  // Cart Item Handlers
  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const handleAddBookToCart = (book: Book) => {
    const rupeeStr = formatRupeePrice(book.price, 499);
    const numPrice = parseNumericPrice(rupeeStr);
    const cartItem: CartItem = {
      id: `book-${book.id}`,
      productId: book.id,
      title: book.title,
      department: 'books',
      departmentName: 'Books',
      price: rupeeStr,
      numericPrice: numPrice || 499,
      imageUrl: book.imageUrl,
      quantity: 1,
      cashOnDeliveryEligible: book.cashOnDeliveryEligible !== false,
      details: book.author ? `Author: ${book.author}` : undefined
    };
    addToCart(cartItem);
  };

  const handleAddPcBuildToCart = (build: PcBuild) => {
    const rupeeStr = formatRupeePrice(build.price, 49999);
    const numPrice = parseNumericPrice(rupeeStr);
    const cartItem: CartItem = {
      id: `pc-${build.id}`,
      productId: build.id,
      title: build.title,
      department: 'pc_builds',
      departmentName: 'PC Builds',
      price: rupeeStr,
      numericPrice: numPrice || 49999,
      imageUrl: build.imageUrl,
      quantity: 1,
      cashOnDeliveryEligible: false,
      details: build.specs ? `Specs: ${build.specs.slice(0, 70)}...` : undefined
    };
    addToCart(cartItem);
  };

  const handleAddAccessoryToCart = (item: Accessory) => {
    const rupeeStr = formatRupeePrice(item.price, 1499);
    const numPrice = parseNumericPrice(rupeeStr);
    const cartItem: CartItem = {
      id: `acc-${item.id}`,
      productId: item.id,
      title: item.title,
      department: 'accessories',
      departmentName: 'Tech Accessories',
      price: rupeeStr,
      numericPrice: numPrice || 1499,
      imageUrl: item.imageUrl,
      quantity: 1,
      cashOnDeliveryEligible: false,
      details: item.brand ? `Brand: ${item.brand}` : undefined
    };
    addToCart(cartItem);
  };

  const handleUpdateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = () => {
    setCart([]);
  };

  const handleButtonClick = (item: HubItem) => {
    setActiveView(item.id);
  };

  const handleBackToHub = () => {
    setActiveView('hub');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isPublicView = activeView === 'hub' || activeView.startsWith('btn-');

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-sky-200 selection:text-sky-900">
      <AnimatePresence mode="wait">
        {/* Main Hub View */}
        {activeView === 'hub' && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16"
          >
            {/* Header */}
            <header id="hub-header" className="text-center mb-10 sm:mb-14">
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                  Polarith Business Hub
                </h1>
                <p className="mt-3 text-base sm:text-lg text-slate-500 max-w-md mx-auto">
                  Select a service to get started
                </p>
              </motion.div>
            </header>

            {/* 3 Light Blue Buttons Grid */}
            <main id="hub-buttons-container" className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {HUB_ITEMS.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.06 }}
                    className="h-full flex"
                  >
                    <HubButton item={item} onClick={handleButtonClick} />
                  </motion.div>
                ))}
              </div>

              {/* Single small admin portal button at the bottom of the main page */}
              <div className="mt-14 flex justify-center">
                <button
                  type="button"
                  onClick={() => setActiveView('unified-admin')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
                  title="Unified Admin Portal"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Admin Portal</span>
                </button>
              </div>
            </main>
          </motion.div>
        )}

        {/* Public Books Hub View */}
        {activeView === 'btn-books-hub' && (
          <div key="books-hub" className="flex-1 flex flex-col">
            <BooksHubView
              books={books}
              onBack={handleBackToHub}
              onAddToCart={handleAddBookToCart}
              onOpenCart={() => setIsCartOpen(true)}
              cartCount={totalCartCount}
            />
          </div>
        )}

        {/* Public PC Builds View */}
        {activeView === 'btn-pc-builds' && (
          <div key="pc-builds" className="flex-1 flex flex-col">
            <PcBuildsHubView
              builds={pcBuilds}
              onBack={handleBackToHub}
              onAddToCart={handleAddPcBuildToCart}
              onOpenCart={() => setIsCartOpen(true)}
              cartCount={totalCartCount}
            />
          </div>
        )}

        {/* Public Tech Accessories Wholesale View */}
        {activeView === 'btn-tech-wholesale' && (
          <div key="tech-wholesale" className="flex-1 flex flex-col">
            <AccessoriesHubView
              accessories={accessories}
              onBack={handleBackToHub}
              onAddToCart={handleAddAccessoryToCart}
              onOpenCart={() => setIsCartOpen(true)}
              cartCount={totalCartCount}
            />
          </div>
        )}

        {/* Unified Admin Portal (Books, PC Builds, Accessories, Orders) */}
        {(activeView === 'unified-admin' || activeView.includes('admin')) && (
          <div key="unified-admin" className="flex-1 flex flex-col">
            <UnifiedAdminPortal
              onBack={handleBackToHub}
              books={books}
              builds={pcBuilds}
              accessories={accessories}
              initialTab={
                activeView === 'books-admin' ? 'books' :
                activeView === 'pc-admin' ? 'pc-builds' :
                activeView === 'accessories-admin' ? 'accessories' :
                'orders'
              }
            />
          </div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button in public views */}
      {isPublicView && (
        <CartButton
          items={cart}
          onClick={() => setIsCartOpen(true)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        items={cart}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
